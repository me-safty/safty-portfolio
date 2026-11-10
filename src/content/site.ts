const links: { label: string; href: string }[] = []

export const site = {
  name: 'Mohamed Safty',
  initials: 'MS',
  title: 'Senior Product Engineer',
  email: 'me.a.safty@gmail.com',
  location: 'Menofia, Egypt · Remote',
  about:
    'Product engineer with 4+ years shipping TypeScript products on web, mobile and backend. I do my best work next to a founder. I find the product gap, decide how it should work, build it end to end and get it through App Store review.',
  links,
}

export const upwork = {
  role: 'Freelance Full-Stack TypeScript Developer',
  start: '2022-08',
  note: 'Top Rated, 100% Job Success and a 5.0 rating across 11 jobs and 1.3K hours.',
}

export const stats = [
  { value: 10, decimals: 0, suffix: '×', label: 'Merged output after I built the AI-agent delivery platform' },
  { value: 93, decimals: 0, suffix: '', label: 'MRs merged in a 5-week mobile overhaul' },
  { value: 0.7, decimals: 1, suffix: ' s', label: 'Mobile config check, down from 7 to 9 s' },
  { value: 5, decimals: 1, suffix: '', label: 'Upwork rating, 100% Job Success across 11 jobs' },
]

export const skills = [
  {
    title: 'Product',
    items: [
      'MVP scoping',
      'UX and interaction design',
      'Onboarding and activation',
      'Monetization and store billing',
      'App Store and Google Play review',
      'Analytics and funnel plans',
    ],
  },
  {
    title: 'Frontend',
    items: ['React', 'TanStack Start, Router, Query', 'Next.js', 'TypeScript', 'Zustand', 'Tailwind CSS', 'shadcn/ui'],
  },
  {
    title: 'Mobile',
    items: ['React Native', 'Expo', 'Expo Router', 'EAS Build and Update', 'Push notifications', 'PWA'],
  },
  {
    title: 'Backend',
    items: ['Node.js', 'ts-rest', 'Express/tsoa', 'WebSockets', 'RabbitMQ', 'MongoDB', 'MySQL', 'Supabase', 'Convex'],
  },
  {
    title: 'Platform',
    items: ['pnpm monorepos', 'GitLab CI', 'Docker', 'Helm review environments', 'Jest', 'Vitest', 'Playwright'],
  },
  {
    title: 'AI engineering',
    items: ['Claude Code', 'Codex', 'Agent rules', 'Autonomous fix workers', 'Review and evidence loops'],
  },
]
