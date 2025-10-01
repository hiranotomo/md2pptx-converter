# Md2Pptx - Markdown to PowerPoint Converter

Convert Markdown files to professional PowerPoint presentations with **complete design/content separation**.

![Architecture](https://img.shields.io/badge/Architecture-Monorepo-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🎨 **Design/Content Separation**: Templates managed separately as JSON
- 🚀 **Modern Web UI**: Beautiful, responsive interface built with Next.js
- 🔒 **Type Safe**: Full TypeScript + Zod validation
- ⚡ **Fast Conversion**: Instant Markdown to PowerPoint transformation
- 📦 **Modular**: Core library can be used independently
- 🌐 **Deploy Ready**: Configured for Vercel deployment

## 🏗️ Architecture

```
monorepo/
├── packages/
│   ├── core/          # @md2pptx/core - Converter library (Node.js)
│   │   ├── src/       # TypeScript source
│   │   ├── templates/ # JSON template definitions
│   │   └── examples/  # Usage examples
│   └── web/           # @md2pptx/web - Next.js web application
│       ├── app/       # Next.js 15 App Router
│       ├── components/# React components
│       └── lib/       # Utilities
└── package.json       # Workspace root
```

### Data Flow

```
Markdown Input
    ↓
  Parser (marked)
    ↓
Internal AST
    ↓
Template Engine (JSON)
    ↓
PptxGenJS
    ↓
PowerPoint Output (.pptx)
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build core library
npm run build:core
```

### Development

```bash
# Run web app in development mode
npm run dev:web

# Run core library in development mode
npm run dev:core
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Core Library Independently

```typescript
import { Md2PptxConverter } from '@md2pptx/core'
import template from '@md2pptx/core/templates/default.json'

const converter = new Md2PptxConverter({
  template,
  splitSlides: true,
  slideBreakLevel: 2, // New slide on ## headings
})

await converter.convertFile('input.md', 'output.pptx')
```

## 📦 Packages

### @md2pptx/core

Core converter library. Can be used in any Node.js project.

**Features:**
- Markdown parsing
- AST generation
- Template system
- PPTX generation

**Installation:**
```bash
npm install @md2pptx/core
```

### @md2pptx/web

Web application with drag & drop interface.

**Tech Stack:**
- Next.js 15 (App Router)
- React 19
- TailwindCSS 4
- shadcn/ui components
- TypeScript

## 🎨 Template System

Templates define the visual design separately from content:

```json
{
  "name": "corporate",
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
        }
      }
    }
  ]
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

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Vercel auto-detects Next.js and deploys

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Manual Deployment

```bash
# Build all packages
npm run build

# Start production server
cd packages/web
npm start
```

## 🛠️ Development Scripts

```bash
# Development
npm run dev:core          # Run core in watch mode
npm run dev:web           # Run web app with hot reload

# Build
npm run build             # Build all packages
npm run build:core        # Build core only
npm run build:web         # Build web only

# Testing
npm test                  # Run tests in all packages
```

## 🎯 Design Philosophy (ZEAMI Framework)

This project follows the **ZEAMI Framework** principles:

1. **Best Practices First** - Use established solutions (PptxGenJS, marked)
2. **Root Cause Resolution** - Proper AST-based architecture
3. **Maintain Simplicity** - Clean separation of concerns
4. **Type Safety** - TypeScript + Zod validation throughout
5. **Proactive Execution** - Sensible defaults with override options

## 📚 Tech Stack

### Core
- **Runtime**: Node.js
- **Language**: TypeScript (ES2022)
- **Markdown Parser**: marked v12
- **PPTX Generation**: PptxGenJS v3.12
- **Validation**: Zod v3.22

### Web
- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: TailwindCSS 4
- **Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **File Upload**: react-dropzone

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT

## 🙏 Acknowledgments

- [PptxGenJS](https://github.com/gitbrent/PptxGenJS) - PowerPoint generation
- [marked](https://github.com/markedjs/marked) - Markdown parsing
- [Zod](https://github.com/colinhacks/zod) - Schema validation
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

Built with ❤️ using the ZEAMI Framework
