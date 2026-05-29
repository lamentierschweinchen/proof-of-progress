# proof-of-progress — Claude agent instructions

## What this repo is

A daily digest of MultiversX engineering progress. A scheduled Claude agent runs `scripts/research-brief.md` each day, writes a digest, and commits it.

## Branch policy for digest runs

**Digest commits go directly to `main`, regardless of which feature branch the session was provisioned on.**

The three files that make up each digest update — `digests/YYYY-MM-DD.md`, `INDEX.md`, `data/stats.json` — must land atomically on `main`. Push them with:

```bash
git push origin HEAD:main
```

The session-level feature branch (e.g. `claude/sweet-feynman-*`) is irrelevant for digest runs. Do not open a pull request. Do not wait for review. Push directly.

## What the digest run does

Follow `scripts/research-brief.md` exactly. That file is the single source of truth for step ordering, research targets, output format, and failure modes.

Key constraint: `python3 scripts/compute-stats.py` is hard-blocking. If it exits non-zero, stop — do not write a digest.

## Other tasks

For non-digest work (feature development, config changes, etc.), follow normal branch conventions: develop on the session branch, open a PR.
