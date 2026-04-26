#!/usr/bin/env bash
set -euo pipefail

EXPECTED_ORG_ID="${EXPECTED_VERCEL_ORG_ID:-team_S1WvHxaHSkDlH8DJ0HOT61Ab}"
EXPECTED_PROJECT_ID="${EXPECTED_VERCEL_PROJECT_ID:-prj_j1izlrAzNKk3KX5NJlRDjQ8R84SJ}"
EXPECTED_PROJECT_NAME="${EXPECTED_VERCEL_PROJECT_NAME:-modular-affiliate-system1}"
EXPECTED_SCOPE="${EXPECTED_VERCEL_SCOPE:-aj9891s-projects}"
PROD_BASE_ALIAS="${PROD_BASE_ALIAS:-modular-affiliate-system1.vercel.app}"
PROD_CUSTOM_DOMAINS="${PROD_CUSTOM_DOMAINS:-launchpad4success.pro,www.launchpad4success.pro}"
PROD_CUSTOM_ALIASES="${PROD_CUSTOM_ALIASES:-*.launchpad4success.pro}"

CHECK_ONLY=0
TARGET="prod"

trim_spaces() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

sync_prod_domains() {
  local domain
  local raw
  local alias
  local add_output

  echo "[vercel-safe-deploy] Syncing production custom domains to latest production deployment..."

  IFS=',' read -r -a domain_entries <<< "$PROD_CUSTOM_DOMAINS"
  for raw in "${domain_entries[@]}"; do
    domain="$(trim_spaces "$raw")"
    if [[ -z "$domain" ]]; then
      continue
    fi
    echo "[vercel-safe-deploy] Ensuring project domain: $domain"
    if ! add_output="$(vercel domains add "$domain" --scope "$EXPECTED_SCOPE" 2>&1)"; then
      echo "$add_output"
      if [[ "$add_output" == *"alias_conflict"* || "$add_output" == *"already assigned to another project"* ]]; then
        echo "[vercel-safe-deploy] Domain add conflict for $domain; continuing with alias refresh."
      else
        echo "[vercel-safe-deploy] Domain add failed for $domain."
        return 1
      fi
    else
      echo "$add_output"
    fi
    echo "[vercel-safe-deploy] Ensuring alias: $domain -> $PROD_BASE_ALIAS"
    vercel alias set "$PROD_BASE_ALIAS" "$domain" --scope "$EXPECTED_SCOPE"
  done

  IFS=',' read -r -a alias_entries <<< "$PROD_CUSTOM_ALIASES"
  for raw in "${alias_entries[@]}"; do
    alias="$(trim_spaces "$raw")"
    if [[ -z "$alias" ]]; then
      continue
    fi
    echo "[vercel-safe-deploy] Ensuring alias: $alias -> $PROD_BASE_ALIAS"
    vercel alias set "$PROD_BASE_ALIAS" "$alias" --scope "$EXPECTED_SCOPE"
  done
}

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
  sync_prod_domains
fi
