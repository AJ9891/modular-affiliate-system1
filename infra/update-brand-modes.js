const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://urwrbjejcozbzgknbuhn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBrandModesConstraint() {
  console.log('🚀 Updating brand_modes voice_tone constraint...');
  
  try {
    // First, drop the existing constraint if it exists
    console.log('📋 Dropping existing constraint...');
    await supabase.rpc('execute', {
      sql: 'ALTER TABLE public.brand_modes DROP CONSTRAINT IF EXISTS brand_modes_voice_tone_check;'
    });
    
    // Then add the new constraint with "funny" included
    console.log('📋 Adding new constraint with "funny" option...');
    await supabase.rpc('execute', {
      sql: `ALTER TABLE public.brand_modes
        ADD CONSTRAINT brand_modes_voice_tone_check
        CHECK (voice_tone IN (
          'professional','casual','friendly','authoritative',
          'playful','empathetic','inspirational','funny'
        ));`
    });
    
    console.log('✅ Successfully updated brand_modes constraint');
    console.log('   Added "funny" to allowed voice_tone values');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('');
    console.log('🔧 Manual execution required:');
    console.log('   Copy the following SQL to Supabase Dashboard → SQL Editor:');
    console.log('');
    console.log(`ALTER TABLE public.brand_modes
  DROP CONSTRAINT IF EXISTS brand_modes_voice_tone_check;
ALTER TABLE public.brand_modes
  ADD CONSTRAINT brand_modes_voice_tone_check
  CHECK (voice_tone IN (
    'professional','casual','friendly','authoritative',
    'playful','empathetic','inspirational','funny'
  ));`);
  }
}

updateBrandModesConstraint();
