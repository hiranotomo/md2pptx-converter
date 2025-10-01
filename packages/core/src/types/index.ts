import { z } from 'zod'

/**
 * Markdown AST (Abstract Syntax Tree)
 */
export const MarkdownNodeSchema = z.object({
  type: z.enum(['heading', 'paragraph', 'list', 'listItem', 'code', 'image', 'table']),
  level: z.number().optional(), // For headings (1-6)
  content: z.string().optional(),
  children: z.array(z.any()).optional(),
  lang: z.string().optional(), // For code blocks
  src: z.string().optional(), // For images
  alt: z.string().optional(), // For images
})

export type MarkdownNode = z.infer<typeof MarkdownNodeSchema>

export const MarkdownDocumentSchema = z.object({
  nodes: z.array(MarkdownNodeSchema),
  metadata: z.record(z.string(), z.any()).optional(),
})

export type MarkdownDocument = z.infer<typeof MarkdownDocumentSchema>

/**
 * Template System
 */
export const TemplateStyleSchema = z.object({
  fontSize: z.number().optional(),
  fontFace: z.string().optional(),
  color: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  valign: z.enum(['top', 'middle', 'bottom']).optional(),
})

export type TemplateStyle = z.infer<typeof TemplateStyleSchema>

export const TemplateLayoutSchema = z.object({
  name: z.string(),
  background: z.object({
    color: z.string().optional(),
    image: z.string().optional(),
  }).optional(),
  styles: z.object({
    title: TemplateStyleSchema.optional(),
    heading1: TemplateStyleSchema.optional(),
    heading2: TemplateStyleSchema.optional(),
    heading3: TemplateStyleSchema.optional(),
    body: TemplateStyleSchema.optional(),
    code: TemplateStyleSchema.optional(),
  }),
})

export type TemplateLayout = z.infer<typeof TemplateLayoutSchema>

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(['Corporate', 'Modern', 'Minimal', 'Creative']).optional(),
  author: z.string().optional(),
  colors: z.array(z.string()).optional(),
  version: z.string(),
  slideSize: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  layouts: z.array(TemplateLayoutSchema),
  defaultLayout: z.string(),
})

export type Template = z.infer<typeof TemplateSchema>

/**
 * Converter Options
 */
export const ConverterOptionsSchema = z.object({
  template: TemplateSchema,
  outputPath: z.string().optional(),
  splitSlides: z.boolean().optional(), // Split by headings
  slideBreakLevel: z.number().min(1).max(6).optional(), // Which heading level triggers new slide
})

export type ConverterOptions = z.infer<typeof ConverterOptionsSchema>
