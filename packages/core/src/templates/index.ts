import { readFileSync } from 'fs'
import { join } from 'path'
import type { Template } from '../types/index.js'

export const AVAILABLE_TEMPLATES = [
  'default',
  'corporate-blue',
  'modern-gradient',
  'minimal-elegant',
  'vibrant-creative',
] as const

export type TemplateId = typeof AVAILABLE_TEMPLATES[number]

// Cache for loaded templates
const templateCache = new Map<TemplateId, Template>()

/**
 * Get the templates directory path
 * Works in both development and production (Vercel)
 */
function getTemplatesDir(): string {
  // Check if we're in the web package context (Vercel deployment)
  const webPublicPath = join(process.cwd(), 'public/templates')
  const coreTemplatePath = join(__dirname, '../../templates')
  const devTemplatePath = join(process.cwd(), 'packages/core/templates')

  // Try in order of preference
  try {
    if (typeof __dirname !== 'undefined') {
      // First try the compiled location
      if (require('fs').existsSync(coreTemplatePath)) {
        return coreTemplatePath
      }
    }
    // Then try web public directory (Vercel deployment)
    if (require('fs').existsSync(webPublicPath)) {
      return webPublicPath
    }
    // Finally try development path
    if (require('fs').existsSync(devTemplatePath)) {
      return devTemplatePath
    }
  } catch (e) {
    // Ignore and use fallback
  }

  // Default fallback
  return coreTemplatePath
}

/**
 * Load a template by ID
 */
export function loadTemplate(id: TemplateId): Template {
  // Return cached template if available
  if (templateCache.has(id)) {
    return templateCache.get(id)!
  }

  try {
    const templatesDir = getTemplatesDir()
    const templatePath = join(templatesDir, `${id}.json`)
    const templateData = readFileSync(templatePath, 'utf-8')
    const template = JSON.parse(templateData) as Template

    // Cache the template
    templateCache.set(id, template)

    return template
  } catch (error) {
    console.error(`Failed to load template "${id}":`, error)
    throw new Error(`Template "${id}" not found or invalid`)
  }
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
