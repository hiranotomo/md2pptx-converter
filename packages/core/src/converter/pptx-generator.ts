import PptxGenJS from 'pptxgenjs'
import type { MarkdownDocument, MarkdownNode, Template, TemplateLayout } from '../types/index.js'

/**
 * Generate PPTX from Markdown AST
 */
export class PptxGenerator {
  private pptx: PptxGenJS
  private template: Template

  constructor(template: Template) {
    this.pptx = new PptxGenJS()
    this.template = template

    // Set slide size if specified
    if (template.slideSize) {
      this.pptx.defineLayout({
        name: 'CUSTOM',
        width: template.slideSize.width,
        height: template.slideSize.height,
      })
      this.pptx.layout = 'CUSTOM'
    }
  }

  /**
   * Generate PPTX from markdown document
   */
  generate(document: MarkdownDocument): PptxGenJS {
    this.renderDocument(document)
    return this.pptx
  }

  /**
   * Generate PPTX from multiple slides
   */
  generateFromSlides(slides: MarkdownDocument[]): PptxGenJS {
    for (const slide of slides) {
      this.renderDocument(slide)
    }
    return this.pptx
  }

  private renderDocument(document: MarkdownDocument): void {
    const layout = this.getLayout(this.template.defaultLayout)
    const slide = this.pptx.addSlide()

    // Set background
    if (layout.background?.color) {
      slide.background = { color: layout.background.color }
    }

    let yPosition = 0.5 // Start position in inches

    for (const node of document.nodes) {
      yPosition = this.renderNode(slide, node, layout, yPosition)
    }
  }

  private renderNode(
    slide: PptxGenJS.Slide,
    node: MarkdownNode,
    layout: TemplateLayout,
    yPosition: number
  ): number {
    switch (node.type) {
      case 'heading':
        return this.renderHeading(slide, node, layout, yPosition)

      case 'paragraph':
        return this.renderParagraph(slide, node, layout, yPosition)

      case 'list':
        return this.renderList(slide, node, layout, yPosition)

      case 'code':
        return this.renderCode(slide, node, layout, yPosition)

      default:
        return yPosition
    }
  }

  private renderHeading(
    slide: PptxGenJS.Slide,
    node: MarkdownNode,
    layout: TemplateLayout,
    yPosition: number
  ): number {
    const level = node.level || 1
    const styleKey = level === 1 ? 'title' : (`heading${Math.min(level, 3)}` as 'heading1' | 'heading2' | 'heading3')
    const style = layout.styles[styleKey] || layout.styles.body || {}
    const fontSize = style.fontSize || (level === 1 ? 32 : level === 2 ? 28 : 24)

    // Calculate dynamic height based on text length
    const textLength = (node.content || '').length
    const estimatedLines = Math.ceil(textLength / 50) // Approximate 50 chars per line
    const height = Math.max(0.5, estimatedLines * 0.4)

    slide.addText(node.content || '', {
      x: 0.5,
      y: yPosition,
      w: 9,
      h: height,
      fontSize,
      bold: style.bold !== false,
      color: style.color || '363636',
      fontFace: style.fontFace || 'Arial',
      align: style.align,
      valign: 'top',
      wrap: true,
    })

    return yPosition + height + 0.3
  }

  private renderParagraph(
    slide: PptxGenJS.Slide,
    node: MarkdownNode,
    layout: TemplateLayout,
    yPosition: number
  ): number {
    const style = layout.styles.body || {}
    const content = node.content || ''

    // Calculate dynamic height based on text length
    const textLength = content.length
    const estimatedLines = Math.ceil(textLength / 70) // Approximate 70 chars per line for body text
    const height = Math.max(0.4, estimatedLines * 0.3)

    slide.addText(content, {
      x: 0.5,
      y: yPosition,
      w: 9,
      h: height,
      fontSize: style.fontSize || 14,
      color: style.color || '363636',
      fontFace: style.fontFace || 'Arial',
      align: style.align,
      valign: 'top',
      wrap: true,
    })

    return yPosition + height + 0.2
  }

  private renderList(
    slide: PptxGenJS.Slide,
    node: MarkdownNode,
    layout: TemplateLayout,
    yPosition: number
  ): number {
    const style = layout.styles.body || {}
    const items = node.children || []

    // Calculate total height for all list items
    let totalHeight = 0
    items.forEach((item) => {
      const textLength = (item.content || '').length
      const estimatedLines = Math.ceil(textLength / 65) // Approximate 65 chars per line for list items
      totalHeight += Math.max(0.3, estimatedLines * 0.25)
    })

    const text = items
      .map((item) => ({ text: item.content || '', options: { bullet: true } }))

    slide.addText(text, {
      x: 0.7,
      y: yPosition,
      w: 8.8,
      h: totalHeight,
      fontSize: style.fontSize || 14,
      color: style.color || '363636',
      fontFace: style.fontFace || 'Arial',
      valign: 'top',
      wrap: true,
    })

    return yPosition + totalHeight + 0.3
  }

  private renderCode(
    slide: PptxGenJS.Slide,
    node: MarkdownNode,
    layout: TemplateLayout,
    yPosition: number
  ): number {
    const style = layout.styles.code || layout.styles.body || {}
    const content = node.content || ''
    const lines = content.split('\n').length
    const height = Math.max(0.5, lines * 0.2)

    slide.addText(content, {
      x: 0.5,
      y: yPosition,
      w: 9,
      h: height,
      fontSize: style.fontSize || 10,
      fontFace: style.fontFace || 'Courier New',
      color: style.color || '000000',
      fill: { color: 'F5F5F5' },
      valign: 'top',
      wrap: true,
    })

    return yPosition + height + 0.3
  }

  private getLayout(name: string): TemplateLayout {
    const layout = this.template.layouts.find((l) => l.name === name)
    if (!layout) {
      throw new Error(`Layout "${name}" not found in template`)
    }
    return layout
  }

  /**
   * Save PPTX to file
   */
  async save(filename: string): Promise<void> {
    await this.pptx.writeFile({ fileName: filename })
  }
}
