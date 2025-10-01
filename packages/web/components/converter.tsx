'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Download, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Converter() {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setDownloadUrl(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md', '.markdown'],
    },
    maxFiles: 1,
  })

  const handleConvert = async () => {
    if (!file) return

    setConverting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Conversion failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch (error) {
      console.error('Conversion error:', error)
      alert('変換に失敗しました')
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = file?.name.replace(/\.md$/, '.pptx') || 'presentation.pptx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Markdownファイルをアップロード
          </CardTitle>
          <CardDescription>
            .md または .markdown ファイルをドラッグ&ドロップ、またはクリックして選択
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12
              transition-colors cursor-pointer
              ${isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4 text-center">
              <div className={`
                p-4 rounded-full
                ${isDragActive ? 'bg-primary/10' : 'bg-muted'}
              `}>
                <Upload className={`
                  w-8 h-8
                  ${isDragActive ? 'text-primary' : 'text-muted-foreground'}
                `} />
              </div>
              {file ? (
                <div className="space-y-1">
                  <p className="font-medium text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium">
                    {isDragActive
                      ? 'ここにドロップ'
                      : 'ファイルをドラッグ&ドロップ'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    または クリックして選択
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Convert Button */}
      {file && !downloadUrl && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleConvert}
            disabled={converting}
            className="gap-2"
          >
            {converting ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                変換中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                PowerPointに変換
              </>
            )}
          </Button>
        </div>
      )}

      {/* Download Area */}
      {downloadUrl && (
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">変換完了！</p>
                  <p className="text-sm text-muted-foreground">
                    PowerPointファイルをダウンロードできます
                  </p>
                </div>
              </div>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                ダウンロード
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
