# MultiversX Proof of Progress

Daily digest of substantive engineering progress across the MultiversX ecosystem. A GitHub Actions workflow runs every morning at 04:30 UTC (06:30 CEST / 05:30 CET), researches GitHub activity across the org plus a watchlist of core engineers, synthesizes the result, and commits a fresh markdown file to `digests/`. The job runs on GitHub-hosted infra, so the laptop being off doesn't matter.

## How to read it

- **`digests/YYYY-MM-DD.md`** — one file per day. Each file leads with **"Since the last digest"** (what's actually new), then themed sections, a version table, and a strategic read.
- **`INDEX.md`** — rolling table of contents with one-line summaries. Skim this first when catching up.
- **`scripts/research-brief.md`** — the prompt the scheduled agent runs. Edit this to change what gets tracked.

## Live monitoring

- Local mirror at `~/proof-of-progress` (symlinked from `~/Documents/MultiversX/projects/proof-of-progress`) is pulled every 15 min by a launchd agent (`scripts/launchd/com.lukasc.mx-proof-of-progress.plist`). When a new digest lands, a macOS notification fires with the TL;DR and the file opens.
- The cron job is `.github/workflows/daily-digest.yml` and runs on GitHub Actions. Requires one repo secret: `ANTHROPIC_API_KEY`. Trigger manually from the **Actions** tab → **daily-digest** → **Run workflow** for ad-hoc runs.

## Watchlist

**Repos (auto-scanned):** `mx-chain-go`, `mx-chain-vm-go`, `mx-sdk-js-core`, `mx-sdk-dapp`, `mx-sdk-rs`, `mx-template-dapp`, `mx-chain-proxy-go`, `mx-chain-simulator-go`, `mx-specs`, `mx-bridge-eth-go`, `mx-chain-tools-go`, `mx-api-service`, `mx-chain-es-indexer-go`, `mx-chain-mainnet-config`.

**Engineers (auto-followed):** `sasurobert` (Robert Sasu — VM/consensus core). Add more in `scripts/research-brief.md`.

## Manual run

```bash
# Re-run today's digest by hand (local Claude Code)
cd ~/proof-of-progress
claude -p "$(cat scripts/research-brief.md)"
```
