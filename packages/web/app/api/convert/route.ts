import { NextRequest, NextResponse } from 'next/server'
import { Md2PptxConverter } from '@md2pptx/core'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read markdown content
    const buffer = Buffer.from(await file.arrayBuffer())
    const markdown = buffer.toString('utf-8')

    // Load default template
    const templatePath = join(process.cwd(), '../../packages/core/templates/default.json')
    const template = JSON.parse(readFileSync(templatePath, 'utf-8'))

    // Convert
    const converter = new Md2PptxConverter({
      template,
      splitSlides: true,
      slideBreakLevel: 2,
    })

    const generator = await converter.convert(markdown)

    // Generate PPTX buffer
    const pptxBuffer = await generator.pptx.write({ outputType: 'arraybuffer' })

    // Return PPTX file
    return new NextResponse(pptxBuffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.md$/, '.pptx')}"`,
      },
    })
  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: 'Conversion failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
