import { createClient } from '@supabase/supabase-js'
import RenderFunnel from '@/components/RenderFunnel'

const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  publicKey!
)

interface FunnelPageProps {
  params: Promise<{ slug: string }>
}

export default async function FunnelPage({ params }: FunnelPageProps) {
  const { slug } = await params
  const { data: funnel } = await supabase
    .from('funnels')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!funnel) {
    return <div>Funnel not found</div>
  }

  return <RenderFunnel funnel={funnel} />
}
