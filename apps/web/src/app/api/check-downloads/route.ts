import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const results = {
      downloads_table: false,
      download_logs_table: false,
      storage_bucket: false,
      errors: [] as string[]
    };
    
    // Check downloads table
    const { error: downloadsError } = await supabase
      .from('downloads')
      .select('id')
      .limit(1);
    
    if (downloadsError) {
      results.errors.push(`downloads table: ${downloadsError.message}`);
    } else {
      results.downloads_table = true;
    }
    
    // Check download_logs table
    const { error: logsError } = await supabase
      .from('download_logs')
      .select('id')
      .limit(1);
    
    if (logsError) {
      results.errors.push(`download_logs table: ${logsError.message}`);
    } else {
      results.download_logs_table = true;
    }
    
    // Check storage bucket
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      results.errors.push(`storage: ${bucketsError.message}`);
    } else {
      const downloadsBucket = buckets?.find((b: any) => b.name === 'downloads');
      if (downloadsBucket) {
        results.storage_bucket = true;
      } else {
        results.errors.push('downloads storage bucket not found');
      }
    }
    
    const allGood = results.downloads_table && results.download_logs_table && results.storage_bucket;
    
    return NextResponse.json({
      success: allGood,
      ...results,
      message: allGood 
        ? '✅ Setup complete! Downloads system is ready.' 
        : '⚠️ Setup incomplete. Check errors array.'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
