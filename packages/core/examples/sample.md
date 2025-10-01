# Welcome to Md2Pptx

This is a sample presentation created from Markdown.

## Features

- **Design/Content Separation**: Templates are managed separately
- **Type Safe**: Built with TypeScript and Zod
- **Easy to Use**: Simple API for conversion

## How It Works

The converter parses Markdown into an AST (Abstract Syntax Tree), then generates PowerPoint presentations using templates.

### Architecture

1. Parse Markdown
2. Build AST
3. Apply Template
4. Generate PPTX

## Code Example

```typescript
const converter = new Md2PptxConverter({
  template: defaultTemplate,
  splitSlides: true
})
await converter.convertFile('input.md', 'output.pptx')
```

## Thank You!

Start creating beautiful presentations from Markdown today.
