import type { Template } from '../types/index.js'

// Import templates directly
import defaultTemplate from '../../templates/default.json' assert { type: 'json' }
import corporateBlueTemplate from '../../templates/corporate-blue.json' assert { type: 'json' }
import modernGradientTemplate from '../../templates/modern-gradient.json' assert { type: 'json' }
import minimalElegantTemplate from '../../templates/minimal-elegant.json' assert { type: 'json' }
import vibrantCreativeTemplate from '../../templates/vibrant-creative.json' assert { type: 'json' }

export const AVAILABLE_TEMPLATES = [
  'default',
  'corporate-blue',
  'modern-gradient',
  'minimal-elegant',
  'vibrant-creative',
] as const

export type TemplateId = typeof AVAILABLE_TEMPLATES[number]

const TEMPLATE_MAP: Record<TemplateId, Template> = {
  'default': defaultTemplate as Template,
  'corporate-blue': corporateBlueTemplate as Template,
  'modern-gradient': modernGradientTemplate as Template,
  'minimal-elegant': minimalElegantTemplate as Template,
  'vibrant-creative': vibrantCreativeTemplate as Template,
}

/**
 * Load a template by ID
 */
export function loadTemplate(id: TemplateId): Template {
  return TEMPLATE_MAP[id]
}

/**
 * Get all available templates metadata
 */
export function getAllTemplates(): Array<{
  id: string
  name: string
  description?: string
  category?: string
  colors?: string[]
}> {
  return AVAILABLE_TEMPLATES.map((id) => {
    const template = loadTemplate(id)
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      colors: template.colors,
    }
  })
}
