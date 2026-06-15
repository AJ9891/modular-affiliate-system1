import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServiceRoleClient, createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'
import {
  ALL_TEMPLATES,
  getTemplateById,
  type BrandVoice,
  type TemplateCategory,
} from '@/config/funnelTemplates'

const BRAND_VOICE_VALUES: BrandVoice[] = ['glitch', 'anchor', 'boost']
const CATEGORY_VALUES: TemplateCategory[] = ['lead_magnet', 'product_launch', 'webinar', 'affiliate_review', 'sales_page']

function isBrandVoice(value: string): value is BrandVoice {
  return BRAND_VOICE_VALUES.includes(value as BrandVoice)
}

function isTemplateCategory(value: string): value is TemplateCategory {
  return CATEGORY_VALUES.includes(value as TemplateCategory)
}

function normalizeTemplateType(value: unknown) {
  if (value === 'email' || value === 'block') return value
  return 'page'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')?.trim()
  const brandVoiceParam = searchParams.get('brandVoice')?.trim().toLowerCase()
  const categoryParam = searchParams.get('category')?.trim().toLowerCase()

  if (id) {
    const template = getTemplateById(id)
    if (!template) {
      return NextResponse.json({ error: `Template not found for id "${id}"` }, { status: 404 })
    }

    return NextResponse.json({
      templates: [template],
      count: 1,
      filters: { id },
    })
  }

  let templates = ALL_TEMPLATES

  if (brandVoiceParam) {
    if (!isBrandVoice(brandVoiceParam)) {
      return NextResponse.json(
        {
          error: `Invalid brandVoice "${brandVoiceParam}". Expected one of: ${BRAND_VOICE_VALUES.join(', ')}`,
        },
        { status: 400 }
      )
    }
    templates = templates.filter((template) => template.brandVoice === brandVoiceParam)
  }

  if (categoryParam) {
    if (!isTemplateCategory(categoryParam)) {
      return NextResponse.json(
        {
          error: `Invalid category "${categoryParam}". Expected one of: ${CATEGORY_VALUES.join(', ')}`,
        },
        { status: 400 }
      )
    }
    templates = templates.filter((template) => template.category === categoryParam)
  }

  return NextResponse.json({
    templates,
    count: templates.length,
    filters: {
      brandVoice: brandVoiceParam || null,
      category: categoryParam || null,
    },
  })
}

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    await requireUser(supabase)
    const body = await request.json().catch(() => ({}))

    const insertData = {
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Generated Template',
      type: normalizeTemplateType(body.type),
      content: {
        ...(body.content && typeof body.content === 'object' ? body.content : {}),
        originalType: typeof body.type === 'string' ? body.type : null,
      },
      niche_id: null,
      preview_url: null,
    }

    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient
      .from('templates')
      .insert(insertData)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to save template' }, { status: 400 })
    }

    return NextResponse.json({ template: data }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save template'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
