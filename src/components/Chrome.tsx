import { Link } from '@tanstack/react-router'
import { motion, useSpring } from 'motion/react'
import { type PointerEvent, useEffect, useState } from 'react'
import { site } from '../content/site'
import { Reveal, SectionLabel } from './Reveal'
import { Wordmark } from './Wordmark'

const label = 'font-mono text-[11px] tracking-[0.14em] text-dim uppercase'

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement
    const next = root.dataset.theme === 'light' ? 'dark' : 'light'
    root.dataset.theme = next
    localStorage.setItem('theme', next)
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light theme"
      className="cursor-pointer font-mono text-xs text-dim transition-colors hover:text-fg"
    >
      [ <span className="light:hidden">light</span>
      <span className="hidden light:inline">dark</span> ]
    </button>
  )
}

export function Header() {
  return (
    <header className="flex items-start justify-between gap-6 pt-10 sm:pt-16">
      <Link to="/" className="group shrink-0">
        <span className={`block ${label}`}>{site.title}</span>
        <span className="mt-2 flex items-center gap-2.5 font-mono text-lg">
          {site.name}
          <span
            data-lit
            suppressHydrationWarning
            className="relative size-6 shrink-0 overflow-hidden rounded-full border border-fg/45"
          >
            <img src={site.avatar} alt="" className="size-full object-cover grayscale" />
            <img
              aria-hidden
              alt=""
              src={site.avatar}
              className="lit-mask absolute inset-0 size-full object-cover group-hover:[mask-image:none]"
            />
          </span>
        </span>
      </Link>
      <p className={`text-right ${label}`}>
        <span className="block">{site.location}</span>
        <span className="mt-2 block leading-7">
          <LocalTime />
        </span>
      </p>
    </header>
  )
}

const cairoTime = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Africa/Cairo',
  timeZoneName: 'short',
})

function LocalTime() {
  const [now, setNow] = useState<Date>()
  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return <>{now ? cairoTime.format(now) : '--:--:--'}</>
}

export function Contact() {
  const x = useSpring(0, { stiffness: 150, damping: 15 })
  const y = useSpring(0, { stiffness: 150, damping: 15 })
  const pull = (event: PointerEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * 0.12)
    y.set((event.clientY - rect.top - rect.height / 2) * 0.3)
  }

  return (
    <footer id="contact" className="pt-16 sm:pt-24">
      <SectionLabel glyph="contact">Contact</SectionLabel>
      <Reveal>
        <p className="mt-4 text-xl leading-snug text-soft">
          I do my best work next to a founder. If you have a product to scope, build or ship, write to me.
        </p>
        <motion.a
          href={`mailto:${site.email}`}
          style={{ x, y }}
          onPointerMove={pull}
          onPointerLeave={() => {
            x.set(0)
            y.set(0)
          }}
          className="group mt-6 inline-block text-[clamp(1.9rem,7vw,2.75rem)] font-semibold tracking-[-0.03em]"
        >
          Email me{' '}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
          <span className="mt-1 block h-px origin-left scale-x-0 bg-fg transition-transform duration-500 group-hover:scale-x-100" />
        </motion.a>
      </Reveal>
      <div className="mt-16 flex flex-wrap justify-between gap-x-8 gap-y-2 font-mono text-[11px] text-dim">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <ThemeToggle />
      </div>
      <div className="-mx-6 mt-10 sm:-mx-12">
        <Wordmark />
      </div>
    </footer>
  )
}
