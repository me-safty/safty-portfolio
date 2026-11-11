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
import { Fragment, type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { DeviceReel } from '../components/Device'
import { DotMatrix, heroScenes } from '../components/DotMatrix'
import { Reveal, SectionLabel } from '../components/Reveal'
import { type Project, projects } from '../content/projects'
import { site, skills, stats, testimonials, upwork } from '../content/site'

export const Route = createFileRoute('/')({ component: Home })

const [universeDawn, pitchhub, meezan] = projects

const row =
  'group -mx-3 rounded-lg px-3 transition duration-300 hover:bg-fg/[0.06] group-hover/list:opacity-40 hover:opacity-100!'

const workRow = `${row} grid grid-cols-[4rem_1fr_auto] items-center gap-4 py-3`
const thumb = 'relative grid h-12 w-16 place-items-center overflow-hidden rounded-md border border-line'
const years = (start: string, end?: string) => `${start.slice(0, 4)} – ${end?.slice(0, 4) ?? 'now'}`

function Thumb({ project }: { project: Project }) {
  const frame = project.screens[0].shape === 'phone' ? 'h-8 w-[18px] rounded-[5px]' : 'h-7 w-11 rounded-[4px]'
  return (
    <span data-lit suppressHydrationWarning className={thumb}>
      <span className={`border border-fg/50 p-[3px] ${frame}`}>
        <span className="block h-full rounded-[2px] border border-fg/30" />
      </span>
      <img
        aria-hidden
        alt=""
        src={project.screens[0].src}
        className="lit-mask absolute inset-0 size-full object-cover object-[50%_22%] group-hover:[mask-image:none]"
      />
    </span>
  )
}

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

const mailIcon =
  'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z'
const downloadIcon = 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'

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
      <Reveal delay={0.1} className="mt-7 space-y-4 text-[17px] leading-[1.65] text-soft">
        <p>
          I'm a product engineer with 4+ years of shipping TypeScript products on web, mobile and backend. I work next
          to founders: I find the product gap, decide how it should work, build it and get it through App Store review.
        </p>
        <p>
          Right now I lead mobile and platform on {work(universeDawn)}. I also built {work(pitchhub)} and the{' '}
          {work(meezan)} frontend on my own.
        </p>
        <p>
          <a href={`mailto:${site.email}`} {...hover(<IconBox path={mailIcon} />)}>
            Email me
          </a>{' '}
          or{' '}
          <a href={site.cv} download {...hover(<IconBox path={downloadIcon} />)}>
            download my CV
          </a>
          . I'm also on{' '}
          {site.links.map((link, index) => (
            <Fragment key={link.label}>
              {index > 0 && (index === site.links.length - 1 ? ' and ' : ', ')}
              <a href={link.href} target="_blank" rel="noreferrer" {...hover(<IconBox path={link.icon} />)}>
                {link.label}
              </a>
            </Fragment>
          ))}
          .
        </p>
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
            <Thumb project={project} />
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
          <span className={thumb}>
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
      className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center"
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

function CountUp({ value, decimals }: { value: number; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(value)
  const text = useTransform(count, (current) => current.toFixed(decimals))
  useEffect(() => {
    if (!inView) return
    count.set(0)
    const controls = animate(count, value, { duration: 1.4, ease: [0.2, 0.7, 0.1, 1] })
    return () => controls.stop()
  }, [inView, count, value])
  return <motion.span ref={ref}>{text}</motion.span>
}

function Home() {
  return (
    <>
      <section className="pt-8">
        <Reveal className="-mx-6 sm:-mx-12">
          <DotMatrix scenes={heroScenes} />
        </Reveal>
        <Bio />
      </section>

      <section id="work" className="pt-16 sm:pt-24">
        <SectionLabel>Work</SectionLabel>
        <WorkList />
      </section>

      <section id="numbers" className="pt-16 sm:pt-24">
        <SectionLabel>Numbers</SectionLabel>
        <div className="mt-5 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06}>
              <div className="text-4xl font-semibold tracking-[-0.05em]">
                <CountUp value={stat.value} decimals={stat.decimals} />
                {stat.suffix}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-dim">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="clients" className="pt-16 sm:pt-24">
        <div className="flex items-baseline justify-between">
          <SectionLabel>Clients</SectionLabel>
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
        <SectionLabel>Skills</SectionLabel>
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
