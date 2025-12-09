import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDownloadsSetup() {
  console.log('🔍 Checking downloads system setup...\n');
  
  let allGood = true;
  
  // Check downloads table
  try {
    const { error: downloadsError } = await supabase
      .from('downloads')
      .select('id')
      .limit(1);
    
    if (downloadsError) {
      console.log('❌ downloads table: NOT FOUND');
      console.log('   Error:', downloadsError.message);
      allGood = false;
    } else {
      console.log('✅ downloads table: EXISTS');
    }
  } catch (e: any) {
    console.log('❌ downloads table check failed:', e.message);
    allGood = false;
  }
  
  // Check download_logs table
  try {
    const { error: logsError } = await supabase
      .from('download_logs')
      .select('id')
      .limit(1);
    
    if (logsError) {
      console.log('❌ download_logs table: NOT FOUND');
      console.log('   Error:', logsError.message);
      allGood = false;
    } else {
      console.log('✅ download_logs table: EXISTS');
    }
  } catch (e: any) {
    console.log('❌ download_logs table check failed:', e.message);
    allGood = false;
  }
  
  // Check storage bucket
  try {
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage check failed:', bucketsError.message);
      allGood = false;
    } else {
      const downloadsBucket = buckets?.find(b => b.name === 'downloads');
      if (downloadsBucket) {
        console.log('✅ downloads storage bucket: EXISTS');
        console.log(`   Public: ${downloadsBucket.public}`);
      } else {
        console.log('❌ downloads storage bucket: NOT FOUND');
        allGood = false;
      }
    }
  } catch (e: any) {
    console.log('❌ Storage bucket check failed:', e.message);
    allGood = false;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (!allGood) {
    console.log('⚠️  SETUP INCOMPLETE\n');
    console.log('📝 Next steps:');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Copy the SQL from: DOWNLOADS_SETUP.md');
    console.log('3. Paste and run it in the SQL Editor');
    console.log('4. Go to Storage → Create bucket "downloads" (Public)');
    console.log('5. Run this check again\n');
  } else {
    console.log('🎉 SETUP COMPLETE!\n');
    console.log('✨ You can now:');
    console.log('• Visit http://localhost:3000/downloads');
    console.log('• Upload your first lead magnet');
    console.log('• Start capturing leads!\n');
  }
  
  return allGood;
}

checkDownloadsSetup().catch(console.error);

export {};
