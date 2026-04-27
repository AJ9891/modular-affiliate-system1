import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

type Niche = {
  id: string
  name: string
}

export default async function SupabaseExamplePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: niches } = await supabase
    .from('niches')
    .select('id, name')
    .limit(20)
    .returns<Niche[]>()

  return (
    <ul>
      {niches?.map((niche) => (
        <li key={niche.id}>{niche.name}</li>
      ))}
    </ul>
  )
}
