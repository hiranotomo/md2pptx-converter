'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PptxIframePreviewProps {
  fileUrl: string
  filename: string
}

export function PptxIframePreview({ fileUrl, filename }: PptxIframePreviewProps) {
  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              プレビュー
            </CardTitle>
            <CardDescription>{filename}</CardDescription>
          </div>
          <Button
            onClick={handleOpenInNewTab}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            新しいタブで開く
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Browser-based preview attempt */}
          <iframe
            src={fileUrl}
            className="w-full h-[600px] border rounded-lg"
            title={filename}
          />

          {/* Fallback message */}
          <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50 text-sm">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">ブラウザでプレビューできない場合</p>
              <p className="text-muted-foreground">
                「新しいタブで開く」ボタンをクリックするか、ダウンロードしてPowerPointで開いてください。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
