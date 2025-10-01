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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20 px-4 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Md2Pptx</h1>
              <p className="text-sm text-white/80">AI-Powered Presentation Generator</p>
            </div>
          </div>

          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/80">
              Markdown から
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
              魔法のように
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/80">
              プレゼンを生成
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl leading-relaxed">
            テキストを貼り付けるだけで、プロフェッショナルな<br />
            PowerPointプレゼンテーションが完成 ✨
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={loadSampleMarkdown}
              className="bg-white text-purple-600 hover:bg-white/90 hover:scale-105 transition-transform gap-2 px-8 py-6 text-lg rounded-xl shadow-2xl"
            >
              <PlayCircle className="w-6 h-6" />
              🎬 デモを試す
            </Button>
            {markdownContent && (
              <Button
                size="lg"
                variant="outline"
                onClick={downloadSampleMarkdown}
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm gap-2 px-8 py-6 text-lg rounded-xl"
              >
                <FileDown className="w-6 h-6" />
                サンプルMDをダウンロード
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8 relative z-10">
        {/* Template Selection */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-lg hover:shadow-3xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-black">
                    STEP 1
                  </span>
                  {' '}デザインテンプレートを選択
                </CardTitle>
                <CardDescription className="text-base">
                  あなたのブランドに合ったスタイルを選びましょう 🎨
                </CardDescription>
              </div>
            </div>
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
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-lg hover:shadow-3xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">
                    STEP 2
                  </span>
                  {' '}Markdownファイルをアップロード
                </CardTitle>
                <CardDescription className="text-base">
                  ドラッグ&ドロップで簡単アップロード 📄
                </CardDescription>
              </div>
            </div>
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
          <div className="flex justify-center py-8">
            <Button
              size="lg"
              onClick={handleConvert}
              disabled={converting}
              className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-8 text-xl font-bold gap-3 shadow-2xl rounded-2xl hover:scale-105 transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                {converting ? (
                  <>
                    <Sparkles className="w-7 h-7 animate-spin" />
                    ✨ 変換中...
                  </>
                ) : generatedFiles.length > 0 ? (
                  <>
                    <Wand2 className="w-7 h-7" />
                    🎨 別のテンプレートで再生成
                  </>
                ) : (
                  <>
                    <Sparkles className="w-7 h-7" />
                    🚀 PowerPointに変換
                  </>
                )}
              </span>
            </Button>
          </div>
        )}

        {/* Generated Files */}
        {generatedFiles.length > 0 && (
          <div className="relative">
            {/* Celebration animation background */}
            <div className="absolute -inset-4 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>

            <Card className="relative border-0 shadow-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                      🎉 変換完了！
                    </CardTitle>
                    <CardDescription className="text-lg text-green-700 font-medium">
                      {generatedFiles.length}個のファイルが生成されました
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {generatedFiles.map((generatedFile, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                      generatedFile.downloaded
                        ? 'bg-white/60 border-gray-200 backdrop-blur-sm'
                        : 'bg-white border-green-300 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl transition-all ${
                        generatedFile.downloaded
                          ? 'bg-gray-100'
                          : 'bg-gradient-to-br from-green-100 to-emerald-100'
                      }`}>
                        <FileText className={`w-7 h-7 ${
                          generatedFile.downloaded ? 'text-gray-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{generatedFile.filename}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="font-medium">
                            {generatedFile.templateName}
                          </Badge>
                          {generatedFile.downloaded && (
                            <Badge variant="outline" className="text-xs">
                              ✓ ダウンロード済み
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(generatedFile)}
                      variant={generatedFile.downloaded ? 'outline' : 'default'}
                      size="lg"
                      className={`gap-2 px-6 py-6 text-lg rounded-xl font-semibold ${
                        !generatedFile.downloaded && 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg'
                      }`}
                    >
                      <Download className="w-5 h-5" />
                      {generatedFile.downloaded ? '再ダウンロード' : 'ダウンロード'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
