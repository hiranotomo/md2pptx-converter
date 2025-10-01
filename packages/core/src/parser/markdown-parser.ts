import { marked, type Token } from 'marked'
import type { MarkdownDocument, MarkdownNode } from '../types/index.js'

/**
 * Parse Markdown to internal AST
 */
export class MarkdownParser {
  async parse(markdown: string): Promise<MarkdownDocument> {
    const tokens = marked.lexer(markdown)
    const nodes: MarkdownNode[] = []

    for (const token of tokens) {
      const node = this.tokenToNode(token)
      if (node) {
        nodes.push(node)
      }
    }

    return {
      nodes,
      metadata: {},
    }
  }

  private tokenToNode(token: Token): MarkdownNode | null {
    switch (token.type) {
      case 'heading':
        return {
          type: 'heading',
          level: token.depth,
          content: token.text,
        }

      case 'paragraph':
        return {
          type: 'paragraph',
          content: token.text,
        }

      case 'list': {
        const children = token.items.map((item: any) => ({
          type: 'listItem' as const,
          content: item.text,
        }))
        return {
          type: 'list',
          children,
        }
      }

      case 'code':
        return {
          type: 'code',
          content: token.text,
          lang: token.lang,
        }

      case 'image':
        return {
          type: 'image',
          src: token.href,
          alt: token.text,
        }

      case 'table':
        return {
          type: 'table',
          children: [], // TODO: Implement table parsing
        }

      default:
        return null
    }
  }

  /**
   * Split document into slides based on heading level
   */
  splitIntoSlides(
    document: MarkdownDocument,
    breakLevel: number = 1
  ): MarkdownDocument[] {
    const slides: MarkdownDocument[] = []
    let currentSlide: MarkdownNode[] = []

    for (const node of document.nodes) {
      if (node.type === 'heading' && node.level && node.level <= breakLevel) {
        // Start new slide
        if (currentSlide.length > 0) {
          slides.push({ nodes: currentSlide, metadata: document.metadata })
        }
        currentSlide = [node]
      } else {
        currentSlide.push(node)
      }
    }

    // Add last slide
    if (currentSlide.length > 0) {
      slides.push({ nodes: currentSlide, metadata: document.metadata })
    }

    return slides
  }
}
