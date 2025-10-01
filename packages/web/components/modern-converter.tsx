'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload, FileText, Download, Sparkles, Palette,
  Wand2, FileDown, PlayCircle, AlertCircle, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MdOutlinePreview } from '@/components/md-outline-preview'
import { optimizeMarkdown, analyzeMarkdown, type MarkdownSuggestion } from '@/lib/markdown-optimizer'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

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

export function ModernConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [optimizedMarkdown, setOptimizedMarkdown] = useState<string>('')
  const [suggestions, setSuggestions] = useState<MarkdownSuggestion[]>([])
  const [converting, setConverting] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('default')
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [showOptimized, setShowOptimized] = useState(false)

  const loadSampleMarkdown = useCallback(async () => {
    try {
      const response = await fetch('/sample.md')
      const text = await response.text()

      // Create a virtual file
      const blob = new Blob([text], { type: 'text/markdown' })
      const virtualFile = new File([blob], 'sample.md', { type: 'text/markdown' })

      setFile(virtualFile)
      setMarkdownContent(text)

      // Analyze and optimize
      const analyzed = analyzeMarkdown(text)
      setSuggestions(analyzed)

      const optimized = optimizeMarkdown(text)
      setOptimizedMarkdown(optimized)
    } catch (error) {
      console.error('Failed to load sample:', error)
      alert('サンプルの読み込みに失敗しました')
    }
  }, [])

  const downloadSampleMarkdown = useCallback(() => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [markdownContent])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0]
      setFile(uploadedFile)
      setGeneratedFiles([])

      // Read file content
      const text = await uploadedFile.text()
      setMarkdownContent(text)

      // Analyze and optimize
      const analyzed = analyzeMarkdown(text)
      setSuggestions(analyzed)

      const optimized = optimizeMarkdown(text)
      setOptimizedMarkdown(optimized)
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

      // Use optimized markdown if available
      const contentToConvert = showOptimized && optimizedMarkdown ? optimizedMarkdown : markdownContent
      const blob = new Blob([contentToConvert], { type: 'text/markdown' })
      const fileToConvert = new File([blob], file.name, { type: 'text/markdown' })

      formData.append('file', fileToConvert)
      formData.append('template', selectedTemplate)

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Conversion failed')
      }

      const resultBlob = await response.blob()
      const url = URL.createObjectURL(resultBlob)

      const template = TEMPLATES.find(t => t.id === selectedTemplate)
      const filename = file?.name.replace(/\.md$/, `.${selectedTemplate}.pptx`) || `presentation.${selectedTemplate}.pptx`

      const newFile = {
        url,
        template: selectedTemplate,
        templateName: template?.name || selectedTemplate,
        filename,
        downloaded: false,
      }

      setGeneratedFiles(prev => [...prev, newFile])
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

    setGeneratedFiles(prev => prev.map(f =>
      f.url === generatedFile.url ? { ...f, downloaded: true } : f
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Markdown → PowerPoint Converter
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-6">
            シンプルなMarkdownから、美しいプレゼンテーションを数秒で生成
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={loadSampleMarkdown}
              className="bg-white text-blue-600 hover:bg-blue-50 gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              デモを試す
            </Button>
            {markdownContent && (
              <Button
                size="lg"
                variant="outline"
                onClick={downloadSampleMarkdown}
                className="border-white text-white hover:bg-white/10 gap-2"
              >
                <FileDown className="w-5 h-5" />
                サンプルMDをダウンロード
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Template Selection */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              ステップ1: デザインテンプレートを選択
            </CardTitle>
            <CardDescription>
              プレゼンテーションのスタイルを選んでください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="テンプレートを選択" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex gap-1">
                        {template.colors.slice(0, 2).map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{template.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              ステップ2: Markdownファイルをアップロード
            </CardTitle>
            <CardDescription>
              .md または .markdown ファイルを選択してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-3 border-dashed rounded-xl p-12
                transition-all cursor-pointer
                ${isDragActive
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4 text-center">
                <div className={`
                  p-4 rounded-full
                  ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}
                `}>
                  <Upload className={`
                    w-10 h-10
                    ${isDragActive ? 'text-blue-600' : 'text-gray-600'}
                  `} />
                </div>
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                    <p className="font-semibold text-lg">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium text-lg">
                      {isDragActive
                        ? 'ここにドロップしてください'
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

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <Wand2 className="w-5 h-5" />
                最適化の提案
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    suggestion.type === 'error' ? 'text-red-600' :
                    suggestion.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <p className="text-sm">{suggestion.message}</p>
                </div>
              ))}
              <Button
                onClick={() => setShowOptimized(!showOptimized)}
                variant={showOptimized ? 'default' : 'outline'}
                size="sm"
                className="mt-2"
              >
                {showOptimized ? '元のMarkdownを使用' : '最適化されたMarkdownを使用'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {file && markdownContent && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>ステップ3: プレビューを確認</span>
            </div>
            <MdOutlinePreview markdown={showOptimized ? optimizedMarkdown : markdownContent} />
          </>
        )}

        {/* Convert Button */}
        {file && (
          <div className="flex justify-center py-4">
            <Button
              size="lg"
              onClick={handleConvert}
              disabled={converting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg gap-3 shadow-lg"
            >
              {converting ? (
                <>
                  <Sparkles className="w-6 h-6 animate-spin" />
                  変換中...
                </>
              ) : generatedFiles.length > 0 ? (
                <>
                  <Sparkles className="w-6 h-6" />
                  別のテンプレートで再生成
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  PowerPointに変換
                </>
              )}
            </Button>
          </div>
        )}

        {/* Generated Files */}
        {generatedFiles.length > 0 && (
          <Card className="border-2 border-green-200 bg-green-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-900">✨ 変換完了！</CardTitle>
              <CardDescription className="text-green-700">
                {generatedFiles.length}個のファイルが生成されました
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {generatedFiles.map((generatedFile, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    generatedFile.downloaded
                      ? 'bg-gray-100 border-gray-300'
                      : 'bg-white border-green-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${
                      generatedFile.downloaded ? 'bg-gray-200' : 'bg-green-100'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        generatedFile.downloaded ? 'text-gray-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold">{generatedFile.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {generatedFile.templateName}
                        {generatedFile.downloaded && ' (ダウンロード済み)'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(generatedFile)}
                    variant={generatedFile.downloaded ? 'outline' : 'default'}
                    size="lg"
                    className="gap-2"
                  >
                    <Download className="w-5 h-5" />
                    {generatedFile.downloaded ? '再ダウンロード' : 'ダウンロード'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
