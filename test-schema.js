const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://urwrbjejcozbzgknbuhn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.log('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testQuery() {
  console.log('Testing simple funnel query...');
  const { data, error } = await supabase
    .from('funnels')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Query error:', error);
  } else {
    console.log('Query successful. Schema from existing data:');
    if (data && data.length > 0) {
      console.log('Columns found:', Object.keys(data[0]));
    } else {
      console.log('No data in funnels table');
    }
  }
}

testQuery().catch(console.error);