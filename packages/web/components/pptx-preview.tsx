'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye } from 'lucide-react'

interface PptxPreviewProps {
  fileUrl: string
  filename: string
}

export function PptxPreview({ fileUrl, filename }: PptxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || !fileUrl) return

    const loadPreview = async () => {
      try {
        // Dynamically import pptx-preview
        const { init } = await import('pptx-preview')

        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }

        // Initialize preview
        if (containerRef.current) {
          viewerRef.current = init(containerRef.current, {
            width: 960,
            height: 540,
          })

          // Fetch the PPTX file and convert to ArrayBuffer
          const response = await fetch(fileUrl)
          const arrayBuffer = await response.arrayBuffer()

          // Display preview
          await viewerRef.current.preview(arrayBuffer)
        }
      } catch (error) {
        console.error('Preview error:', error)
      }
    }

    loadPreview()

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [fileUrl])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          プレビュー
        </CardTitle>
        <CardDescription>{filename}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="w-full min-h-[540px] bg-muted/30 rounded-lg flex items-center justify-center"
        >
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </CardContent>
    </Card>
  )
}
