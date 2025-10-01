'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload, FileText, Download, Palette,
  FileDown, PlayCircle, AlertCircle, CheckCircle2, Sparkles, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MdOutlinePreview } from '@/components/md-outline-preview'
import { PptxIframePreview } from '@/components/pptx-iframe-preview'
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
  const [previewFile, setPreviewFile] = useState<GeneratedFile | null>(null)

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
    accept: { 'text/markdown': ['.md', '.markdown'] },
    multiple: false,
  })

  const handleConvert = async () => {
    if (!file) return

    setConverting(true)
    try {
      const contentToConvert = showOptimized ? optimizedMarkdown : markdownContent
      const formData = new FormData()
      const blob = new Blob([contentToConvert], { type: 'text/markdown' })
      formData.append('file', blob, file.name)
      formData.append('template', selectedTemplate)

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Conversion failed')
      }

      const arrayBuffer = await response.arrayBuffer()
      const blob2 = new Blob([arrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })
      const url = URL.createObjectURL(blob2)

      const template = TEMPLATES.find((t) => t.id === selectedTemplate)
      const filename = `${file.name.replace(/\.md$/, '')}_${selectedTemplate}.pptx`

      const newFile = {
        url,
        template: selectedTemplate,
        templateName: template?.name || selectedTemplate,
        filename,
        downloaded: false,
      }

      setGeneratedFiles((prev) => [...prev, newFile])
      setPreviewFile(newFile) // Auto-preview the newly generated file
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NGgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEG0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 blur-xl rounded-full"></div>
              <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30 shadow-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Md2Pptx</h1>
              <p className="text-blue-100 text-sm md:text-base">次世代プレゼンテーション生成ツール</p>
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Markdownから<br />
            <span className="text-yellow-300">瞬時に</span>美しいプレゼンへ
          </h2>

          <p className="text-xl text-blue-50 mb-10 max-w-2xl leading-relaxed">
            テキストベースのコンテンツを、プロフェッショナルなPowerPointプレゼンテーションに自動変換。
            デザインテンプレートを選ぶだけで、洗練されたスライドが完成します。
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Markdown Input Selection */}
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white pb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-extrabold flex items-center gap-3">
                  <span className="bg-yellow-300 text-indigo-900 px-3 py-1 rounded-lg text-lg">STEP 1</span>
                  Markdownを用意
                </CardTitle>
                <CardDescription className="text-indigo-100 text-base mt-2">サンプルを使うか、ファイルをアップロードしてください</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sample Markdown Option */}
              <button
                onClick={loadSampleMarkdown}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 p-8 text-left ${
                  file?.name === 'sample.md'
                    ? 'border-blue-600 bg-blue-50 shadow-xl ring-4 ring-blue-200'
                    : 'border-slate-300 hover:border-blue-400 hover:shadow-lg bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl transition-all ${
                    file?.name === 'sample.md' ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'
                  }`}>
                    <PlayCircle className={`w-8 h-8 ${
                      file?.name === 'sample.md' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">サンプルを使う</h3>
                    <p className="text-sm text-slate-600">
                      すぐに試せるサンプルMarkdownを読み込みます
                    </p>
                    {file?.name === 'sample.md' && (
                      <Badge className="mt-3 bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        読み込み済み
                      </Badge>
                    )}
                  </div>
                </div>
              </button>

              {/* File Upload Option */}
              <div
                {...getRootProps()}
                className={`group relative overflow-hidden rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 p-8 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 shadow-inner'
                    : file && file.name !== 'sample.md'
                    ? 'border-green-400 bg-green-50/50 shadow-xl ring-4 ring-green-200'
                    : 'border-slate-300 hover:border-blue-400 hover:shadow-lg bg-white'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl transition-all ${
                    file && file.name !== 'sample.md' ? 'bg-green-100' : 'bg-slate-100 group-hover:bg-blue-100'
                  }`}>
                    <Upload className={`w-8 h-8 ${
                      file && file.name !== 'sample.md' ? 'text-green-600' : 'text-slate-400 group-hover:text-blue-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    {file && file.name !== 'sample.md' ? (
                      <>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{file.name}</h3>
                        <p className="text-sm text-slate-600 mb-3">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          アップロード完了
                        </Badge>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">ファイルをアップロード</h3>
                        <p className="text-sm text-slate-600">
                          {isDragActive
                            ? 'ここにドロップしてください'
                            : 'Markdownファイルをドラッグ&ドロップ、またはクリックして選択'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Download Sample Button */}
            {markdownContent && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={downloadSampleMarkdown}
                  className="border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  現在のMarkdownをダウンロード
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Selection */}
        {markdownContent && (
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl">
                  <Palette className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-extrabold flex items-center gap-3">
                    <span className="bg-yellow-300 text-blue-900 px-3 py-1 rounded-lg text-lg">STEP 2</span>
                    デザインテンプレート選択
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-base mt-2">プレゼンテーションの印象を決める重要なステップです</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-8 bg-gradient-to-br from-slate-50 to-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`group relative overflow-hidden rounded-2xl border-3 transition-all duration-300 ${
                      selectedTemplate === template.id
                        ? 'border-blue-600 shadow-2xl scale-105 ring-4 ring-blue-200'
                        : 'border-slate-300 hover:border-blue-400 hover:shadow-xl hover:scale-102 bg-white'
                    }`}
                  >
                    <div
                      className="h-32 w-full relative"
                      style={{
                        background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1] || template.colors[0]})`
                      }}
                    >
                      <div className="absolute inset-0 bg-black/5"></div>
                      {selectedTemplate === template.id && (
                        <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg">
                          <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white">
                      <div className="text-base font-bold text-slate-900 mb-1">{template.name}</div>
                      <Badge variant="secondary" className="text-xs font-semibold">{template.category}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Markdown Preview & Analysis */}
        {markdownContent && (
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Markdownプレビュー</CardTitle>
                </div>
                {suggestions.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => setShowOptimized(!showOptimized)}
                    className="bg-white text-emerald-700 hover:bg-emerald-50 border-2 border-white shadow-lg font-semibold"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {showOptimized ? '元のMDを表示' : '最適化版を表示'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    最適化の提案
                  </h4>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 text-sm p-4 rounded-xl shadow-sm border ${
                          suggestion.type === 'error'
                            ? 'bg-red-50 text-red-900 border-red-200'
                            : suggestion.type === 'warning'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-blue-50 text-blue-900 border-blue-200'
                        }`}
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{suggestion.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outline Preview */}
              <div>
                <h4 className="font-bold text-sm text-slate-700 mb-3">スライド構成プレビュー</h4>
                <MdOutlinePreview markdown={showOptimized ? optimizedMarkdown : markdownContent} />
              </div>

              {/* Markdown Content */}
              <div>
                <h4 className="font-bold text-sm text-slate-700 mb-3">Markdown内容</h4>
                <ScrollArea className="h-80 w-full rounded-xl border-2 border-slate-200 bg-slate-50 shadow-inner">
                  <pre className="p-6 text-sm font-mono leading-relaxed">
                    {showOptimized ? optimizedMarkdown : markdownContent}
                  </pre>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Convert Button */}
        {file && (
          <Card className="border-none shadow-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRIDHY0aDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
            <CardContent className="pt-10 pb-10 relative">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-2xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-white">
                    <span className="bg-yellow-300 text-red-600 px-4 py-2 rounded-xl text-2xl mr-3">STEP 3</span>
                    変換実行
                  </h3>
                </div>
                <p className="text-white text-lg font-semibold max-w-2xl mx-auto">
                  選択したテンプレートで、あなたのMarkdownを美しいPowerPointプレゼンテーションに変換します
                </p>
                <Button
                  onClick={handleConvert}
                  disabled={converting}
                  size="lg"
                  className="bg-white text-red-600 hover:bg-yellow-50 shadow-2xl hover:shadow-3xl transition-all duration-300 px-16 py-8 text-2xl font-black rounded-2xl hover:scale-105"
                >
                  {converting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-red-600 mr-4"></div>
                      変換中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-7 h-7 mr-3" />
                      PowerPointに変換する
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Files */}
        {generatedFiles.length > 0 && (
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-green-600 to-emerald-600 text-white pb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-extrabold">生成されたファイル</CardTitle>
                  <CardDescription className="text-green-100 text-base mt-2">
                    {generatedFiles.length}個のPowerPointファイルが生成されました
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {generatedFiles.map((generatedFile, index) => (
                  <div
                    key={index}
                    className={`group flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-200 ${
                      generatedFile.downloaded
                        ? 'bg-slate-50 border-slate-200 shadow-sm'
                        : 'bg-white border-green-200 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        {generatedFile.filename}
                      </div>
                      <div className="text-sm text-slate-600">
                        テンプレート: <span className="font-semibold">{generatedFile.templateName}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(generatedFile)}
                      size="lg"
                      variant={generatedFile.downloaded ? 'outline' : 'default'}
                      className={generatedFile.downloaded ? '' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl'}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {generatedFile.downloaded ? '再ダウンロード' : 'ダウンロード'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Section */}
        {previewFile && (
          <PptxIframePreview fileUrl={previewFile.url} filename={previewFile.filename} />
        )}
      </div>
    </div>
  )
}
