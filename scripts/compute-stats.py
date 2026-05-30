#!/usr/bin/env python3
"""
Compute proof-of-progress activity stats and write data/stats.json.

Uses a hybrid approach:
  - GraphQL for repo metadata (stars, issues, PRs, default branch).
  - GraphQL with cursor pagination for branch list (handles repos with 700+ branches).
  - REST with --paginate for commit history per active branch (handles branches
    with 200+ commits in the window).

This fixes two silent truncation bugs in the original single-query approach:
  - refs(first: 100) missed branches beyond the first 100 (mx-chain-go has 699).
  - history(first: 100) dropped older commits on active branches (rc/v0.67 has 200+).

Usage:
    python3 scripts/compute-stats.py [output_path]

Default output: data/stats.json (relative to cwd).
"""

import subprocess
import json
import sys
import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone

# -- Configuration -----------------------------------------------------------

ORG = 'multiversx'

WATCHLIST = [
    'mx-chain-go',
    'mx-chain-vm-go',
    'mx-sdk-js-core',
    'mx-sdk-dapp',
    'mx-sdk-rs',
    'mx-template-dapp',
    'mx-chain-proxy-go',
    'mx-chain-simulator-go',
    'mx-specs',
    'mx-bridge-eth-go',
    'mx-chain-tools-go',
    'mx-api-service',
    'mx-chain-es-indexer-go',
    'mx-chain-mainnet-config',
]

HIGHLIGHTED_CONTRIBUTORS = {'sasurobert'}

WINDOW_DAYS = 28


# -- gh CLI helpers ----------------------------------------------------------

def log(msg):
    print(msg, file=sys.stderr, flush=True)


def gh_api_rest(path):
    """Run `gh api <path>`, return parsed JSON or None."""
    result = subprocess.run(
        ['gh', 'api', path], capture_output=True, text=True,
    )
    if result.returncode != 0:
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return None


def gh_api_paginate(path):
    """Run `gh api --paginate <path>`, return parsed JSON array or empty list."""
    result = subprocess.run(
        ['gh', 'api', '--paginate', path], capture_output=True, text=True,
    )
    if result.returncode != 0:
        return []
    try:
        parsed = json.loads(result.stdout)
        return parsed if isinstance(parsed, list) else []
    except json.JSONDecodeError:
        return []


def gh_graphql(query, variables):
    """Run a GraphQL query via gh api. Returns parsed .data.repository or None."""
    args = ['gh', 'api', 'graphql', '-f', f'query={query}']
    for k, v in variables.items():
        args += ['-f', f'{k}={v}']
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode != 0:
        log(f'    GraphQL failed: {result.stderr.strip()[:200]}')
        return None
    try:
        return json.loads(result.stdout).get('data', {}).get('repository')
    except json.JSONDecodeError:
        return None


# -- GraphQL queries ---------------------------------------------------------

# Repo metadata only — called once per repo.
REPO_META_QUERY = """
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    stargazerCount
    description
    defaultBranchRef { name }
    issues(states: OPEN) { totalCount }
    pullRequests(states: OPEN) { totalCount }
  }
}
"""

# One page of branch names + HEAD committed date.
# $after is omitted on the first call (GraphQL treats missing nullable var as null).
REFS_PAGE_QUERY = """
query($owner: String!, $name: String!, $after: String) {
  repository(owner: $owner, name: $name) {
    refs(first: 100, refPrefix: "refs/heads/", after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name
        target {
          ... on Commit {
            committedDate
          }
        }
      }
    }
  }
}
"""


# -- Per-repo processing ----------------------------------------------------

def fetch_active_branches(repo, since_iso):
    """
    Return list of branch names whose HEAD committed date is within the window.
    Paginates through all branches so repos with 700+ branches are fully covered.
    """
    active = []
    cursor = None
    page = 0
    while True:
        page += 1
        variables = {'owner': ORG, 'name': repo}
        if cursor:
            variables['after'] = cursor
        data = gh_graphql(REFS_PAGE_QUERY, variables)
        if data is None:
            break
        refs = data.get('refs') or {}
        for node in refs.get('nodes', []):
            committed = (node.get('target') or {}).get('committedDate', '')
            if committed >= since_iso:
                active.append(node['name'])
        page_info = refs.get('pageInfo') or {}
        if not page_info.get('hasNextPage'):
            break
        cursor = page_info.get('endCursor')
        if not cursor:
            break
    return active


