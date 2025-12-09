import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get download record
    const { data: download, error: fetchError } = await supabase
      .from('downloads')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !download) {
      return NextResponse.json({ error: 'Download not found' }, { status: 404 });
    }

    // Check if active
    if (!download.is_active) {
      return NextResponse.json({ error: 'This download is no longer available' }, { status: 410 });
    }

    // Get email from query params (for tracking)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const funnelId = searchParams.get('funnelId');

    // If email is required and not provided, return error
    if (download.require_email && !email) {
      return NextResponse.json({ 
        error: 'Email required',
        requireEmail: true,
        downloadInfo: {
          title: download.title,
          description: download.description,
          fileName: download.file_name,
          fileSize: download.file_size
        }
      }, { status: 400 });
    }

    // Track the download
    if (email) {
      const userAgent = request.headers.get('user-agent') || '';
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '';

      await supabase.from('download_logs').insert({
        download_id: id,
        email: email,
        ip_address: ip,
        user_agent: userAgent,
        funnel_id: funnelId || null
      });

      // Increment download count
      await supabase
        .from('downloads')
        .update({ download_count: download.download_count + 1 })
        .eq('id', id);

      // Also capture as a lead if email is provided
      // Silent fail if lead already exists
      try {
        await supabase.from('leads').insert({
          email: email,
          funnel_id: funnelId || null,
          source: 'download',
          metadata: {
            download_id: id,
            download_title: download.title
          }
        });
      } catch {
        // Ignore lead insertion errors (e.g., duplicate email)
      }
    }

    // Redirect to the actual file
    return NextResponse.redirect(download.storage_url);

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
