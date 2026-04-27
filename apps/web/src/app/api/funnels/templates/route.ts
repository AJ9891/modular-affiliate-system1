import { NextRequest, NextResponse } from 'next/server'
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
