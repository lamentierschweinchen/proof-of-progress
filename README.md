# MultiversX Proof of Progress

Daily digest of substantive engineering progress across the MultiversX ecosystem. A scheduled Claude Code on the web session runs every morning, researches GitHub activity across the org plus a watchlist of core engineers, synthesizes the result, and commits a fresh markdown file to `digests/`. The session runs on Anthropic's infra and pushes via the Claude GitHub App, so the laptop being off doesn't matter.

## How to read it

- **`digests/YYYY-MM-DD.md`** — one file per day. Each file leads with **"Since the last digest"** (what's actually new), then themed sections, a version table, and a strategic read.
- **`INDEX.md`** — rolling table of contents with one-line summaries. Skim this first when catching up.
- **`scripts/research-brief.md`** — the prompt the scheduled session runs end-to-end (research → write digest → update INDEX → refresh stats → commit → push). Edit this to change what gets tracked.

## Pipeline

- **Primary:** scheduled Claude Code on the web session, managed via `/schedule`. Burns one of the daily routine slots. Requires the Claude GitHub App to be installed on this repo with **Contents: read and write** (manage at https://github.com/settings/installations — the OAuth-app entry under "Authorized OAuth Apps" is *not* the same thing and won't grant write).
- **Fallback:** `.github/workflows/daily-digest.yml` is wired as a manual rebuild button. The cron trigger is commented out so the two pipelines don't race; uncomment it in the workflow file if the CCR routine is unavailable for an extended stretch. Requires the `ANTHROPIC_API_KEY` repo secret. Trigger from the **Actions** tab → **daily-digest** → **Run workflow**.

## Live monitoring

Local mirror at `~/proof-of-progress` (symlinked from `~/Documents/MultiversX/projects/proof-of-progress`) is pulled every 15 min by a launchd agent (`scripts/launchd/com.lukasc.mx-proof-of-progress.plist`). When a new digest lands, a macOS notification fires with the TL;DR and the file opens.

## Watchlist

**Repos (auto-scanned):** `mx-chain-go`, `mx-chain-vm-go`, `mx-sdk-js-core`, `mx-sdk-dapp`, `mx-sdk-rs`, `mx-template-dapp`, `mx-chain-proxy-go`, `mx-chain-simulator-go`, `mx-specs`, `mx-bridge-eth-go`, `mx-chain-tools-go`, `mx-api-service`, `mx-chain-es-indexer-go`, `mx-chain-mainnet-config`.

**Engineers (auto-followed):** `sasurobert` (Robert Sasu — VM/consensus core). Add more in `scripts/research-brief.md`.

## Manual run

```bash
# Re-run today's digest by hand (local Claude Code)
cd ~/proof-of-progress
claude -p "$(cat scripts/research-brief.md)"
```
