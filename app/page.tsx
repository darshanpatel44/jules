import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import AuthButtons from '@/components/projects/auth-buttons';
import Spline from '@splinetool/react-spline/next';
import GridTexture from '@/components/page-utils/grid-texture';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-foreground relative">
      <GridTexture />
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between border-border">
        <Link className="text-lg font-bold" href="#">
          Yomi
        </Link>
        <nav className="flex items-center">
          <AuthButtons />
        </nav>
      </header>
      <main className="flex-1 relative">
        <section className="w-full py-12 px-4 md:px-6 relative z-10">
          <div className="container mx-auto flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 animate-fade-in">
              AI-Powered LaTeX Editing
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mb-8 animate-fade-in animation-delay-200">
              Yomi is inspired by Cursor and Overleaf. It is a LaTeX editor that gives you the power of autocomplete.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animation-delay-300">
              <Button asChild>
                <Link href="/login">
                  Try Yomi Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <div className="absolute inset-x-0 bottom-0 w-full h-[90%]">
          <Spline
            scene="https://prod.spline.design/gQanJmdg7BDjlCcX/scene.splinecode" 
            className="w-full h-full object-cover"
          />
        </div>
      </main>
    </div>
  )
}
