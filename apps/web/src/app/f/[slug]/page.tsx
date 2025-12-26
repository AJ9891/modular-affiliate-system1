import { createClient } from '@supabase/supabase-js'
import RenderFunnel from '@/components/RenderFunnel'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface FunnelPageProps {
  params: {
    slug: string
  }
}

export default async function FunnelPage({ params }: FunnelPageProps) {
  const { data: funnel } = await supabase
    .from('funnels')
    .select('*')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (!funnel) {
    return <div>Funnel not found</div>
  }

  return <RenderFunnel funnel={funnel} />
}