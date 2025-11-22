import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'
import { moduleLoader } from '@/lib/module-loader'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const moduleId = params.id

    // Load the module
    const module = await moduleLoader.loadModule(moduleId)
    
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found or invalid' },
        { status: 404 }
      )
    }

    // Save activation to database
    const { data, error } = await supabase!
      .from('niches')
      .upsert({ 
        module_id: module.module_id,
        name: module.name,
        version: module.version,
        active: true
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Module activated successfully',
      module 
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
