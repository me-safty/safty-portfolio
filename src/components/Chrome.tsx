import { Link } from '@tanstack/react-router'
import { motion, useSpring } from 'motion/react'
import { type PointerEvent, useEffect, useState } from 'react'
import { site } from '../content/site'
import { DotMatrix, contactScenes } from './DotMatrix'
import { Reveal, SectionLabel } from './Reveal'

const navLink = 'transition-colors hover:text-fg'

function ThemeToggle() {
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
      className="grid size-8 cursor-pointer place-items-center rounded-full border border-line transition-colors hover:border-fg hover:text-fg"
    >
      <svg viewBox="0 0 24 24" className="size-4 light:hidden" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
      </svg>
      <svg viewBox="0 0 24 24" className="hidden size-4 light:block" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export function Header() {
  return (
    <header className="flex items-center justify-between gap-4 pt-10 sm:pt-16">
      <Link to="/" className="group flex items-center gap-3">
        <span
          data-lit
          suppressHydrationWarning
          className="relative size-11 shrink-0 overflow-hidden rounded-full border border-fg/45"
        >
          <img src={site.avatar} alt="" className="size-full object-cover grayscale" />
          <img
            aria-hidden
            alt=""
            src={site.avatar}
            className="lit-mask absolute inset-0 size-full object-cover group-hover:[mask-image:none]"
          />
        </span>
        <span>
          <span className="block text-[15px] font-semibold">{site.name}</span>
          <span className="block text-[13px] text-dim">{site.title}</span>
        </span>
      </Link>
      <nav className="flex items-center gap-4 font-mono text-xs text-dim sm:gap-5">
        <Link to="/" hash="work" className={`${navLink} max-sm:hidden`}>
          Work
        </Link>
        <Link to="/" hash="clients" className={`${navLink} max-sm:hidden`}>
          Clients
        </Link>
        <a href="#contact" className={navLink}>
          Email
        </a>
        <ThemeToggle />
      </nav>
    </header>
  )
}

const cairoTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo' })

function LocalTime() {
  const [now, setNow] = useState<Date>()
  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])
  return <span>{now ? cairoTime.format(now) : '--:--'} local time</span>
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
    <footer id="contact" className="pt-16 pb-10 sm:pt-24">
      <Reveal className="-mx-6 mb-10 sm:-mx-12">
        <DotMatrix scenes={contactScenes} />
      </Reveal>
      <SectionLabel>Contact</SectionLabel>
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
        <span>
          {site.location} · <LocalTime />
        </span>
      </div>
    </footer>
  )
}
