import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Template } from '../types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const TEMPLATE_DIR = join(__dirname, '../../templates')

export const AVAILABLE_TEMPLATES = [
  'default',
  'corporate-blue',
  'modern-gradient',
  'minimal-elegant',
  'vibrant-creative',
] as const

export type TemplateId = typeof AVAILABLE_TEMPLATES[number]

/**
 * Load a template by ID
 */
export function loadTemplate(id: TemplateId): Template {
  const templatePath = join(TEMPLATE_DIR, `${id}.json`)
  const templateData = readFileSync(templatePath, 'utf-8')
  return JSON.parse(templateData) as Template
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
