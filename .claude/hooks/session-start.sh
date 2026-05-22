#!/bin/bash
set -euo pipefail

# Only run on remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install gh CLI if not already present
if ! command -v gh &>/dev/null; then
  echo "[session-start] Installing gh CLI..."
  # Update only the official Ubuntu repos; ignore PPA failures (-o Acquire::AllowInsecureRepositories=true
  # is not needed — we just suppress non-fatal PPA 403s via || true)
  apt-get update -qq -o Dir::Etc::sourcelist=/etc/apt/sources.list \
    -o Dir::Etc::sourcelistd=/dev/null 2>/dev/null || true
  apt-get install -y -qq gh 2>/dev/null
  echo "[session-start] gh $(gh --version | head -1) installed."
fi

# Authenticate gh using GITHUB_TOKEN if provided
if [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "[session-start] Authenticating gh with GITHUB_TOKEN..."
  echo "$GITHUB_TOKEN" | gh auth login --with-token
  echo "[session-start] gh auth: $(gh auth status 2>&1 | head -2)"
else
  echo "[session-start] WARNING: GITHUB_TOKEN not set — compute-stats.py will fail." >&2
  echo "[session-start] Set it at: https://claude.ai/settings (Environment variables)" >&2
fi
