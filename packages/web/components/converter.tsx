'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Download, Sparkles, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TEMPLATES = [
  { id: 'default', name: 'Default Clean', category: 'Minimal', colors: ['#FFFFFF', '#363636'] },
  { id: 'corporate-blue', name: 'Corporate Blue', category: 'Corporate', colors: ['#1E3A8A', '#3B82F6'] },
  { id: 'modern-gradient', name: 'Modern Gradient', category: 'Modern', colors: ['#8B5CF6', '#EC4899'] },
  { id: 'minimal-elegant', name: 'Minimal Elegant', category: 'Minimal', colors: ['#000000', '#9CA3AF'] },
  { id: 'vibrant-creative', name: 'Vibrant Creative', category: 'Creative', colors: ['#EF4444', '#F59E0B'] },
]

interface GeneratedFile {
  url: string
  template: string
  templateName: string
  filename: string
  downloaded: boolean
}

export function Converter() {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('default')
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setGeneratedFiles([]) // Clear previous generations
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
      formData.append('template', selectedTemplate)

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Conversion failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const template = TEMPLATES.find(t => t.id === selectedTemplate)
      const filename = file?.name.replace(/\.md$/, `.${selectedTemplate}.pptx`) || `presentation.${selectedTemplate}.pptx`

      setGeneratedFiles(prev => [
        ...prev,
        {
          url,
          template: selectedTemplate,
          templateName: template?.name || selectedTemplate,
          filename,
          downloaded: false,
        }
      ])
    } catch (error) {
      console.error('Conversion error:', error)
      alert('変換に失敗しました')
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = (generatedFile: GeneratedFile) => {
    const a = document.createElement('a')
    a.href = generatedFile.url
    a.download = generatedFile.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Mark as downloaded
    setGeneratedFiles(prev => prev.map(f =>
      f.url === generatedFile.url ? { ...f, downloaded: true } : f
    ))
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            テンプレートを選択
          </CardTitle>
          <CardDescription>
            プレゼンテーションのデザインテンプレートを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="テンプレートを選択" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {template.colors.slice(0, 2).map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{template.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({template.category})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

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

      {/* Convert/Regenerate Button */}
      {file && (
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
            ) : generatedFiles.length > 0 ? (
              <>
                <Sparkles className="w-5 h-5" />
                再生成（{TEMPLATES.find(t => t.id === selectedTemplate)?.name}）
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

      {/* Generated Files List */}
      {generatedFiles.length > 0 && (
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-lg">生成されたファイル</CardTitle>
            <CardDescription>
              異なるテンプレートで再生成することもできます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {generatedFiles.map((generatedFile, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  generatedFile.downloaded
                    ? 'bg-muted/50 border-muted opacity-60'
                    : 'bg-background border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    generatedFile.downloaded ? 'bg-muted' : 'bg-green-500/10'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      generatedFile.downloaded ? 'text-muted-foreground' : 'text-green-600 dark:text-green-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{generatedFile.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      テンプレート: {generatedFile.templateName}
                      {generatedFile.downloaded && ' (ダウンロード済み)'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(generatedFile)}
                  variant={generatedFile.downloaded ? 'outline' : 'default'}
                  size="sm"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {generatedFile.downloaded ? '再ダウンロード' : 'ダウンロード'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
