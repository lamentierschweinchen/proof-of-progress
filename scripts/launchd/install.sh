#!/bin/bash
# Installs the launchd job that pulls digests and fires macOS notifications.
# Idempotent — safe to run multiple times.

set -euo pipefail

REPO_DIR="/Users/ls/proof-of-progress"
PLIST_NAME="com.lukasc.mx-proof-of-progress.plist"
SRC="$REPO_DIR/scripts/launchd/$PLIST_NAME"
DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"

# Ensure pull-and-notify is executable.
chmod +x "$REPO_DIR/scripts/pull-and-notify.sh"

# Symlink rather than copy so edits to the repo version take effect after reload.
mkdir -p "$HOME/Library/LaunchAgents"
ln -sf "$SRC" "$DEST"

# Reload (bootout is idempotent — ignore "not loaded" errors).
launchctl bootout "gui/$(id -u)/com.lukasc.mx-proof-of-progress" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$DEST"
launchctl enable "gui/$(id -u)/com.lukasc.mx-proof-of-progress"

echo "Installed. Verify with:"
echo "  launchctl print gui/\$(id -u)/com.lukasc.mx-proof-of-progress | head -20"
echo "Force a run with:"
echo "  launchctl kickstart -k gui/\$(id -u)/com.lukasc.mx-proof-of-progress"
