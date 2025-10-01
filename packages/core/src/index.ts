import { MarkdownParser } from './parser/markdown-parser.js'
import { PptxGenerator } from './converter/pptx-generator.js'
import type { Template, ConverterOptions } from './types/index.js'

/**
 * Main converter class
 */
export class Md2PptxConverter {
  private parser: MarkdownParser
  private options: ConverterOptions

  constructor(options: ConverterOptions) {
    this.parser = new MarkdownParser()
    this.options = options
  }

  /**
   * Convert markdown to PPTX
   */
  async convert(markdown: string): Promise<PptxGenerator> {
    // Parse markdown
    const document = await this.parser.parse(markdown)

    // Split into slides if needed
    const generator = new PptxGenerator(this.options.template)

    if (this.options.splitSlides) {
      const slides = this.parser.splitIntoSlides(
        document,
        this.options.slideBreakLevel || 1
      )
      generator.generateFromSlides(slides)
    } else {
      generator.generate(document)
    }

    return generator
  }

  /**
   * Convert markdown file to PPTX file
   */
  async convertFile(
    markdownPath: string,
    outputPath?: string
  ): Promise<void> {
    const fs = await import('fs/promises')
    const path = await import('path')

    // Read markdown
    const markdown = await fs.readFile(markdownPath, 'utf-8')

    // Convert
    const generator = await this.convert(markdown)

    // Determine output path
    const output =
      outputPath ||
      this.options.outputPath ||
      markdownPath.replace(/\.md$/, '.pptx')

    // Save
    await generator.save(output)

    console.log(`✅ Generated: ${output}`)
  }
}

// Export types
export * from './types/index.js'
export { MarkdownParser } from './parser/markdown-parser.js'
export { PptxGenerator } from './converter/pptx-generator.js'
export { loadTemplate, getAllTemplates, AVAILABLE_TEMPLATES, type TemplateId } from './templates/index.js'
