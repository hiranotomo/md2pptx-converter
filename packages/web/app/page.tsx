import { Converter } from '@/components/converter'
import { FileText, Zap, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Md2Pptx</h1>
                <p className="text-xs text-muted-foreground">Markdown to PowerPoint</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Markdownから
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {' '}瞬時に{' '}
            </span>
            プレゼンテーション作成
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            デザインとコンテンツを完全分離。Markdownで書いたドキュメントを、
            プロフェッショナルなPowerPointプレゼンテーションに変換します。
          </p>
        </div>
      </section>

      {/* Converter Section */}
      <section className="container mx-auto px-4 pb-16">
        <Converter />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">高速変換</h3>
            <p className="text-sm text-muted-foreground">
              数秒でMarkdownをPowerPointに変換。
              待ち時間なしで作業を継続できます。
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">デザイン分離</h3>
            <p className="text-sm text-muted-foreground">
              テンプレートシステムにより、
              コンテンツとデザインを完全分離。
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">プライバシー重視</h3>
            <p className="text-sm text-muted-foreground">
              ファイルはサーバーに保存されず、
              変換後すぐに削除されます。
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by PptxGenJS • Built with Next.js</p>
        </div>
      </footer>
    </div>
  )
}
