'use client'

import { useState, useEffect } from 'react'
import { FileText, List, Code, Table, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface SlidePreview {
  slideNumber: number
  title: string
  contentTypes: Array<'paragraph' | 'list' | 'code' | 'table'>
  itemCount: number
  estimatedHeight: number
  hasOverflow: boolean
}

interface MdOutlinePreviewProps {
  markdown: string
}

export function MdOutlinePreview({ markdown }: MdOutlinePreviewProps) {
  const [slides, setSlides] = useState<SlidePreview[]>([])
  const [selectedSlide, setSelectedSlide] = useState<number>(0)

  useEffect(() => {
    if (!markdown) return

    // Parse markdown and generate slide preview
    const parsedSlides = parseMarkdownToSlides(markdown)
    setSlides(parsedSlides)
    setSelectedSlide(0)
  }, [markdown])

  if (slides.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          スライドプレビュー
        </CardTitle>
        <CardDescription>
          全{slides.length}枚のスライドに変換されます
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Outline List */}
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <div
                key={index}
                onClick={() => setSelectedSlide(index)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedSlide === index
                    ? 'bg-primary/10 border-primary border-2'
                    : 'bg-muted hover:bg-muted/70 border border-transparent'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                    {slide.slideNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {slide.title || '(タイトルなし)'}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      {slide.contentTypes.includes('list') && (
                        <List className="w-3 h-3 text-muted-foreground" />
                      )}
                      {slide.contentTypes.includes('code') && (
                        <Code className="w-3 h-3 text-muted-foreground" />
                      )}
                      {slide.contentTypes.includes('table') && (
                        <Table className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {slide.itemCount}項目
                      </span>
                      {slide.hasOverflow && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          長い
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Right: Selected Slide Detail */}
        <div className="rounded-md border p-4">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                スライド {slides[selectedSlide]?.slideNumber}
              </div>
              <h3 className="text-lg font-bold">
                {slides[selectedSlide]?.title || '(タイトルなし)'}
              </h3>
            </div>

            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">コンテンツ数:</span>{' '}
                {slides[selectedSlide]?.itemCount}項目
              </div>

              <div className="text-sm">
                <span className="font-medium">推定高さ:</span>{' '}
                {slides[selectedSlide]?.estimatedHeight.toFixed(1)}インチ
                {slides[selectedSlide]?.hasOverflow && (
                  <span className="text-destructive ml-2">
                    (スライドに収まりきらない可能性)
                  </span>
                )}
              </div>

              <div className="text-sm">
                <span className="font-medium">含まれる要素:</span>
                <div className="flex gap-2 mt-1">
                  {slides[selectedSlide]?.contentTypes.includes('paragraph') && (
                    <Badge variant="secondary">段落</Badge>
                  )}
                  {slides[selectedSlide]?.contentTypes.includes('list') && (
                    <Badge variant="secondary">リスト</Badge>
                  )}
                  {slides[selectedSlide]?.contentTypes.includes('code') && (
                    <Badge variant="secondary">コード</Badge>
                  )}
                  {slides[selectedSlide]?.contentTypes.includes('table') && (
                    <Badge variant="secondary">テーブル</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Parse markdown and simulate slide generation
 */
function parseMarkdownToSlides(markdown: string): SlidePreview[] {
  const lines = markdown.split('\n')
  const slides: SlidePreview[] = []
  let currentSlide: Partial<SlidePreview> = {
    slideNumber: 1,
    title: '',
    contentTypes: [],
    itemCount: 0,
    estimatedHeight: 0.5,
  }

  const maxHeight = 4.8

  for (const line of lines) {
    const trimmed = line.trim()

    // H1 or H2 starts a new slide
    if (trimmed.match(/^#{1,2}\s/)) {
      // Save current slide if it has content
      if (currentSlide.title || (currentSlide.itemCount ?? 0) > 0) {
        slides.push({
          slideNumber: currentSlide.slideNumber!,
          title: currentSlide.title!,
          contentTypes: currentSlide.contentTypes as Array<'paragraph' | 'list' | 'code' | 'table'>,
          itemCount: currentSlide.itemCount!,
          estimatedHeight: currentSlide.estimatedHeight!,
          hasOverflow: currentSlide.estimatedHeight! > maxHeight,
        })
      }

      // Start new slide
      const title = trimmed.replace(/^#{1,2}\s+/, '')
      currentSlide = {
        slideNumber: slides.length + 1,
        title,
        contentTypes: [],
        itemCount: 0,
        estimatedHeight: 1.0, // Title height
      }
    }
    // List item
    else if (trimmed.match(/^[-*+]\s/) || trimmed.match(/^\d+\.\s/)) {
      if (!currentSlide.contentTypes?.includes('list')) {
        currentSlide.contentTypes?.push('list')
      }
      currentSlide.itemCount = (currentSlide.itemCount ?? 0) + 1
      currentSlide.estimatedHeight = (currentSlide.estimatedHeight ?? 0) + 0.3
    }
    // Code block
    else if (trimmed.startsWith('```')) {
      if (!currentSlide.contentTypes?.includes('code')) {
        currentSlide.contentTypes?.push('code')
      }
      currentSlide.itemCount = (currentSlide.itemCount ?? 0) + 1
      currentSlide.estimatedHeight = (currentSlide.estimatedHeight ?? 0) + 0.5
    }
    // Table
    else if (trimmed.includes('|')) {
      if (!currentSlide.contentTypes?.includes('table')) {
        currentSlide.contentTypes?.push('table')
      }
      currentSlide.itemCount = (currentSlide.itemCount ?? 0) + 1
      currentSlide.estimatedHeight = (currentSlide.estimatedHeight ?? 0) + 0.3
    }
    // Paragraph
    else if (trimmed.length > 0) {
      if (!currentSlide.contentTypes?.includes('paragraph')) {
        currentSlide.contentTypes?.push('paragraph')
      }
      currentSlide.itemCount = (currentSlide.itemCount ?? 0) + 1
      currentSlide.estimatedHeight = (currentSlide.estimatedHeight ?? 0) + 0.4
    }
  }

  // Add last slide
  if (currentSlide.title || (currentSlide.itemCount ?? 0) > 0) {
    slides.push({
      slideNumber: currentSlide.slideNumber!,
      title: currentSlide.title!,
      contentTypes: currentSlide.contentTypes as Array<'paragraph' | 'list' | 'code' | 'table'>,
      itemCount: currentSlide.itemCount!,
      estimatedHeight: currentSlide.estimatedHeight!,
      hasOverflow: currentSlide.estimatedHeight! > maxHeight,
    })
  }

  return slides
}
