# MultiversX Proof of Progress

Daily digest of substantive engineering progress across the MultiversX ecosystem. A scheduled remote Claude Code agent runs every morning at 06:30 Europe/Bucharest, researches GitHub activity across the org plus a watchlist of core engineers, synthesizes the result, and commits a fresh markdown file to `digests/`.

## How to read it

- **`digests/YYYY-MM-DD.md`** — one file per day. Each file leads with **"Since the last digest"** (what's actually new), then themed sections, a version table, and a strategic read.
- **`INDEX.md`** — rolling table of contents with one-line summaries. Skim this first when catching up.
- **`scripts/research-brief.md`** — the prompt the scheduled agent runs. Edit this to change what gets tracked.

## Live monitoring

- Local mirror at `~/Documents/MultiversX/projects/proof-of-progress` is pulled every 15 min by a launchd agent (`scripts/launchd/com.lukasc.mx-proof-of-progress.plist`). When a new digest lands, a macOS notification fires with the TL;DR.
- The remote scheduled job (managed via `/schedule`) runs on its own infra, so the laptop being asleep at 06:30 doesn't matter — the digest is committed regardless. The local mirror catches up whenever the laptop wakes.

## Watchlist

**Repos (auto-scanned):** `mx-chain-go`, `mx-chain-vm-go`, `mx-sdk-js-core`, `mx-sdk-dapp`, `mx-sdk-rs`, `mx-template-dapp`, `mx-chain-proxy-go`, `mx-chain-simulator-go`, `mx-specs`, `mx-bridge-eth-go`, `mx-chain-tools-go`, `mx-api-service`, `mx-chain-es-indexer-go`, `mx-chain-mainnet-config`.

**Engineers (auto-followed):** `sasurobert` (Robert Sasu — VM/consensus core). Add more in `scripts/research-brief.md`.

## Manual run

```bash
# Re-run today's digest by hand (local Claude Code)
cd ~/Documents/MultiversX/projects/proof-of-progress
claude -p "$(cat scripts/research-brief.md)"
```
