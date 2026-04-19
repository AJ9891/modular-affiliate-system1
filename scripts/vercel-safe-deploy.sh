#!/usr/bin/env bash
set -euo pipefail

EXPECTED_ORG_ID="${EXPECTED_VERCEL_ORG_ID:-team_S1WvHxaHSkDlH8DJ0HOT61Ab}"
EXPECTED_PROJECT_ID="${EXPECTED_VERCEL_PROJECT_ID:-prj_j1izlrAzNKk3KX5NJlRDjQ8R84SJ}"
EXPECTED_PROJECT_NAME="${EXPECTED_VERCEL_PROJECT_NAME:-modular-affiliate-system1}"
EXPECTED_SCOPE="${EXPECTED_VERCEL_SCOPE:-aj9891s-projects}"

CHECK_ONLY=0
TARGET="prod"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check)
      CHECK_ONLY=1
      shift
      ;;
    --preview)
      TARGET="preview"
      shift
      ;;
    *)
      break
      ;;
  esac
done

if [[ ! -f ".vercel/project.json" ]]; then
  echo "[vercel-safe-deploy] Missing .vercel/project.json in repo root."
  echo "[vercel-safe-deploy] Run: vercel link --yes --scope \"$EXPECTED_SCOPE\" --project \"$EXPECTED_PROJECT_NAME\""
  exit 1
fi

readarray -t LINKED < <(
  node -e '
    const fs = require("fs");
    const p = JSON.parse(fs.readFileSync(".vercel/project.json", "utf8"));
    console.log(p.orgId || "");
    console.log(p.projectId || "");
    console.log(p.projectName || "");
  '
)

LINKED_ORG_ID="${LINKED[0]:-}"
LINKED_PROJECT_ID="${LINKED[1]:-}"
LINKED_PROJECT_NAME="${LINKED[2]:-}"

if [[ -z "$LINKED_ORG_ID" || -z "$LINKED_PROJECT_ID" || -z "$LINKED_PROJECT_NAME" ]]; then
  echo "[vercel-safe-deploy] Invalid .vercel/project.json (missing orgId/projectId/projectName)."
  exit 1
fi

if [[ "$LINKED_ORG_ID" != "$EXPECTED_ORG_ID" || "$LINKED_PROJECT_ID" != "$EXPECTED_PROJECT_ID" || "$LINKED_PROJECT_NAME" != "$EXPECTED_PROJECT_NAME" ]]; then
  echo "[vercel-safe-deploy] Link guard failed."
  echo "  expected orgId:      $EXPECTED_ORG_ID"
  echo "  linked orgId:        $LINKED_ORG_ID"
  echo "  expected projectId:  $EXPECTED_PROJECT_ID"
  echo "  linked projectId:    $LINKED_PROJECT_ID"
  echo "  expected projectName:$EXPECTED_PROJECT_NAME"
  echo "  linked projectName:  $LINKED_PROJECT_NAME"
  echo
  echo "[vercel-safe-deploy] Fix link:"
  echo "  vercel link --yes --scope \"$EXPECTED_SCOPE\" --project \"$EXPECTED_PROJECT_NAME\""
  exit 1
fi

echo "[vercel-safe-deploy] Link check passed for $LINKED_PROJECT_NAME ($LINKED_PROJECT_ID)."

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  echo "[vercel-safe-deploy] Check-only mode: no deploy executed."
  exit 0
fi

if [[ "$TARGET" == "preview" ]]; then
  echo "[vercel-safe-deploy] Deploying preview to scope $EXPECTED_SCOPE..."
  vercel deploy --yes --scope "$EXPECTED_SCOPE" "$@"
else
  echo "[vercel-safe-deploy] Deploying production to scope $EXPECTED_SCOPE..."
  vercel deploy --prod --yes --scope "$EXPECTED_SCOPE" "$@"
fi
