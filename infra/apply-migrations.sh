#!/bin/bash

################################################################################
# Supabase Migration Runner (Shell Script)
# Applies all SQL migrations to your Supabase PostgreSQL database
#
# Usage:
#   ./apply-migrations.sh
#
# Requirements:
#   - psql (PostgreSQL client)
#   - Connection details in environment or .env file
#
# Environment Variables:
#   DATABASE_URL - Full PostgreSQL connection string
#   OR
#   SUPABASE_DB_HOST, SUPABASE_DB_USER, SUPABASE_DB_PASS, SUPABASE_DB_NAME
################################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

# Migration order (explicit)
MIGRATIONS=(
  "add_admin_flag.sql"
  "add_domain_fields.sql"
  "add_onboarding_fields.sql"
  "add_slug_fields.sql"
  "add_max_launchpads.sql"
  "add_affiliate_clicks.sql"
  "add_stripe_connect.sql"
  "add_team_collaboration.sql"
  "add_downloads_tables.sql"
  "add_ai_chat_only.sql"
  "add_ai_support_chat.sql"
  "add_brand_modes.sql"
  "add_brand_brain_tables.sql"
  "20260514_add_attribution_audit_events.sql"
  "20260516_add_beta_testers.sql"
  "20260516_add_beta_tester_invite_tokens.sql"
  "optimize_rls_and_performance.sql"
  "add_funnel_rls_policies.sql"
)

# Counters
SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

################################################################################
# Functions
################################################################################

print_header() {
  echo -e "${CYAN}============================================================${NC}"
  echo -e "${BOLD}  Supabase Migration Runner${NC}"
  echo -e "${CYAN}============================================================${NC}"
  echo ""
}

print_summary() {
  echo ""
  echo -e "${CYAN}============================================================${NC}"
  echo -e "${BOLD}  Migration Summary${NC}"
  echo -e "${CYAN}============================================================${NC}"
  echo -e "${GREEN}✓ Successful: $SUCCESS_COUNT${NC}"
  [ $SKIP_COUNT -gt 0 ] && echo -e "${YELLOW}⚠ Skipped: $SKIP_COUNT${NC}"
  [ $FAIL_COUNT -gt 0 ] && echo -e "${RED}✗ Failed: $FAIL_COUNT${NC}"
  echo ""
}

check_dependencies() {
  if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql not found${NC}"
    echo -e "${YELLOW}Install PostgreSQL client: sudo apt-get install postgresql-client${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ psql found${NC}"
}

load_env() {
  # Load .env file if it exists
  if [ -f "$SCRIPT_DIR/../.env.local" ]; then
    echo -e "${BLUE}📄 Loading environment from .env.local${NC}"
    export $(cat "$SCRIPT_DIR/../.env.local" | grep -v '^#' | xargs)
  elif [ -f "$SCRIPT_DIR/../apps/web/.env.local" ]; then
    echo -e "${BLUE}📄 Loading environment from apps/web/.env.local${NC}"
    export $(cat "$SCRIPT_DIR/../apps/web/.env.local" | grep -v '^#' | xargs)
  fi
}

validate_connection() {
  if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set${NC}"
    echo -e "${YELLOW}You need to set DATABASE_URL with your Supabase connection string${NC}"
    echo ""
    echo -e "${CYAN}Format:${NC}"
    echo "  postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
    echo ""
    echo -e "${CYAN}Get it from:${NC}"
    echo "  Supabase Dashboard → Settings → Database → Connection String (URI)"
    echo ""
    exit 1
  fi
  
  echo -e "${GREEN}✓ Connection string found${NC}"
}

test_connection() {
  echo -e "${BLUE}🔌 Testing database connection...${NC}"
  
  if psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✓ Connection successful${NC}"
  else
    echo -e "${RED}❌ Connection failed${NC}"
    echo -e "${YELLOW}Check your DATABASE_URL and network access${NC}"
    exit 1
  fi
}

create_migration_table() {
  echo ""
  echo -e "${BLUE}🔧 Setting up migration tracking...${NC}"
  
  psql "$DATABASE_URL" <<SQL
    create table if not exists public._migrations (
      id serial primary key,
      name text unique not null,
      applied_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
    
    comment on table public._migrations is 'Tracks applied database migrations';
SQL
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migration tracking ready${NC}"
  else
    echo -e "${YELLOW}⚠ Could not create migration table${NC}"
  fi
}

check_if_applied() {
  local migration_name=$1
  
  result=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM _migrations WHERE name = '$migration_name'" 2>/dev/null || echo "0")
  
  if [ "$result" -gt 0 ]; then
    return 0  # Already applied
  else
    return 1  # Not applied
  fi
}

mark_as_applied() {
  local migration_name=$1
  psql "$DATABASE_URL" -c "INSERT INTO _migrations (name) VALUES ('$migration_name') ON CONFLICT (name) DO NOTHING" &> /dev/null
}

apply_migration() {
  local filename=$1
  local filepath="$MIGRATIONS_DIR/$filename"
  
  echo ""
  echo -e "${BOLD}📄 Processing: $filename${NC}"
  
  # Check if file exists
  if [ ! -f "$filepath" ]; then
    echo -e "${YELLOW}  ⚠️  File not found, skipping${NC}"
    ((SKIP_COUNT++))
    return
  fi
  
  # Check if already applied
  if check_if_applied "$filename"; then
    echo -e "${CYAN}  ℹ️  Already applied, skipping${NC}"
    ((SKIP_COUNT++))
    return
  fi
  
  # Apply migration
  echo -e "${CYAN}  → Executing SQL...${NC}"
  
  if psql "$DATABASE_URL" -f "$filepath" > /dev/null 2>&1; then
    mark_as_applied "$filename"
    echo -e "${GREEN}  ✓ Success${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${RED}  ✗ Failed${NC}"
    echo -e "${YELLOW}  Running with error output:${NC}"
    psql "$DATABASE_URL" -f "$filepath"
    ((FAIL_COUNT++))
  fi
}

################################################################################
# Main
################################################################################

main() {
  print_header
  
  check_dependencies
  load_env
  validate_connection
  test_connection
  
  echo ""
  echo -e "${BLUE}📂 Migrations directory: $MIGRATIONS_DIR${NC}"
  echo -e "${BLUE}📋 Total migrations: ${#MIGRATIONS[@]}${NC}"
  
  create_migration_table
  
  echo ""
  echo -e "${BOLD}🚀 Starting migration process...${NC}"
  
  for migration in "${MIGRATIONS[@]}"; do
    apply_migration "$migration"
    sleep 0.5  # Small delay between migrations
  done
  
  print_summary
  
  if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Some migrations failed. Check errors above.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}🎉 All migrations completed successfully!${NC}"
  echo ""
}

# Run
main
