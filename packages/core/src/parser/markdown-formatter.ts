/**
 * Parse inline markdown formatting (bold, italic)
 */
export interface FormattedText {
  text: string
  bold?: boolean
  italic?: boolean
}

/**
 * Parse markdown text with bold (**text**) and italic (*text*) formatting
 */
export function parseInlineFormatting(text: string): FormattedText[] {
  const result: FormattedText[] = []
  let currentIndex = 0

  // Pattern: **bold**, *italic*, ***bold italic***
  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Add plain text before the match
    if (match.index > currentIndex) {
      result.push({
        text: text.substring(currentIndex, match.index),
      })
    }

    // Add formatted text
    if (match[1].startsWith('***')) {
      // Bold + Italic
      result.push({
        text: match[2],
        bold: true,
        italic: true,
      })
    } else if (match[1].startsWith('**')) {
      // Bold only
      result.push({
        text: match[3],
        bold: true,
      })
    } else {
      // Italic only
      result.push({
        text: match[4],
        italic: true,
      })
    }

    currentIndex = match.index + match[0].length
  }

  // Add remaining plain text
  if (currentIndex < text.length) {
    result.push({
      text: text.substring(currentIndex),
    })
  }

  // If no formatting found, return the whole text
  if (result.length === 0) {
    result.push({ text })
  }

  return result
}

/**
 * Convert FormattedText array to PptxGenJS text format
 */
export function toPptxTextArray(formatted: FormattedText[]): Array<{
  text: string
  options?: { bold?: boolean; italic?: boolean }
}> {
  return formatted.map((part) => ({
    text: part.text,
    options:
      part.bold || part.italic
        ? {
            bold: part.bold,
            italic: part.italic,
          }
        : undefined,
  }))
}
