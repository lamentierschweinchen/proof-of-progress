#!/bin/bash
set -euo pipefail

# Only run on remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install gh CLI if not already present
if ! command -v gh &>/dev/null; then
  echo "[session-start] Installing gh CLI..."
  apt-get update -qq -o Dir::Etc::sourcelist=/etc/apt/sources.list \
    -o Dir::Etc::sourcelistd=/dev/null 2>/dev/null || true
  apt-get install -y -qq gh 2>/dev/null
  echo "[session-start] gh $(gh --version | head -1) installed."
fi

# Authenticate gh CLI.
# GH_TOKEN is read natively by gh and is the preferred variable.
# GITHUB_TOKEN is supported as a fallback (Actions convention).
if [ -n "${GH_TOKEN:-}" ]; then
  echo "[session-start] GH_TOKEN set — gh will use it natively."
  # Persist into the session env file so child processes (e.g. compute-stats.py)
  # inherit it even if they don't share this shell's environment.
  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "export GH_TOKEN=${GH_TOKEN}" >> "$CLAUDE_ENV_FILE"
  fi
  echo "[session-start] gh auth: $(gh auth status 2>&1 | head -1)"
elif [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "[session-start] GITHUB_TOKEN set — logging in to gh."
  echo "$GITHUB_TOKEN" | gh auth login --with-token
  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "export GH_TOKEN=${GITHUB_TOKEN}" >> "$CLAUDE_ENV_FILE"
  fi
  echo "[session-start] gh auth: $(gh auth status 2>&1 | head -1)"
else
  echo "[session-start] WARNING: neither GH_TOKEN nor GITHUB_TOKEN is set." >&2
  echo "[session-start] → compute-stats.py will fail until a token is configured." >&2
  echo "[session-start] → Add GH_TOKEN to this environment's variables at:" >&2
  echo "[session-start]   https://code.claude.com (Environment → Variables)" >&2
fi
