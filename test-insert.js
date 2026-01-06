const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read from .env.local
const envPath = path.join(__dirname, 'apps/web/.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

let supabaseKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    supabaseKey = line.split('=')[1];
  }
});

const supabase = createClient(
  'https://urwrbjejcozbzgknbuhn.supabase.co',
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testFunnelInsert() {
  console.log('Testing funnel insert with minimal data...');
  
  // First, let's check if the niche_id column is nullable
  const { data: schemaData, error: schemaError } = await supabase
    .from('information_schema.columns')
    .select('column_name, is_nullable, column_default')
    .eq('table_name', 'funnels')
    .eq('table_schema', 'public');
    
  if (schemaError) {
    console.error('Schema check error:', schemaError);
  } else {
    console.log('Funnels table schema:');
    schemaData.forEach(col => {
      console.log(`- ${col.column_name}: nullable=${col.is_nullable}, default=${col.column_default}`);
    });
  }
  
  // Now try to insert a test funnel
  const testData = {
    user_id: '8496ea55-2f9e-4104-814a-edb887de2f55',
    name: 'Test Funnel',
    slug: 'test-funnel-' + Date.now(),
    blocks: { template: 'custom', niche: 'general', theme: {}, blocks: [] },
    active: true,
    niche_id: null
  };
  
  console.log('\nTesting funnel insert with data:', {
    ...testData,
    blocks: 'JSONB data...'
  });
  
  const { data, error } = await supabase
    .from('funnels')
    .insert(testData)
    .select('funnel_id, name, slug');
    
  if (error) {
    console.error('Funnel insert error:', error);
  } else {
    console.log('Funnel insert success:', data);
  }
}

testFunnelInsert().catch(console.error);