import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { Contact, Header } from '../components/Chrome'
import { Spotlight } from '../components/Spotlight'
import { site } from '../content/site'
import styles from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#080808' },
      { title: `${site.name}, ${site.title}` },
      { name: 'description', content: site.about },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: site.name },
      { property: 'og:title', content: `${site.name}, ${site.title}` },
      { property: 'og:description', content: site.about },
      { property: 'og:image', content: `${site.url}/og.png` },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'stylesheet', href: styles },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  shellComponent: Shell,
  notFoundComponent: NotFound,
})

const applyStoredTheme = `try{document.documentElement.dataset.theme=localStorage.getItem('theme')==='light'?'light':'dark'}catch{}`

function Shell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: applyStoredTheme }} />
        <HeadContent />
      </head>
      <body className="font-sans">
        <MotionConfig reducedMotion="user">
          <Spotlight />
          <div className="mx-auto min-h-svh max-w-[736px] bg-bg px-6 transition-colors duration-300 sm:px-12">
            <Header />
            <main>{children}</main>
            <Contact />
          </div>
        </MotionConfig>
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <div className="py-32">
      <p className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">This page does not exist.</h1>
      <Link to="/" className="link mt-6 inline-block font-mono text-xs">
        ← Back home
      </Link>
    </div>
  )
}
