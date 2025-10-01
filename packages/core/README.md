# Md2Pptx Converter

Convert Markdown to PowerPoint presentations with **design/content separation**.

## ✨ Features

- 🎨 **Design/Content Separation**: Templates managed separately from content
- 🔒 **Type Safe**: Built with TypeScript and Zod validation
- 🎯 **Simple API**: Easy-to-use converter interface
- 📊 **Auto Slide Split**: Automatically split slides by heading levels
- 🎭 **Template System**: JSON-based template definitions

## 🏗️ Architecture

```
Markdown Input
    ↓
  Parser (marked)
    ↓
Internal AST
    ↓
Template Engine
    ↓
PptxGenJS
    ↓
PowerPoint Output
```

## 📦 Installation

```bash
npm install
```

## 🚀 Quick Start

```typescript
import { Md2PptxConverter } from './src/index.js'
import template from './templates/default.json'

const converter = new Md2PptxConverter({
  template,
  splitSlides: true,
  slideBreakLevel: 2, // New slide on ## headings
})

await converter.convertFile('input.md', 'output.pptx')
```

## 🎯 Demo

```bash
npm run dev examples/demo.ts
```

This will convert `examples/sample.md` to `examples/output.pptx`.

## 📁 Project Structure

```
.
├── src/
│   ├── types/           # Type definitions (Zod schemas)
│   ├── parser/          # Markdown parser
│   ├── converter/       # PPTX generator
│   └── index.ts         # Main API
├── templates/           # Template definitions
│   └── default.json     # Default template
├── examples/            # Usage examples
│   ├── sample.md        # Sample markdown
│   └── demo.ts          # Demo script
└── README.md
```

## 🎨 Template System

Templates are defined in JSON format:

```json
{
  "name": "my-template",
  "version": "1.0.0",
  "slideSize": {
    "width": 10,
    "height": 5.625
  },
  "layouts": [
    {
      "name": "standard",
      "background": { "color": "FFFFFF" },
      "styles": {
        "title": {
          "fontSize": 44,
          "fontFace": "Arial",
          "color": "363636",
          "bold": true
        },
        "body": {
          "fontSize": 18,
          "fontFace": "Arial",
          "color": "363636"
        }
      }
    }
  ],
  "defaultLayout": "standard"
}
```

## 📝 Supported Markdown Features

- [x] Headings (H1-H6)
- [x] Paragraphs
- [x] Lists (bullet points)
- [x] Code blocks
- [ ] Images (planned)
- [ ] Tables (planned)
- [ ] Links (planned)

## 🛠️ Development

```bash
# Development mode with watch
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Test
npm test
```

## 📚 API Reference

### `Md2PptxConverter`

Main converter class.

#### Constructor

```typescript
new Md2PptxConverter(options: ConverterOptions)
```

#### Methods

- `convert(markdown: string): Promise<PptxGenerator>` - Convert markdown string
- `convertFile(markdownPath: string, outputPath?: string): Promise<void>` - Convert markdown file

### `ConverterOptions`

```typescript
interface ConverterOptions {
  template: Template
  outputPath?: string
  splitSlides?: boolean
  slideBreakLevel?: number // 1-6
}
```

## 🎯 Design Philosophy

This project follows the **ZEAMI Framework** principles:

1. **Best Practices First** - Use established solutions (PptxGenJS, marked)
2. **Root Cause Resolution** - Proper AST-based architecture
3. **Maintain Simplicity** - Clean separation of concerns
4. **Type Safety** - TypeScript + Zod validation
5. **Proactive Execution** - Sensible defaults with override options

## 📄 License

MIT

## 🙏 Acknowledgments

- [PptxGenJS](https://github.com/gitbrent/PptxGenJS) - PowerPoint generation
- [marked](https://github.com/markedjs/marked) - Markdown parsing
- [Zod](https://github.com/colinhacks/zod) - Schema validation
