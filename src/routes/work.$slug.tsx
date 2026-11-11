import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { DeviceReel } from '../components/Device'
import { Reveal, SectionLabel } from '../components/Reveal'
import { type Screen, periodLabel, projects } from '../content/projects'
import { site } from '../content/site'

export const Route = createFileRoute('/work/$slug')({
  loader: ({ params }) => {
    const index = projects.findIndex((project) => project.slug === params.slug)
    const project = projects[index]
    const next = projects[(index + 1) % projects.length]
    if (!project || !next) throw notFound()
    return { project, next }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.name} · ${site.name}` },
          { name: 'description', content: loaderData.project.summary },
          { property: 'og:title', content: `${loaderData.project.name} · ${site.name}` },
          { property: 'og:description', content: loaderData.project.summary },
        ]
      : [],
  }),
  component: CaseStudy,
})

function Shot({ screen, className, onZoom }: { screen: Screen; className: string; onZoom: (screen: Screen) => void }) {
  return (
    <Reveal>
      <button
        type="button"
        onClick={() => onZoom(screen)}
        className="block w-full cursor-zoom-in transition-transform duration-300 hover:-translate-y-1"
      >
        <img
          src={screen.src}
          alt={screen.alt}
          loading="lazy"
          className={`w-full border border-line object-cover object-top ${className}`}
        />
      </button>
    </Reveal>
  )
}

function CaseStudy() {
  const { project, next } = Route.useLoaderData()
  const phones = project.screens.filter((screen) => screen.shape === 'phone')
  const desktops = project.screens.filter((screen) => screen.shape === 'browser')
  const lightbox = useRef<HTMLDialogElement>(null)
  const [zoomed, setZoomed] = useState<Screen>()
  const zoom = (screen: Screen) => {
    setZoomed(screen)
    lightbox.current?.showModal()
  }

  return (
    <article className="pt-10">
      <Link to="/" hash="work" className="font-mono text-xs text-dim transition-colors hover:text-fg">
        ← All work
      </Link>
      <div className="mt-9 flex items-center gap-2 font-mono text-[11px] text-dim">
        <span className="size-1.5 rounded-full" style={{ background: project.accent }} />
        {project.kind}
      </div>
      <h1 className="-mb-[0.14em] overflow-hidden pt-3 pb-[0.14em] text-[clamp(2.6rem,10vw,4.25rem)] leading-none font-semibold tracking-[-0.045em]">
        <motion.span
          key={project.slug}
          className="block"
          initial={{ y: '115%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.1, 1] }}
        >
          {project.name}
        </motion.span>
      </h1>
      <dl className="mt-9 grid gap-x-10 gap-y-5 text-[15px] sm:grid-cols-[1.5fr_1fr]">
        <div>
          <dt className="text-sm text-dim">Role</dt>
          <dd className="mt-1.5">{project.role}</dd>
        </div>
        <div>
          <dt className="text-sm text-dim">Period</dt>
          <dd className="mt-1.5">{periodLabel(project.start, project.end)}</dd>
        </div>
      </dl>

      <Reveal className="mt-10 grid place-items-center rounded-xl border border-line bg-panel py-10">
        <DeviceReel
          key={project.slug}
          screens={project.screens[0].shape === 'phone' ? phones : desktops}
          interval={2800}
          className="sm:[--u:3px]"
        />
      </Reveal>

      <p className="mt-10 text-xl leading-snug">{project.summary}</p>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {project.facts.map((fact, index) => (
          <Reveal key={fact.label} delay={index * 0.06}>
            <div className="text-4xl font-semibold tracking-[-0.05em]">{fact.value}</div>
            <p className="mt-2 text-[13px] leading-relaxed text-dim">{fact.label}</p>
          </Reveal>
        ))}
      </div>

      <section className="mt-20">
        <SectionLabel>Screens</SectionLabel>
        {phones.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {phones.map((screen) => (
              <Shot key={screen.src} screen={screen} className="aspect-[9/19] rounded-xl" onZoom={zoom} />
            ))}
          </div>
        )}
        {desktops.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {desktops.map((screen) => (
              <Shot key={screen.src} screen={screen} className="aspect-[16/10] rounded-lg" onZoom={zoom} />
            ))}
          </div>
        )}
      </section>

      {project.sections.map((section) => (
        <section key={section.title} className="mt-20">
          <SectionLabel>{section.title}</SectionLabel>
          <ol className="mt-5 space-y-7">
            {section.items.map((item) => (
              <li key={item.title}>
                <Reveal>
                  <h3 className="text-[17px] font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-soft">{item.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <Link
        to="/work/$slug"
        params={{ slug: next.slug }}
        className="group -mx-3 mt-16 block rounded-lg px-3 py-5 transition-colors hover:bg-fg/[0.06]"
      >
        <span className="text-sm text-dim">Next</span>
        <span className="mt-2 flex items-baseline justify-between gap-6 text-3xl font-semibold tracking-[-0.04em]">
          {next.name}
          <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
        </span>
      </Link>

      <dialog
        ref={lightbox}
        onClick={() => lightbox.current?.close()}
        className="m-auto cursor-zoom-out bg-transparent outline-none backdrop:bg-black/85 backdrop:backdrop-blur-sm"
      >
        {zoomed && <img src={zoomed.src} alt={zoomed.alt} className="max-h-[92svh] max-w-[92vw] rounded-xl" />}
      </dialog>
    </article>
  )
}
