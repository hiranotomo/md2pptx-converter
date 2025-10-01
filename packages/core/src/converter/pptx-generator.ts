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

    // Group nodes into slides based on H1/H2 headings and overflow
    const slideGroups = this.groupNodesIntoSlides(document.nodes)

    for (const group of slideGroups) {
      this.renderSlideGroup(group, layout)
    }
  }

  /**
   * Group nodes into logical slides
   * Each slide starts with a heading (title) and contains content
   */
  private groupNodesIntoSlides(nodes: MarkdownNode[]): MarkdownNode[][] {
    const groups: MarkdownNode[][] = []
    let currentGroup: MarkdownNode[] = []
    let currentHeight = 0.5
    const maxY = 4.8

    for (const node of nodes) {
      const estimatedHeight = this.estimateNodeHeight(node)
      const isHeading = node.type === 'heading' && (node.level === 1 || node.level === 2)

      // Start new slide on H1/H2 or when content would overflow
      if ((isHeading && currentGroup.length > 0) ||
          (currentHeight + estimatedHeight > maxY && currentGroup.length > 0)) {
        groups.push(currentGroup)
        currentGroup = []
        currentHeight = 0.5
      }

      currentGroup.push(node)
      currentHeight += estimatedHeight
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }

    return groups
  }

  /**
   * Render a group of nodes as a single slide with proper placeholders
   */
  private renderSlideGroup(nodes: MarkdownNode[], layout: TemplateLayout): void {
    const slide = this.pptx.addSlide()

    // Set background
    if (layout.background?.color) {
      slide.background = { color: layout.background.color }
    }

    // Find title (first H1 or H2)
    const titleNode = nodes.find(n => n.type === 'heading' && (n.level === 1 || n.level === 2))
    const contentNodes = titleNode ? nodes.filter(n => n !== titleNode) : nodes

    // Add title using placeholder
    if (titleNode) {
      const style = layout.styles.title || layout.styles.heading1 || {}
      const fontSize = style.fontSize || 32

      slide.addText(titleNode.content || '', {
        placeholder: 'title',
        fontSize,
        bold: style.bold !== false,
        color: style.color || '363636',
        fontFace: style.fontFace || 'Arial',
        align: style.align || 'left',
      })
    }

    // Add content using body placeholder
    if (contentNodes.length > 0) {
      const contentText = this.buildContentText(contentNodes, layout)

      if (contentText.length > 0) {
        slide.addText(contentText, {
          placeholder: 'body',
          x: 0.5,
          y: titleNode ? 1.2 : 0.5,
          w: 9,
          h: 4.0,
          valign: 'top',
        })
      }
    }
  }

  /**
   * Build structured content text array for outline support
   */
  private buildContentText(nodes: MarkdownNode[], layout: TemplateLayout): any[] {
    const contentText: any[] = []
    const bodyStyle = layout.styles.body || {}
    const fontSize = bodyStyle.fontSize || 18

    for (const node of nodes) {
      switch (node.type) {
        case 'heading': {
          const level = node.level || 3
          const headingFontSize = level === 3 ? 24 : level === 4 ? 20 : 18
          contentText.push({
            text: node.content || '',
            options: {
              fontSize: headingFontSize,
              bold: true,
              color: bodyStyle.color || '363636',
              fontFace: bodyStyle.fontFace || 'Arial',
              breakLine: true,
            },
          })
          break
        }

        case 'paragraph': {
          const formatted = parseInlineFormatting(node.content || '')
          formatted.forEach((part, i) => {
            contentText.push({
              text: part.text,
              options: {
                fontSize,
                bold: part.bold,
                italic: part.italic,
                color: bodyStyle.color || '363636',
                fontFace: bodyStyle.fontFace || 'Arial',
                breakLine: i === formatted.length - 1,
              },
            })
          })
          break
        }

        case 'list': {
          const items = node.children || []
          items.forEach((item: any) => {
            const formatted = parseInlineFormatting(item.content || '')
            formatted.forEach((part, i) => {
              contentText.push({
                text: part.text,
                options: {
                  bullet: i === 0,
                  fontSize,
                  bold: part.bold,
                  italic: part.italic,
                  color: bodyStyle.color || '363636',
                  fontFace: bodyStyle.fontFace || 'Arial',
                },
              })
            })

            // Nested list items
            if (item.children && item.children.length > 0) {
              item.children.forEach((nestedItem: any) => {
                const nestedFormatted = parseInlineFormatting(nestedItem.content || '')
                nestedFormatted.forEach((part, i) => {
                  contentText.push({
                    text: part.text,
                    options: {
                      bullet: i === 0,
                      fontSize: fontSize - 2,
                      bold: part.bold,
                      italic: part.italic,
                      color: bodyStyle.color || '363636',
                      fontFace: bodyStyle.fontFace || 'Arial',
                      indentLevel: 1,
                    },
                  })
                })
              })
            }
          })
          break
        }

        case 'code': {
          contentText.push({
            text: node.content || '',
            options: {
              fontSize: 14,
              fontFace: 'Courier New',
              color: '000000',
              breakLine: true,
            },
          })
          break
        }

        case 'table': {
          // Tables need special handling - render on separate slide
          this.renderTableSlide(node, layout)
          break
        }
      }
    }

    return contentText
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

  /**
   * Handle tables separately as they need special rendering
   */
  private renderTableSlide(node: MarkdownNode, layout: TemplateLayout): void {
    const slide = this.pptx.addSlide()

    if (layout.background?.color) {
      slide.background = { color: layout.background.color }
    }

    const style = layout.styles.body || {}
    const fontSize = style.fontSize || 12

    const rows = node.children || []
    if (rows.length === 0) return

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

    const numCols = Math.max(...tableData.map((row) => row.length))
    const numRows = tableData.length
    const colWidth = 9 / numCols
    const rowHeight = 0.35

    // Style header row
    if (tableData.length > 0) {
      tableData[0].forEach((cell: any) => {
        cell.options.bold = true
        cell.options.fill = { color: 'F0F0F0' }
      })
    }

    slide.addTable(tableData, {
      x: 0.5,
      y: 1.0,
      w: 9,
      colW: Array(numCols).fill(colWidth),
      rowH: Array(numRows).fill(rowHeight),
      border: { pt: 1, color: 'CCCCCC' },
      fill: { color: 'FFFFFF' },
      autoPage: false,
    })
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
