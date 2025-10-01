import PptxGenJS from 'pptxgenjs'
import type { MarkdownDocument, MarkdownNode, Template, TemplateLayout } from '../types/index.js'
import { parseInlineFormatting, toPptxTextArray } from '../parser/markdown-formatter.js'

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
    let slide = this.pptx.addSlide()

    // Set background
    if (layout.background?.color) {
      slide.background = { color: layout.background.color }
    }

    let yPosition = 0.5 // Start position in inches
    const maxY = 4.8 // Maximum Y position (leave ~0.8 inches margin at bottom for safety)

    for (const node of document.nodes) {
      // Calculate required height for this node
      const estimatedHeight = this.estimateNodeHeight(node)

      // If content would overflow, create new slide
      if (yPosition + estimatedHeight > maxY && yPosition > 0.5) {
        slide = this.pptx.addSlide()
        if (layout.background?.color) {
          slide.background = { color: layout.background.color }
        }
        yPosition = 0.5
      }

      yPosition = this.renderNode(slide, node, layout, yPosition)
    }
  }

  /**
   * Estimate the height a node will occupy
   * Considers Japanese text which takes more vertical space
   */
  private estimateNodeHeight(node: MarkdownNode, fontSize?: number): number {
    // Helper to detect if text contains Japanese characters
    const hasJapanese = (text: string) => /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(text)

    switch (node.type) {
      case 'heading': {
        const content = node.content || ''
        const level = node.level || 1
        const headingFontSize = fontSize || (level === 1 ? 32 : level === 2 ? 28 : 24)
        const isJapanese = hasJapanese(content)

        // Japanese characters are wider, so fewer chars per line
        const charsPerLine = isJapanese ? 30 : 50
        const estimatedLines = Math.ceil(content.length / charsPerLine)
        const lineHeight = (headingFontSize / 72) * 1.2 // Convert pt to inches with line spacing

        return Math.max(0.5, estimatedLines * lineHeight) + 0.3
      }
      case 'paragraph': {
        const content = node.content || ''
        const bodyFontSize = fontSize || 14
        const isJapanese = hasJapanese(content)

        const charsPerLine = isJapanese ? 40 : 70
        const estimatedLines = Math.ceil(content.length / charsPerLine)
        const lineHeight = (bodyFontSize / 72) * 1.3

        return Math.max(0.4, estimatedLines * lineHeight) + 0.2
      }
      case 'list': {
        const items = node.children || []
        const bodyFontSize = fontSize || 14
        let totalHeight = 0

        items.forEach((item) => {
          const content = item.content || ''
          const isJapanese = hasJapanese(content)
          const charsPerLine = isJapanese ? 35 : 65
          const estimatedLines = Math.ceil(content.length / charsPerLine)
          const lineHeight = (bodyFontSize / 72) * 1.3
          totalHeight += Math.max(0.35, estimatedLines * lineHeight)
        })

        return totalHeight + 0.4
      }
      case 'code': {
        const lines = (node.content || '').split('\n').length
        const codeFontSize = fontSize || 10
        const lineHeight = (codeFontSize / 72) * 1.4
        return Math.max(0.5, lines * lineHeight) + 0.3
      }
      default:
        return 0.5
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

      case 'table':
        return this.renderTable(slide, node, layout, yPosition)

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

    // Calculate dynamic height based on text length and language
    const content = node.content || ''
    const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(content)
    const charsPerLine = hasJapanese ? 30 : 50
    const estimatedLines = Math.ceil(content.length / charsPerLine)
    const height = Math.max(0.5, estimatedLines * (fontSize / 72) * 1.2 + 0.3)

    // Parse inline formatting
    const formatted = parseInlineFormatting(node.content || '')
    const textArray = toPptxTextArray(formatted).map((part) => ({
      text: part.text,
      options: {
        ...part.options,
        bold: part.options?.bold ?? style.bold !== false,
        fontSize,
        color: style.color || '363636',
        fontFace: style.fontFace || 'Arial',
      },
    }))

    slide.addText(textArray, {
      x: 0.5,
      y: yPosition,
      w: 9,
      h: height,
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
    const fontSize = style.fontSize || 14

    // Calculate dynamic height based on text length and language
    const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(content)
    const charsPerLine = hasJapanese ? 40 : 70
    const estimatedLines = Math.ceil(content.length / charsPerLine)
    const height = Math.max(0.4, estimatedLines * (fontSize / 72) * 1.3 + 0.2)

    // Parse inline formatting
    const formatted = parseInlineFormatting(content)
    const textArray = toPptxTextArray(formatted).map((part) => ({
      text: part.text,
      options: {
        ...part.options,
        fontSize,
        color: style.color || '363636',
        fontFace: style.fontFace || 'Arial',
      },
    }))

    slide.addText(textArray, {
      x: 0.5,
      y: yPosition,
      w: 9,
      h: height,
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
    const fontSize = style.fontSize || 14
    const maxY = 4.8 // Use same safety margin as main render loop

    // Helper to detect Japanese text
    const hasJapanese = (text: string) => /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(text)

    // Calculate height for each item individually
    const itemHeights: number[] = []
    items.forEach((item) => {
      const content = item.content || ''
      const isJapanese = hasJapanese(content)
      const charsPerLine = isJapanese ? 35 : 65
      const estimatedLines = Math.ceil(content.length / charsPerLine)
      const lineHeight = (fontSize / 72) * 1.3
      itemHeights.push(Math.max(0.35, estimatedLines * lineHeight))
    })

    let currentY = yPosition
    let currentSlide = slide
    let currentItems: any[] = []
    let currentHeight = 0

    // Process each item and split if necessary
    items.forEach((item, index) => {
      const itemHeight = itemHeights[index]

      // Check if adding this item would overflow
      if (currentY + currentHeight + itemHeight > maxY && currentItems.length > 0) {
        // Render current batch
        this.renderListBatch(currentSlide, currentItems, style, fontSize, currentY, currentHeight)

        // Create new slide
        currentSlide = this.pptx.addSlide()
        if (layout.background?.color) {
          currentSlide.background = { color: layout.background.color }
        }
        currentY = 0.5
        currentItems = []
        currentHeight = 0
      }

      // Add item to current batch
      const formatted = parseInlineFormatting(item.content || '')
      if (formatted.length === 1 && !formatted[0].bold && !formatted[0].italic) {
        currentItems.push({
          text: formatted[0].text,
          options: {
            bullet: true,
            fontSize,
            color: style.color || '363636',
            fontFace: style.fontFace || 'Arial',
          },
        })
      } else {
        formatted.forEach((part, i) => {
          currentItems.push({
            text: part.text,
            options: {
              bullet: i === 0,
              bold: part.bold,
              italic: part.italic,
              fontSize,
              color: style.color || '363636',
              fontFace: style.fontFace || 'Arial',
            },
          })
        })
      }

      // Handle nested list items
      if (item.children && item.children.length > 0) {
        item.children.forEach((nestedItem: any) => {
          const nestedFormatted = parseInlineFormatting(nestedItem.content || '')
          nestedFormatted.forEach((part, i) => {
            currentItems.push({
              text: part.text,
              options: {
                bullet: i === 0,
                bold: part.bold,
                italic: part.italic,
                fontSize: fontSize - 1, // Slightly smaller for nested items
                color: style.color || '363636',
                fontFace: style.fontFace || 'Arial',
                indentLevel: 1, // Indent nested items
              },
            })
          })
        })
      }

      currentHeight += itemHeight
    })

    // Render remaining items
    if (currentItems.length > 0) {
      this.renderListBatch(currentSlide, currentItems, style, fontSize, currentY, currentHeight)
    }

    return currentY + currentHeight + 0.3
  }

  private renderListBatch(
    slide: PptxGenJS.Slide,
    items: any[],
    style: any,
    fontSize: number,
    yPosition: number,
    height: number
  ): void {
    slide.addText(items, {
      x: 0.7,
      y: yPosition,
      w: 8.8,
      h: height,
      valign: 'top',
      wrap: true,
    })
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

  private renderTable(
    slide: PptxGenJS.Slide,
    node: MarkdownNode,
    layout: TemplateLayout,
    yPosition: number
  ): number {
    const style = layout.styles.body || {}
    const fontSize = style.fontSize || 12

    // Extract table data from node
    // Expected format: node.children = [header row, ...data rows]
    // Each row has children = [cell, cell, cell...]
    const rows = node.children || []
    if (rows.length === 0) return yPosition

    const tableData: any[][] = []
    rows.forEach((row: any) => {
      const rowData: any[] = []
      ;(row.children || []).forEach((cell: any) => {
        rowData.push({
          text: cell.content || '',
          options: {
            fontSize,
            color: style.color || '363636',
            fontFace: style.fontFace || 'Arial',
            align: 'left',
            valign: 'middle',
          },
        })
      })
      tableData.push(rowData)
    })

    // Calculate table dimensions
    const numCols = Math.max(...tableData.map((row) => row.length))
    const numRows = tableData.length
    const colWidth = 9 / numCols // Distribute width evenly
    const rowHeight = 0.35 // Fixed row height
    const tableHeight = numRows * rowHeight

    // Add table to slide
    slide.addTable(tableData, {
      x: 0.5,
      y: yPosition,
      w: 9,
      colW: Array(numCols).fill(colWidth),
      rowH: Array(numRows).fill(rowHeight),
      border: { pt: 1, color: 'CCCCCC' },
      fill: { color: 'FFFFFF' },
      // Make header row bold with background color
      autoPage: false,
    })

    // Style header row if it exists
    if (tableData.length > 0) {
      tableData[0].forEach((cell: any) => {
        cell.options.bold = true
        cell.options.fill = { color: 'F0F0F0' }
      })
    }

    return yPosition + tableHeight + 0.4
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
