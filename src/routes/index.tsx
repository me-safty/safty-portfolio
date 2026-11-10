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
import { type PointerEvent, useEffect, useRef, useState } from 'react'
import { DeviceReel } from '../components/Device'
import { DotMatrix, heroScenes } from '../components/DotMatrix'
import { Reveal, SectionLabel } from '../components/Reveal'
import { type Project, periodLabel, projects } from '../content/projects'
import { site, skills, stats, testimonials, upwork } from '../content/site'

export const Route = createFileRoute('/')({ loader: () => ({ now: Date.now() }), component: Home })

const row =
  'group -mx-3 rounded-lg px-3 transition duration-300 hover:bg-fg/[0.06] group-hover/list:opacity-40 hover:opacity-100!'

function Thumb({ project }: { project: Project }) {
  const frame = project.screens[0].shape === 'phone' ? 'h-8 w-[18px] rounded-[5px]' : 'h-7 w-11 rounded-[4px]'
  return (
    <span
      data-lit
      suppressHydrationWarning
      className="relative grid h-12 w-16 place-items-center overflow-hidden rounded-md border border-line"
    >
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
      className="group/list mt-3"
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
            className={`${row} grid grid-cols-[4rem_1fr_auto] items-center gap-4 py-3`}
          >
            <Thumb project={project} />
            <span>
              <span className="block font-semibold">{project.name}</span>
              <span className="block text-sm text-dim">
                {project.shortRole} · {project.result}
              </span>
            </span>
            <span className="font-mono text-xs text-dim transition group-hover:translate-x-1 group-hover:text-fg">
              {project.start.slice(0, 4)} →
            </span>
          </Link>
        </Reveal>
      ))}
      <AnimatePresence>
        {preview && (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed top-0 left-0 z-40"
            style={{ x, y }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
          >
            <div className="-translate-y-1/2">
              <DeviceReel key={preview.slug} screens={preview.screens.slice(0, 3)} interval={1500} className="[--u:1.7px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.25, 1])
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </>
  )
}

function ScrubText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.55'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className="mt-5 text-[clamp(1.3rem,3.4vw,1.6rem)] leading-[1.35] tracking-[-0.02em]">
      {words.map((word, index) => (
        <Word key={index} progress={scrollYProgress} range={[index / words.length, (index + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
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

type Role = {
  role: string
  place: string
  highlight: string
  start: string
  end?: string
  accent: string
  slug?: Project['slug']
}

const roles: Role[] = [
  ...projects.map((project) => ({
    role: project.role,
    place: project.name,
    highlight: `${project.kind}. ${project.result}.`,
    start: project.start,
    end: project.end,
    accent: project.accent,
    slug: project.slug,
  })),
  { role: upwork.role, place: 'Upwork', highlight: upwork.note, start: upwork.start, accent: '#34d399' },
]

const monthIndex = (date: Date) => date.getUTCFullYear() * 12 + date.getUTCMonth()
const monthOf = (month: string) => monthIndex(new Date(`${month}-01`))
const duration = (months: number) => {
  const years = Math.floor(months / 12)
  const rest = `${months % 12} mo`
  if (!years) return rest
  return months % 12 ? `${years} yr ${rest}` : `${years} yr`
}
const roll = 'block truncate transition-transform duration-300 group-hover:-translate-y-full'

function RoleRow({
  item,
  months,
  left,
  right,
  ticks,
}: {
  item: Role
  months: number
  left: number
  right: number
  ticks: number[]
}) {
  const elapsed = useMotionValue(months)
  const counted = useTransform(elapsed, (value) => duration(Math.round(value)))
  const className = `${row} grid gap-x-6 gap-y-2 py-3.5 sm:grid-cols-[1fr_11rem]`
  const countUp = () => {
    elapsed.set(0)
    animate(elapsed, months, { duration: 0.9, ease: 'easeOut' })
  }
  const content = (
    <>
      <span className="min-w-0">
        <span className="block text-[15px]">{item.role}</span>
        <span className="block h-5 overflow-hidden text-[13px] leading-5">
          <span className={`${roll} text-dim`}>{item.place}</span>
          <span className={`${roll} text-soft`}>{item.highlight}</span>
        </span>
      </span>
      <span>
        <span className="block h-4 overflow-hidden font-mono text-xs leading-4 sm:text-right">
          <span className={`${roll} text-dim`}>{periodLabel(item.start, item.end)}</span>
          <motion.span className={roll}>{counted}</motion.span>
        </span>
        <span className="relative mt-2 block h-1.5">
          {ticks.map((tick) => (
            <i key={tick} className="absolute inset-y-0 w-px bg-line" style={{ left: `${tick}%` }} />
          ))}
          <span
            className="absolute inset-y-0 overflow-hidden rounded-full border border-fg/30"
            style={{ left: `${left}%`, right: `${right}%` }}
          >
            <span
              className="block h-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
              style={{ background: item.accent }}
            />
          </span>
        </span>
      </span>
    </>
  )
  return item.slug ? (
    <Link to="/work/$slug" params={{ slug: item.slug }} className={className} onPointerEnter={countUp}>
      {content}
    </Link>
  ) : (
    <div className={className} onPointerEnter={countUp}>
      {content}
    </div>
  )
}

function Experience() {
  const { now } = Route.useLoaderData()
  const end = monthIndex(new Date(now))
  const begin = Math.min(...roles.map((role) => monthOf(role.start)))
  const position = (month: number) => ((month - begin) / (end - begin)) * 100
  const years = Array.from({ length: Math.floor(end / 12) - Math.floor(begin / 12) }, (_, index) => Math.floor(begin / 12) + index + 1)

  return (
    <section id="experience" className="pt-14">
      <div className="flex items-end justify-between">
        <SectionLabel>Experience</SectionLabel>
        <div className="relative h-4 w-44 font-mono text-[10px] text-dim max-sm:hidden">
          {years.map((year) => (
            <span key={year} className="absolute -translate-x-1/2" style={{ left: `${position(year * 12)}%` }}>
              '{year % 100}
            </span>
          ))}
          <span className="absolute right-0">now</span>
        </div>
      </div>
      <ul className="group/list mt-3">
        {roles.map((item) => {
          const from = monthOf(item.start)
          const to = item.end ? monthOf(item.end) : end
          return (
            <li key={item.place} className="border-t border-line">
              <Reveal>
                <RoleRow
                  item={item}
                  months={to - from}
                  left={position(from)}
                  right={100 - position(to)}
                  ticks={years.map((year) => position(year * 12))}
                />
              </Reveal>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Home() {
  return (
    <>
      <section className="pt-8">
        <Reveal className="-mx-6 sm:-mx-12">
          <DotMatrix scenes={heroScenes} />
        </Reveal>
        <Reveal delay={0.1} className="mt-7">
          <p className="text-[17px] leading-[1.65] text-soft">
            I build products next to founders, from the first scope to App Store review. I lead mobile and platform on{' '}
            <Link to="/work/$slug" params={{ slug: 'universe-dawn' }} className="link">
              Universe Dawn
            </Link>
            , and I built{' '}
            <Link to="/work/$slug" params={{ slug: 'pitchhub' }} className="link">
              PitchHub
            </Link>{' '}
            and the{' '}
            <Link to="/work/$slug" params={{ slug: 'meezan' }} className="link">
              Meezan
            </Link>{' '}
            frontend on my own.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="mt-6 flex flex-wrap items-center gap-2.5">
          <a href={`mailto:${site.email}`} className="btn">
            Email me
          </a>
          <a href={site.cv} download className="btn btn-ghost">
            Download CV
          </a>
          <span className="flex gap-1.5 sm:ml-auto">
            {site.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                title={link.label}
                className="grid size-9 place-items-center rounded-full border border-line text-soft transition-colors hover:border-fg hover:bg-fg hover:text-bg"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
                  <path d={link.icon} />
                </svg>
              </a>
            ))}
          </span>
        </Reveal>
      </section>

      <section id="work" className="pt-14">
        <SectionLabel>Work</SectionLabel>
        <WorkList />
      </section>

      <section id="clients" className="pt-14">
        <div className="flex items-end justify-between">
          <SectionLabel>Clients</SectionLabel>
          <a
            href={upwork.url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] text-dim transition-colors hover:text-fg"
          >
            Reviews on Upwork ↗
          </a>
        </div>
        <ul className="group/list mt-3">
          {testimonials.map((quote, index) => (
            <li key={quote} className="border-t border-line">
              <Reveal>
                <div className={`${row} grid gap-x-5 gap-y-1.5 py-5 sm:grid-cols-[2rem_1fr]`}>
                  <span aria-hidden className="font-mono text-xs text-dim sm:pt-1">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <blockquote className="leading-relaxed text-soft transition-colors duration-300 group-hover:text-fg">
                    {quote}
                  </blockquote>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <Experience />

      <section id="about" className="pt-20">
        <SectionLabel>About</SectionLabel>
        <ScrubText text={site.about} />
        <div className="mt-12 grid grid-cols-2 border-t border-l border-line sm:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06} className="border-r border-b border-line p-4">
              <div className="text-4xl font-semibold tracking-[-0.05em]">
                <CountUp value={stat.value} decimals={stat.decimals} />
                {stat.suffix}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-dim">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="skills" className="pt-20">
        <SectionLabel>Skills</SectionLabel>
        <ul className="mt-4">
          {skills.map((group) => (
            <li key={group.title} className="border-t border-line">
              <Reveal className="group grid gap-2.5 py-4 sm:grid-cols-[8.5rem_1fr]">
                <span className="font-mono text-xs text-dim transition-colors duration-300 group-hover:text-fg sm:pt-1.5">
                  {group.title}
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span key={item} data-near suppressHydrationWarning className="pill">
                      {item}
                    </span>
                  ))}
                </span>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
