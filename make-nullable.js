const { createClient } = require('@supabase/supabase-js');

// Read from .env.local manually
const fs = require('fs');
const path = require('path');

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

async function makeNicheIdNullable() {
  console.log('Making niche_id nullable...');
  
  // Direct SQL execution
  const { data, error } = await supabase
    .rpc('exec_sql', { sql: 'ALTER TABLE public.funnels ALTER COLUMN niche_id DROP NOT NULL;' })
    .catch(err => {
      console.log('RPC method failed, trying direct query...');
      return { error: err };
    });
  
  if (error) {
    console.error('Error making niche_id nullable:', error);
    console.log('You may need to run this SQL manually in Supabase dashboard:');
    console.log('ALTER TABLE public.funnels ALTER COLUMN niche_id DROP NOT NULL;');
  } else {
    console.log('Success: niche_id is now nullable');
  }
}

makeNicheIdNullable().catch(console.error);