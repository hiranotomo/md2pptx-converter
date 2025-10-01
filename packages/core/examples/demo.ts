import { Md2PptxConverter } from '../src/index.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  // Load template
  const templatePath = join(__dirname, '../templates/default.json')
  const template = JSON.parse(readFileSync(templatePath, 'utf-8'))

  // Create converter
  const converter = new Md2PptxConverter({
    template,
    splitSlides: true,
    slideBreakLevel: 2, // New slide on ## headings
  })

  // Convert sample markdown
  const samplePath = join(__dirname, 'sample.md')
  const outputPath = join(__dirname, 'output.pptx')

  console.log('🔄 Converting markdown to PowerPoint...')
  await converter.convertFile(samplePath, outputPath)
  console.log('✨ Done!')
}

main().catch(console.error)
