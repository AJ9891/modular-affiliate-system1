const fs = require('fs')
const path = require('path')

async function applyTriggerFix() {
  try {
    console.log('📁 Loading migration file...')
    const migrationPath = path.join(__dirname, 'migrations', 'fix_funnel_trigger_id_field.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('🔧 Migration SQL loaded:')
    console.log(migrationSQL.substring(0, 200) + '...')
    
    console.log('\n✨ Migration loaded successfully!')
    console.log('🚨 IMPORTANT: Copy the above SQL and run it in your Supabase SQL Editor')
    console.log('This will fix the trigger function to handle the funnels table correctly.')
    
    return true
  } catch (error) {
    console.error('❌ Error loading migration:', error.message)
    return false
  }
}

applyTriggerFix()