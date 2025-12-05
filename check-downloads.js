const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('Checking downloads system setup...\n');
  
  let allGood = true;
  
  // Check downloads table
  const { data: downloads, error: downloadsError } = await supabase
    .from('downloads')
    .select('*')
    .limit(1);
  
  if (downloadsError) {
    console.log('❌ downloads table: NOT FOUND');
    console.log('   Error:', downloadsError.message);
    allGood = false;
  } else {
    console.log('✅ downloads table: EXISTS');
  }
  
  // Check download_logs table
  const { data: logs, error: logsError } = await supabase
    .from('download_logs')
    .select('*')
    .limit(1);
  
  if (logsError) {
    console.log('❌ download_logs table: NOT FOUND');
    console.log('   Error:', logsError.message);
    allGood = false;
  } else {
    console.log('✅ download_logs table: EXISTS');
  }
  
  // Check storage bucket
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();
  
  if (bucketsError) {
    console.log('❌ Storage check failed:', bucketsError.message);
    allGood = false;
  } else {
    const downloadsBucket = buckets.find(b => b.name === 'downloads');
    if (downloadsBucket) {
      console.log('✅ downloads storage bucket: EXISTS');
      console.log('   Public:', downloadsBucket.public);
    } else {
      console.log('❌ downloads storage bucket: NOT FOUND');
      allGood = false;
    }
  }
  
  console.log('\n---\n');
  
  if (!allGood) {
    console.log('⚠️  SETUP INCOMPLETE');
    console.log('\nPlease run the migration:');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Copy SQL from: /DOWNLOADS_SETUP.md');
    console.log('3. Paste and run the SQL');
    console.log('4. Create storage bucket named "downloads" (set to Public)');
  } else {
    console.log('🎉 SETUP COMPLETE!');
    console.log('\nYou can now:');
    console.log('• Visit http://localhost:3000/downloads');
    console.log('• Upload your first file');
    console.log('• Start capturing leads!');
  }
}

checkTables().catch(console.error);
