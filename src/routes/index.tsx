import { Link, createFileRoute } from '@tanstack/react-router'
import {
  AnimatePresence,
  type MotionValue,
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { DeviceReel } from '../components/Device'
import { Orbit } from '../components/Orbit'
import { ThemeToggle } from '../components/Chrome'
import { Reveal, SectionLabel } from '../components/Reveal'
import { StatGraphic, WorkThumb } from '../components/Tiles'
import { type Project, projects } from '../content/projects'
import { site, skills, stats, testimonials, upwork } from '../content/site'

export const Route = createFileRoute('/')({ component: Home })

const [universeDawn, pitchhub, meezan] = projects

const row =
  'group -mx-3 rounded-lg px-3 transition duration-300 hover:bg-fg/[0.06] group-hover/list:opacity-40 hover:opacity-100!'

const workRow = `${row} grid grid-cols-[4rem_1fr_auto] items-center gap-4 py-3`
const thumb = 'h-12 w-16 rounded-md ring-1 ring-line'
const years = (start: string, end?: string) => `${start.slice(0, 4)} – ${end?.slice(0, 4) ?? 'now'}`

function RowText({ name, note, period }: { name: string; note: string; period: string }) {
  return (
    <>
      <span className="min-w-0">
        <span className="block font-semibold">{name}</span>
        <span className="block text-sm text-dim">{note}</span>
      </span>
      <span className="font-mono text-xs text-dim transition-colors group-hover:text-fg">{period}</span>
    </>
  )
}

const downloadIcon = 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'
const rowLink = 'transition-colors hover:text-fg'

function Popup({
  x,
  y,
  className,
  children,
}: {
  x: MotionValue<number>
  y: MotionValue<number>
  className: string
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {children && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-40"
          style={{ x, y }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.18 }}
        >
          <div className={className}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ProjectReel({ project }: { project: Project }) {
  return <DeviceReel key={project.slug} screens={project.screens.slice(0, 3)} interval={1500} className="[--u:1.7px]" />
}

function IconBox({ path }: { path: string }) {
  return (
    <span className="grid size-14 place-items-center rounded-2xl border border-fg/20 bg-panel text-fg shadow-xl shadow-black/30">
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="currentColor">
        <path d={path} />
      </svg>
    </span>
  )
}

function Bio() {
  const [popup, setPopup] = useState<ReactNode>()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const hover = (content: ReactNode) => ({
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const rect = event.currentTarget.getBoundingClientRect()
      x.set(rect.left + rect.width / 2)
      y.set(rect.top - 12)
      setPopup(content)
    },
    onPointerLeave: () => setPopup(undefined),
    className: 'link whitespace-nowrap',
  })
  const work = (project: Project) => (
    <Link to="/work/$slug" params={{ slug: project.slug }} {...hover(<ProjectReel project={project} />)}>
      {project.name}
    </Link>
  )

  return (
    <>
      <Reveal className="space-y-5 font-mono text-sm leading-[1.8] text-soft">
        <p>
          I'm a product engineer with 4+ years of shipping TypeScript products on web, mobile and backend. I work next
          to founders: I find the product gap, decide how it should work, build it and get it through App Store review.
        </p>
        <p>
          Right now I lead mobile and platform on {work(universeDawn)}. I also built {work(pitchhub)} and{' '}
          {work(meezan)}.
        </p>
      </Reveal>
      <Reveal delay={0.1} className="mt-8">
        <Orbit />
      </Reveal>
      <Reveal delay={0.2} className="mt-5 flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
        <span className="mr-auto flex flex-wrap gap-x-4 gap-y-2 font-mono text-[13px] text-soft sm:gap-x-5 sm:text-sm">
          <a href={site.cv} download {...hover(<IconBox path={downloadIcon} />)} className={rowLink}>
            cv
          </a>
          {site.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              {...hover(<IconBox path={link.icon} />)}
              className={rowLink}
            >
              {link.label.toLowerCase()}
            </a>
          ))}
        </span>
        <ThemeToggle />
      </Reveal>
      <Popup x={x} y={y} className="-translate-x-1/2 -translate-y-full">
        {popup}
      </Popup>
    </>
  )
}

