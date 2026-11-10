import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Device } from '../components/Device'
import { Reveal, SectionLabel } from '../components/Reveal'
import { periodLabel, projects } from '../content/projects'
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
        ]
      : [],
  }),
  component: CaseStudy,
})

function CaseStudy() {
  const { project, next } = Route.useLoaderData()
  const phones = project.screens.filter((screen) => screen.shape === 'phone')
  const desktops = project.screens.filter((screen) => screen.shape === 'browser')

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
          <dt className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">Role</dt>
          <dd className="mt-1.5">{project.role}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">Period</dt>
          <dd className="mt-1.5">{periodLabel(project.start)}</dd>
        </div>
      </dl>

      <Reveal className="mt-10 grid place-items-center rounded-xl border border-line bg-panel py-10">
        <Device screen={project.screens[0]} className="sm:[--u:3px]" />
      </Reveal>

      <p className="mt-10 text-xl leading-snug">{project.summary}</p>
      <ul className="mt-8 border-t border-line text-[15px]">
        {project.facts.map((fact) => (
          <li key={fact} className="border-b border-line py-3 text-soft">
            {fact}
          </li>
        ))}
      </ul>

      <section className="mt-16">
        <SectionLabel>Screens</SectionLabel>
        {phones.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {phones.map((screen) => (
              <Reveal key={screen.src}>
                <img
                  src={screen.src}
                  alt={screen.alt}
                  loading="lazy"
                  className="aspect-[9/19] w-full rounded-xl border border-line object-cover object-top transition-transform duration-300 hover:-translate-y-1"
                />
              </Reveal>
            ))}
          </div>
        )}
        {desktops.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {desktops.map((screen) => (
              <Reveal key={screen.src}>
                <img
                  src={screen.src}
                  alt={screen.alt}
                  loading="lazy"
                  className="aspect-[16/10] w-full rounded-lg border border-line object-cover object-top transition-transform duration-300 hover:-translate-y-1"
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {project.sections.map((section) => (
        <section key={section.title} className="mt-16">
          <SectionLabel>{section.title}</SectionLabel>
          <ol className="mt-4 border-t border-line">
            {section.items.map((item, index) => (
              <li key={item.title} className="border-b border-line">
                <Reveal className="grid gap-x-5 gap-y-1.5 py-6 sm:grid-cols-[2rem_1fr]">
                  <span className="font-mono text-xs text-dim sm:pt-1">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-soft">{item.body}</p>
                  </div>
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
        <span className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">Next</span>
        <span className="mt-2 flex items-baseline justify-between gap-6 text-3xl font-semibold tracking-[-0.04em]">
          {next.name}
          <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
        </span>
      </Link>
    </article>
  )
}