def fetch_branch_commits(repo, branch, since_iso):
    """
    Fetch all commits on `branch` since `since_iso` via paginated REST.
    Returns a list of raw REST commit objects.
    """
    full = f'{ORG}/{repo}'
    # URL-encode the branch name in case it contains slashes
    from urllib.parse import quote
    encoded = quote(branch, safe='')
    path = f'/repos/{full}/commits?sha={encoded}&since={since_iso}&per_page=100'
    return gh_api_paginate(path)


def rest_commit_to_common(c):
    """Normalise a REST commit object to the fields we use downstream."""
    commit_data = c.get('commit') or {}
    author_date = (commit_data.get('author') or {}).get('date', '')
    committer_date = (commit_data.get('committer') or {}).get('date', '')
    # Use committer date (matches `since=` filter semantics); fall back to author date.
    committed_date = committer_date or author_date
    headline = (commit_data.get('message') or '').split('\n')[0][:80]
    gh_author = c.get('author') or {}
    return {
        'oid': c.get('sha', ''),
        'committedDate': committed_date,
        'messageHeadline': headline,
        'login': gh_author.get('login'),
        'avatarUrl': gh_author.get('avatar_url'),
    }


def fetch_repo(repo, since_dt, seven_days_ago_dt):
    """Fetch + process one repo. Returns the structured dict or None."""
    since_iso = since_dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    seven_iso = seven_days_ago_dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    full = f'{ORG}/{repo}'

    # ---- Step 1: repo metadata (single GraphQL call) ----
    meta = gh_graphql(REPO_META_QUERY, {'owner': ORG, 'name': repo})
    if meta is None:
        return None

    # ---- Step 2: collect all active branches (paginated GraphQL) ----
    active_branches = fetch_active_branches(repo, since_iso)
    if not active_branches:
        # Repo has no branch activity in the window — return a stub.
        return {
            'name': repo,
            'full_name': full,
            'url': f'https://github.com/{full}',
            'description': meta.get('description') or '',
            'stars': meta.get('stargazerCount', 0),
            'open_issues': (meta.get('issues') or {}).get('totalCount', 0),
            'open_prs': (meta.get('pullRequests') or {}).get('totalCount', 0),
            'default_branch': (meta.get('defaultBranchRef') or {}).get('name', 'main'),
            'commits_28d': 0,
            'commits_7d': 0,
            'prs_merged_28d': 0,
            'contributors_28d': 0,
            'last_commit_at': None,
            'last_commit_message': None,
            'weekly_commits': [0] * 12,
            '_all_commits': [],
            '_merged_prs_raw': [],
            '_releases_raw': gh_api_rest(f'/repos/{full}/releases?per_page=5') or [],
        }

    # ---- Step 3: fetch commits for each active branch (paginated REST) ----
    seen_oids = set()
    all_commits = []
    for branch in active_branches:
        raw = fetch_branch_commits(repo, branch, since_iso)
        for c in raw:
            normalized = rest_commit_to_common(c)
            oid = normalized['oid']
            if not oid or oid in seen_oids:
                continue
            seen_oids.add(oid)
            all_commits.append(normalized)

    # Sort newest-first
    all_commits.sort(key=lambda c: c.get('committedDate') or '', reverse=True)

    commits_28d = len(all_commits)
    commits_7d = sum(
        1 for c in all_commits
        if (c.get('committedDate') or '') >= seven_iso
    )

    contributors = {
        c['login'] for c in all_commits if c.get('login')
    }

    last_commit_at = all_commits[0].get('committedDate') if all_commits else None
    last_commit_msg = (
        all_commits[0].get('messageHeadline', '')[:80]
        if all_commits else None
    )

    # ---- Weekly commit buckets (last 12 weeks) ----
    now = datetime.now(timezone.utc)
    weekly_buckets = [0] * 12
    for c in all_commits:
        cd = c.get('committedDate')
        if not cd:
            continue
        try:
            dt = datetime.fromisoformat(cd.replace('Z', '+00:00'))
        except ValueError:
            continue
        weeks_ago = int((now - dt).total_seconds() // (7 * 86400))
        if 0 <= weeks_ago < 12:
            weekly_buckets[11 - weeks_ago] += 1
    weekly_commits = weekly_buckets

    # ---- REST: PRs and releases ----
    merged_prs_result = subprocess.run([
        'gh', 'pr', 'list', '--repo', full, '--state', 'merged',
        '--search', f'merged:>={since_iso[:10]}',
        '--json', 'number,author,mergedAt', '--limit', '200',
    ], capture_output=True, text=True)
    try:
        merged_prs = json.loads(merged_prs_result.stdout) if merged_prs_result.returncode == 0 else []
    except json.JSONDecodeError:
        merged_prs = []

    releases = gh_api_rest(f'/repos/{full}/releases?per_page=5') or []

    return {
        'name': repo,
        'full_name': full,
        'url': f'https://github.com/{full}',
        'description': meta.get('description') or '',
        'stars': meta.get('stargazerCount', 0),
        'open_issues': (meta.get('issues') or {}).get('totalCount', 0),
        'open_prs': (meta.get('pullRequests') or {}).get('totalCount', 0),
        'default_branch': (meta.get('defaultBranchRef') or {}).get('name', 'main'),
        'commits_28d': commits_28d,
        'commits_7d': commits_7d,
        'prs_merged_28d': len(merged_prs),
        'contributors_28d': len(contributors),
        'last_commit_at': last_commit_at,
        'last_commit_message': last_commit_msg,
        'weekly_commits': weekly_commits,
        # Internal — stripped before output
        '_all_commits': all_commits,
        '_merged_prs_raw': merged_prs,
        '_releases_raw': releases,
    }


# -- Main aggregation --------------------------------------------------------

def main():
    output_path = sys.argv[1] if len(sys.argv) > 1 else 'data/stats.json'

    now = datetime.now(timezone.utc)
    window_end = now
    window_start = window_end - timedelta(days=WINDOW_DAYS)
    seven_days_ago = window_end - timedelta(days=7)

    log(f'Window: {window_start.strftime("%Y-%m-%d")} → '
        f'{window_end.strftime("%Y-%m-%d")} ({WINDOW_DAYS}d)')
    log(f'Fetching {len(WATCHLIST)} repos via GraphQL + REST (all branches, paginated)...')

    repos_data = []
    for repo in WATCHLIST:
        log(f'  {repo}...')
        data = fetch_repo(repo, window_start, seven_days_ago)
        if data:
            log(f'    → {data["commits_28d"]} commits across branches, '
                f'{data["prs_merged_28d"]} PRs merged')
            repos_data.append(data)
        else:
            log(f'    → SKIPPED')

    if not repos_data and WATCHLIST:
        log('')
        log('ERROR: all repos skipped — GitHub auth unavailable.')
        log('Set GH_TOKEN or run `gh auth login`, then retry.')
        log('Aborting without overwriting stats.json.')
        sys.exit(1)

    # ----- Top contributors (across all repos, deduped by oid) -----
    contributor_commits = defaultdict(int)
    contributor_repos = defaultdict(set)
    contributor_prs = defaultdict(int)
    contributor_avatars = {}

    for r in repos_data:
        for c in r['_all_commits']:
            login = c.get('login')
            if not login:
                continue
            contributor_commits[login] += 1
            contributor_repos[login].add(r['full_name'])
            if c.get('avatarUrl'):
                contributor_avatars[login] = c['avatarUrl']
        for pr in r['_merged_prs_raw']:
            pra = pr.get('author')
            if pra and pra.get('login'):
                contributor_prs[pra['login']] += 1

    top_logins = sorted(
        contributor_commits.keys(),
        key=lambda l: (-contributor_commits[l], -contributor_prs.get(l, 0)),
    )[:10]

    # Always include highlighted contributors who made any commits
    for hc in HIGHLIGHTED_CONTRIBUTORS:
        if hc in contributor_commits and hc not in top_logins:
            top_logins.append(hc)

    top_contributors_data = [
        {
            'login': l,
            'avatar_url': contributor_avatars.get(l, f'https://github.com/{l}.png'),
            'html_url': f'https://github.com/{l}',
            'commits_28d': contributor_commits[l],
            'prs_merged_28d': contributor_prs.get(l, 0),
            'repos_touched': len(contributor_repos[l]),
            'highlighted': l in HIGHLIGHTED_CONTRIBUTORS,
        }
        for l in top_logins
    ]

    # ----- Recent releases (most recent 15 across watchlist) -----
    all_releases = []
    for r in repos_data:
        for rel in r['_releases_raw']:
            pub = rel.get('published_at')
            if not pub:
                continue
            all_releases.append({
                'repo': r['name'],
                'tag': rel.get('tag_name', ''),
                'name': rel.get('name') or rel.get('tag_name', ''),
                'published_at': pub,
                'url': rel.get('html_url', ''),
                'is_prerelease': bool(rel.get('prerelease', False)),
            })
    all_releases.sort(key=lambda x: x['published_at'], reverse=True)
    recent_releases = all_releases[:15]

    # ----- Daily commits across watchlist (28-day heatmap) -----
    daily_buckets = defaultdict(int)
    for r in repos_data:
        for c in r['_all_commits']:
            cd = c.get('committedDate')
            if not cd:
                continue
            daily_buckets[cd[:10]] += 1

    window_start_date = window_start.replace(hour=0, minute=0, second=0, microsecond=0)
    daily_commits = []
    for i in range(WINDOW_DAYS):
        d = window_start_date + timedelta(days=i)
        daily_commits.append(daily_buckets.get(d.strftime('%Y-%m-%d'), 0))

    # ----- Totals -----
    total_commits = sum(r['commits_28d'] for r in repos_data)
    total_prs_merged = sum(r['prs_merged_28d'] for r in repos_data)

    opened_window = gh_api_rest(
        f'/search/issues?q=org:{ORG}+is:pr+created:>='
        f'{window_start.strftime("%Y-%m-%d")}&per_page=1'
    )
    total_prs_opened = (
        opened_window.get('total_count', total_prs_merged)
        if isinstance(opened_window, dict)
        else total_prs_merged
    )

    repos_active = sum(1 for r in repos_data if r['commits_28d'] > 0)

    # Sort repos by 28d commits (descending)
    repos_data.sort(key=lambda r: -r['commits_28d'])

    # Strip internal fields
    repos_clean = [
        {k: v for k, v in r.items() if not k.startswith('_')}
        for r in repos_data
    ]

    output = {
        'generated_at': now.strftime('%Y-%m-%dT%H:%M:%SZ'),
        'window': {
            'start': window_start.strftime('%Y-%m-%d'),
            'end': window_end.strftime('%Y-%m-%d'),
            'days': WINDOW_DAYS,
        },
        'totals': {
            'commits': total_commits,
            'prs_merged': total_prs_merged,
            'prs_opened': total_prs_opened,
            'contributors': len(contributor_commits),
            'releases': len(recent_releases),
            'repos_active': repos_active,
        },
        'repos': repos_clean,
        'top_contributors': top_contributors_data,
        'recent_releases': recent_releases,
        'daily_commits': daily_commits,
    }

    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

    log('')
    log(f'Wrote {output_path}')
    log(f'  commits: {total_commits}  PRs merged: {total_prs_merged}  '
        f'PRs opened: {total_prs_opened}  contributors: {len(contributor_commits)}  '
        f'releases: {len(recent_releases)}')
    log(f'  repos active: {repos_active}/{len(repos_data)}')
    if top_contributors_data:
        log(f'  top contributor: @{top_contributors_data[0]["login"]} '
            f'({top_contributors_data[0]["commits_28d"]} commits)')


if __name__ == '__main__':
    main()