function WorkList() {
  const [preview, setPreview] = useState<Project>()
  const x = useSpring(0, { stiffness: 320, damping: 32 })
  const y = useSpring(0, { stiffness: 320, damping: 32 })
  const popupLeft = (event: PointerEvent) => {
    const margin = event.currentTarget.getBoundingClientRect().right + 72
    return margin + 220 <= innerWidth ? margin : Math.min(event.clientX + 28, innerWidth - 228)
  }

  return (
    <div
      className="group/list mt-2"
      onPointerEnter={(event) => {
        x.jump(popupLeft(event))
        y.jump(event.clientY)
      }}
      onPointerMove={(event) => {
        x.set(popupLeft(event))
        y.set(event.clientY)
      }}
      onPointerLeave={() => setPreview(undefined)}
    >
      {projects.map((project, index) => (
        <Reveal key={project.slug} delay={0.3 + index * 0.08}>
          <Link
            to="/work/$slug"
            params={{ slug: project.slug }}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setPreview(project)
            }}
            className={workRow}
          >
            <WorkThumb slug={project.slug} className={thumb} />
            <RowText
              name={project.name}
              note={`${project.shortRole} · ${project.result}`}
              period={years(project.start, project.end)}
            />
          </Link>
        </Reveal>
      ))}
      <Reveal delay={0.3 + projects.length * 0.08}>
        <a
          href={upwork.url}
          target="_blank"
          rel="noreferrer"
          onPointerEnter={() => setPreview(undefined)}
          className={workRow}
        >
          <span className={`${thumb} grid place-items-center`}>
            <svg aria-hidden viewBox="0 0 24 24" className="size-5 text-soft" fill="currentColor">
              <path d={upwork.icon} />
            </svg>
          </span>
          <RowText name="Upwork ↗" note={`${upwork.shortRole} · ${upwork.result}`} period={years(upwork.start)} />
        </a>
      </Reveal>
      <Popup x={x} y={y} className="-translate-y-1/2">
        {preview && <ProjectReel project={preview} />}
      </Popup>
    </div>
  )
}

function ScrollHint() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 140], [1, 0])
  const pointerEvents = useTransform(scrollY, (top) => (top > 140 ? 'none' : 'auto'))
  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center max-sm:hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.6 }}
    >
      <motion.button
        type="button"
        style={{ opacity, pointerEvents }}
        onClick={() => document.getElementById('work')?.scrollIntoView()}
        className="flex cursor-pointer items-center gap-2.5 rounded-full border border-line bg-bg/75 py-1.5 pr-3 pl-3.5 font-mono text-[11px] text-soft backdrop-blur-md transition-colors hover:border-fg hover:text-fg"
      >
        Scroll
        <span aria-hidden className="flex flex-col gap-[3px]">
          {[0, 1, 2].map((dot) => (
            <i key={dot} className="size-[3px] animate-hint rounded-full bg-current" style={{ animationDelay: `${dot * 0.18}s` }} />
          ))}
        </span>
      </motion.button>
    </motion.div>
  )
}

function Stat({ stat }: { stat: (typeof stats)[number] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const progress = useMotionValue(1)
  const text = useTransform(progress, (done) => (done * stat.value).toFixed(stat.decimals))
  useEffect(() => {
    if (!inView) return
    progress.set(0)
    const controls = animate(progress, 1, { duration: 1.8, delay: 0.25, ease: 'easeInOut' })
    return () => controls.stop()
  }, [inView, progress])
  return (
    <div ref={ref}>
      <StatGraphic name={stat.graphic} progress={progress} />
      <div className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
        <motion.span>{text}</motion.span>
        {stat.suffix}
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-dim">{stat.label}</p>
    </div>
  )
}

function Home() {
  return (
    <>
      <section className="pt-10 sm:pt-12">
        <Bio />
      </section>

      <section id="work" className="pt-16 sm:pt-24">
        <SectionLabel glyph="work">Work</SectionLabel>
        <WorkList />
      </section>

      <section id="numbers" className="pt-16 sm:pt-24">
        <SectionLabel glyph="numbers">Numbers</SectionLabel>
        <div className="mt-5 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06}>
              <Stat stat={stat} />
            </Reveal>
          ))}
        </div>
      </section>

      <section id="clients" className="pt-16 sm:pt-24">
        <div className="flex items-center justify-between">
          <SectionLabel glyph="clients">Clients</SectionLabel>
          <a
            href={upwork.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-dim transition-colors hover:text-fg"
          >
            Reviews on Upwork ↗
          </a>
        </div>
        <ul className="group/list mt-2">
          {testimonials.map((quote) => (
            <li key={quote}>
              <Reveal>
                <blockquote className={`${row} py-3.5 leading-relaxed text-soft hover:text-fg`}>{quote}</blockquote>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section id="skills" className="pt-16 sm:pt-24">
        <SectionLabel glyph="skills">Skills</SectionLabel>
        <ul className="mt-5 space-y-4">
          {skills.map((group) => (
            <li key={group.title}>
              <Reveal className="grid gap-x-4 gap-y-1 sm:grid-cols-[8.5rem_1fr]">
                <span className="text-sm leading-relaxed text-dim">{group.title}</span>
                <span className="text-[15px] leading-relaxed text-soft">{group.items.join(' · ')}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <ScrollHint />
    </>
  )
}
