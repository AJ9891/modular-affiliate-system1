#!/usr/bin/env node

/**
 * Apply RLS Fix to Supabase
 * This script applies the fix_rls_warnings.sql migration
 * 
 * Usage:
 *   node apply-rls-fix.js
 *   
 * Requirements:
 *   - Supabase connection details in environment
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MIGRATION_FILE = path.join(__dirname, 'migrations', 'fix_rls_warnings.sql');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function main() {
  log('\n' + '='.repeat(70), 'cyan');
  log('  🔒 RLS Warning Fix - Supabase Migration', 'bright');
  log('='.repeat(70), 'cyan');

  // Validate environment
  if (!SUPABASE_URL) {
    log('\n❌ Error: SUPABASE_URL not found in environment', 'red');
    log('Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL', 'yellow');
    process.exit(1);
  }

  log(`\n📍 Supabase URL: ${SUPABASE_URL}`, 'blue');

  // Check if migration file exists
  if (!fs.existsSync(MIGRATION_FILE)) {
    log(`\n❌ Error: Migration file not found: ${MIGRATION_FILE}`, 'red');
    process.exit(1);
  }

  // Read the migration file
  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  const lineCount = sql.split('\n').length;
  
  log(`📄 Migration file: fix_rls_warnings.sql (${lineCount} lines)`, 'blue');
  log('', 'reset');

  // Parse migration to show what will be applied
  const tableMatches = sql.match(/alter table public\.(\w+) enable row level security/g) || [];
  const policyMatches = sql.match(/create policy "([^"]+)"/g) || [];
  
  log('📋 Migration Summary:', 'bright');
  log(`   • Tables with RLS enabled: ${tableMatches.length}`, 'cyan');
  log(`   • Policies to create: ${policyMatches.length}`, 'cyan');
  log('', 'reset');

  // List tables
  if (tableMatches.length > 0) {
    log('🔐 Tables that will have RLS enabled:', 'blue');
    const tables = [...new Set(tableMatches.map(m => {
      const match = m.match(/public\.(\w+)/);
      return match ? match[1] : null;
    }).filter(Boolean))];
    
    tables.forEach(table => {
      log(`   ✓ ${table}`, 'green');
    });
    log('', 'reset');
  }

  // Instructions
  log('📝 How to Apply This Migration:', 'bright');
  log('', 'reset');
  
  log('Option 1: Using Supabase Dashboard (Recommended)', 'yellow');
  log('   1. Go to: https://supabase.com/dashboard/project/_/sql/new', 'cyan');
  log('   2. Copy the contents of: infra/migrations/fix_rls_warnings.sql', 'cyan');
  log('   3. Paste into SQL Editor', 'cyan');
  log('   4. Click "Run" to execute', 'cyan');
  log('', 'reset');

  log('Option 2: Using psql (Command Line)', 'yellow');
  log('   cd infra', 'cyan');
  log('   ./apply-migrations.sh', 'cyan');
  log('', 'reset');

  log('Option 3: Using Supabase CLI', 'yellow');
  log('   supabase db push', 'cyan');
  log('', 'reset');

  log('Option 4: Copy SQL to Clipboard', 'yellow');
  log('   cat infra/migrations/fix_rls_warnings.sql | pbcopy   # macOS', 'cyan');
  log('   cat infra/migrations/fix_rls_warnings.sql | xclip    # Linux', 'cyan');
  log('', 'reset');

  // Show Supabase dashboard link
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (projectRef) {
    log('🔗 Quick Links:', 'bright');
    log(`   Dashboard: https://supabase.com/dashboard/project/${projectRef}`, 'blue');
    log(`   SQL Editor: https://supabase.com/dashboard/project/${projectRef}/sql/new`, 'blue');
    log('', 'reset');
  }

  // What will be fixed
  log('✨ What This Migration Fixes:', 'bright');
  log('   ✓ Enables RLS on all tables', 'green');
  log('   ✓ Adds comprehensive SELECT/INSERT/UPDATE/DELETE policies', 'green');
  log('   ✓ Implements team collaboration security', 'green');
  log('   ✓ Allows public access to published content', 'green');
  log('   ✓ Secures tracking and analytics data', 'green');
  log('   ✓ Protects user and team isolation', 'green');
  log('', 'reset');

  // After applying
  log('📊 After Applying:', 'bright');
  log('   1. Verify no RLS warnings in Supabase Dashboard', 'cyan');
  log('   2. Check Database → Tables → each table should show policies', 'cyan');
  log('   3. Test with different user roles (owner, team, anonymous)', 'cyan');
  log('   4. Review the summary document: infra/RLS_FIX_SUMMARY.md', 'cyan');
  log('', 'reset');

  log('=' .repeat(70), 'cyan');
  log('✅ Migration file is ready to apply!', 'green');
  log('Follow the instructions above to apply it to your database.', 'yellow');
  log('=' .repeat(70), 'cyan');
  log('', 'reset');
}

// Run
main();
