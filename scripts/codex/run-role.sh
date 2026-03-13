#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <role> [task prompt]" >&2
  exit 1
fi

ROLE="$1"
shift || true

case "$ROLE" in
  coordinator)
    MODEL="gpt-5.4"
    EFFORT="high"
    PROMPT_FILE="$ROOT_DIR/.codex/agents/coordinator.md"
    ;;
  frontend)
    MODEL="gpt-5.4"
    EFFORT="medium"
    PROMPT_FILE="$ROOT_DIR/.codex/agents/frontend.md"
    ;;
  backend)
    MODEL="gpt-5.4"
    EFFORT="high"
    PROMPT_FILE="$ROOT_DIR/.codex/agents/backend.md"
    ;;
  reviewer)
    MODEL="gpt-5.1-codex-max"
    EFFORT="medium"
    PROMPT_FILE="$ROOT_DIR/.codex/agents/reviewer.md"
    ;;
  docs)
    MODEL="gpt-5.1-codex-mini"
    EFFORT="low"
    PROMPT_FILE="$ROOT_DIR/.codex/agents/docs.md"
    ;;
  *)
    echo "Unknown role: $ROLE" >&2
    echo "Expected one of: coordinator, frontend, backend, reviewer, docs" >&2
    exit 1
    ;;
esac

ROLE_PROMPT="$(cat "$PROMPT_FILE")"

if [[ $# -gt 0 ]]; then
  TASK_PROMPT="$*"
  FULL_PROMPT="${ROLE_PROMPT}

Task:
${TASK_PROMPT}"
else
  FULL_PROMPT="$ROLE_PROMPT"
fi

exec codex \
  -C "$ROOT_DIR" \
  -m "$MODEL" \
  -c "model_reasoning_effort=\"$EFFORT\"" \
  --full-auto \
  "$FULL_PROMPT"
