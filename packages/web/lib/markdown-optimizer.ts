/**
 * Optimize markdown for PowerPoint conversion
 */
export function optimizeMarkdown(markdown: string): string {
  let optimized = markdown

  // Add H1 title if missing
  if (!optimized.match(/^#\s/m)) {
    const firstLine = optimized.split('\n')[0]
    if (firstLine && firstLine.length > 0 && !firstLine.startsWith('#')) {
      optimized = `# ${firstLine}\n\n${optimized.substring(firstLine.length).trim()}`
    }
  }

  // Convert paragraphs that look like section titles to H2
  optimized = optimized.replace(/\n\n([^\n#*-•\d][^\n]{10,60})\n\n/g, (match, content) => {
    // If it's a short line that looks like a title (no punctuation at end)
    if (!content.match(/[.。!！?？]$/) && content.length < 60) {
      return `\n\n## ${content.trim()}\n\n`
    }
    return match
  })

  // Ensure proper spacing around headings
  optimized = optimized.replace(/\n(#{1,6}\s[^\n]+)\n(?!\n)/g, '\n$1\n\n')

  // Remove excessive blank lines (more than 2)
  optimized = optimized.replace(/\n{3,}/g, '\n\n')

  // Ensure lists have proper spacing
  optimized = optimized.replace(/\n([-*+•]\s)/g, '\n\n$1')

  // Fix numbered lists
  optimized = optimized.replace(/\n(\d+\.\s)/g, '\n\n$1')

  return optimized.trim()
}

/**
 * Analyze markdown and provide suggestions
 */
export interface MarkdownSuggestion {
  type: 'info' | 'warning' | 'error'
  message: string
  line?: number
}

export function analyzeMarkdown(markdown: string): MarkdownSuggestion[] {
  const suggestions: MarkdownSuggestion[] = []
  const lines = markdown.split('\n')

  // Check for H1
  const hasH1 = lines.some(line => line.match(/^#\s/))
  if (!hasH1) {
    suggestions.push({
      type: 'warning',
      message: 'H1見出しが見つかりません。最初のスライドにタイトルを追加することをお勧めします。',
    })
  }

  // Check for very long lines
  lines.forEach((line, index) => {
    if (line.length > 200) {
      suggestions.push({
        type: 'warning',
        message: `${index + 1}行目: 非常に長い行が検出されました。スライドに収まらない可能性があります。`,
        line: index + 1,
      })
    }
  })

  // Check for sections without headings
  const sections = markdown.split(/\n#{1,2}\s/)
  sections.forEach((section, index) => {
    if (index > 0 && section.split('\n').filter(l => l.trim()).length > 20) {
      suggestions.push({
        type: 'info',
        message: `セクション${index}が長すぎます。見出しを追加して分割することをお勧めします。`,
      })
    }
  })

  return suggestions
}
