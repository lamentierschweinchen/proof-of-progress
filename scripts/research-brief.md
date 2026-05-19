# Daily research brief — MultiversX Proof of Progress

You are the scheduled-runs agent for the `proof-of-progress` repository. Today's job: write a fresh digest covering substantive MultiversX engineering progress since the last digest, then commit and push.

## Working directory

Clone (or pull) `git@github.com:lamentierschweinchen/proof-of-progress.git`. If running on a freshly provisioned remote agent, clone via `gh repo clone lamentierschweinchen/proof-of-progress`.

## Steps

1. **Pull the repo.** `cd proof-of-progress && git pull --rebase`.
2. **Read the last digest.** `ls -t digests/*.md | head -1` — read the most recent file. The new digest's "Since the last digest" section is relative to *that* file's timestamp, not a fixed 24h window. If the last digest was 3 days ago (weekend, holiday), cover the full gap.
3. **Research.** Use the GitHub CLI (`gh`). Targets and queries below.
4. **Write `digests/$(date +%Y-%m-%d).md`** in the format spec below.
5. **Update `INDEX.md`** — prepend a new row with date, TL;DR, and link.
6. **Refresh stats.** Run `python3 scripts/compute-stats.py` to regenerate `data/stats.json` (powers the dashboard). The script reads via GraphQL across all branches, so it sees `rc/*` work too. Takes ~30–60s.
7. **Commit and push.** Stage `digests/$(date +%Y-%m-%d).md`, `INDEX.md`, and `data/stats.json`. Commit message: `digest: YYYY-MM-DD`. Push to `main`.

## Research targets

### Repos (scan recent activity)

`multiversx/mx-chain-go`, `multiversx/mx-chain-vm-go`, `multiversx/mx-sdk-js-core`, `multiversx/mx-sdk-dapp`, `multiversx/mx-sdk-rs`, `multiversx/mx-template-dapp`, `multiversx/mx-chain-proxy-go`, `multiversx/mx-chain-simulator-go`, `multiversx/mx-specs`, `multiversx/mx-bridge-eth-go`, `multiversx/mx-chain-tools-go`, `multiversx/mx-api-service`, `multiversx/mx-chain-es-indexer-go`, `multiversx/mx-chain-mainnet-config`.

For each, query:
- `gh pr list --repo <repo> --state merged --limit 20 --json number,title,mergedAt,author,labels,url` — filter to since last digest.
- `gh release list --repo <repo> --limit 5` — flag anything new.
- `gh pr list --repo <repo> --state open --limit 10 --json number,title,createdAt,author,labels,url` — for signal on direction (only mention if non-trivial).

### Engineers (follow these contributors)

- `sasurobert` (Robert Sasu — VM/consensus core)

For each:
- `gh search prs --author=<user> --merged --limit 20 --json number,title,repository,mergedAt,url` — filter to window.
- `gh api /users/<user>/events/public --jq '.[0:30]'` — picks up direct commits to advisory/release branches that don't appear as their own PRs.

### Org-wide sweep (catch new repos / unexpected activity)

`gh api '/orgs/multiversx/repos?sort=pushed&per_page=30' --jq '.[] | {name, pushed_at}'` — if any repo not in the watchlist above shows recent pushes, investigate.

## Output format

Save to `digests/YYYY-MM-DD.md`:

```markdown
# YYYY-MM-DD — MultiversX Proof of Progress

**Window:** YYYY-MM-DD → YYYY-MM-DD (since last digest)

## TL;DR

One paragraph (3–5 sentences). What's the headline? Save the reader 10 minutes of GitHub browsing.

## Since the last digest

Tight bullet list of what's actually new vs the previous digest. Cross-reference last digest's open items: did they merge? did they stall? did a new release tag drop?

## Themes

### Theme name

- One-line PR summary [#NNNN](url) — what it does, why it matters.
- Group related PRs under one bullet if they're part of one story.

(Add 3–6 themes per digest. Skip themes with no activity.)

## Version map

| Component | Stable | Pre-release | Δ |
|---|---|---|---|
| ... | ... | ... | new / unchanged |

## Strategic read

3–6 numbered points. The big-picture interpretation: what's the trajectory? What should I watch next?
```

## Style rules

- **Be ruthless about substance.** Skip noise: bot PRs, dependabot bumps, typo fixes, repo housekeeping. A digest should be skimmable in 90 seconds.
- **Link every claim.** Every PR/release/commit reference gets a URL.
- **"Since the last digest" matters most.** If nothing substantive happened, say so plainly — don't pad. Three sentences and a "quiet day" tag are fine.
- **Flag advisory / security signals.** Branch names containing `advisory`, `fix-`, `hotfix`, `cve` — investigate and call out, even if the PR title is generic ("update vm common", "flags compressed", etc. can hide advisories).
- **Watch for cadence breaks.** If a normally-active repo goes silent, mention it. If a stable repo suddenly has a flurry of PRs, mention it. Cadence shifts often precede releases.

## Commit and push

```bash
git add digests/$(date +%Y-%m-%d).md INDEX.md
git commit -m "digest: $(date +%Y-%m-%d)"
git push origin main
```

If push fails (auth, network), retry once with `gh auth refresh` then report the failure in the run log — the local launchd job will retry the pull regardless.
