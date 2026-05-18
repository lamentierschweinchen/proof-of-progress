#!/bin/bash
# Pulls the latest proof-of-progress digests and fires a macOS notification
# if a new digest landed since the last check.
#
# Wired up via launchd: scripts/launchd/com.lukasc.mx-proof-of-progress.plist
# Runs every 15 minutes when the laptop is awake. Idempotent.

set -euo pipefail

REPO_DIR="/Users/ls/Documents/MultiversX/projects/proof-of-progress"
STATE_FILE="$REPO_DIR/.last-seen-digest"
LOG_FILE="$REPO_DIR/.pull.log"

cd "$REPO_DIR"

# Quiet pull. Fail soft — we don't want to spam log on transient network issues.
if ! git pull --rebase --quiet 2>>"$LOG_FILE"; then
    echo "[$(date -Iseconds)] pull failed" >> "$LOG_FILE"
    exit 0
fi

# Find the newest digest file.
LATEST=$(ls -t digests/*.md 2>/dev/null | head -1 || true)
if [[ -z "${LATEST:-}" ]]; then
    exit 0
fi

# Compare against last-seen marker.
LAST_SEEN=""
if [[ -f "$STATE_FILE" ]]; then
    LAST_SEEN=$(cat "$STATE_FILE")
fi

if [[ "$LATEST" == "$LAST_SEEN" ]]; then
    # Nothing new.
    exit 0
fi

# New digest. Extract TL;DR (the paragraph after "## TL;DR").
TLDR=$(awk '
    /^## TL;DR/ { flag=1; next }
    /^## / && flag { exit }
    flag && NF { print }
' "$LATEST" | head -3 | tr '\n' ' ' | sed 's/  */ /g' | cut -c1-280)

DATE=$(basename "$LATEST" .md)

# Fire macOS notification. Clicking opens the file in the default markdown viewer.
osascript <<EOF
display notification "${TLDR}" with title "MX Proof of Progress — ${DATE}" sound name "Glass"
EOF

# Open the digest in the default app (usually Marked / Typora / VS Code).
# Comment this out if you'd rather not have a window pop up.
open "$LATEST"

# Mark as seen.
echo "$LATEST" > "$STATE_FILE"

echo "[$(date -Iseconds)] notified for $LATEST" >> "$LOG_FILE"
