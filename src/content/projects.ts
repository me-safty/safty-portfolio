const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })

export const periodLabel = (start: string) => `${monthYear.format(new Date(`${start}-01`))} to Present`

export type Screen = { src: string; shape: 'phone' | 'browser'; alt: string }

const screen = (slug: Project['slug'], name: string, shape: Screen['shape'], alt: string): Screen => ({
  src: `/shots/${slug}/${name}.webp`,
  shape,
  alt,
})

export type Project = {
  slug: 'universe-dawn' | 'pitchhub' | 'meezan'
  name: string
  kind: string
  role: string
  shortRole: string
  result: string
  start: string
  accent: string
  screens: [Screen, ...Screen[]]
  summary: string
  facts: string[]
  sections: { title: string; items: { title: string; body: string }[] }[]
}

const universeDawn: Project = {
  slug: 'universe-dawn',
  name: 'Universe Dawn',
  kind: 'Sci-fi strategy MMO',
  role: 'Lead Engineer, Mobile & Platform (contract), Team Parallax',
  shortRole: 'Lead engineer',
  result: '93 MRs in a 5-week mobile overhaul',
  start: '2022-09',
  accent: '#8ea2ff',
  screens: [
    screen('universe-dawn', 'galaxy', 'phone', 'Galaxy map in the Universe Dawn mobile app'),
    screen('universe-dawn', 'radar', 'phone', 'Tactical scan radar with contacts'),
    screen('universe-dawn', 'fight-report', 'phone', 'Fight report'),
    screen('universe-dawn', 'fight-replay', 'phone', 'Fight replay'),
    screen('universe-dawn', 'fleet-mission', 'phone', 'Fleet detail with its ships'),
    screen('universe-dawn', 'ships', 'phone', 'Ship list'),
    screen('universe-dawn', 'planet-buildings', 'phone', 'Headquarters building on a planet'),
    screen('universe-dawn', 'status-quests', 'phone', 'Status screen with quests and scanners'),
    screen('universe-dawn', 'desk-buildings', 'browser', 'Planet buildings in the desktop client'),
    screen('universe-dawn', 'desk-galaxy-map', 'browser', 'Galaxy map in the desktop client'),
  ],
  summary:
    "Universe Dawn is a sci-fi strategy MMO with a React desktop client, an Expo app for iOS, Android and mobile web, and Node.js microservices. I'm the main engineer, working directly with the founder, and I own the client apps and the API platform.",
  facts: [
    '93 MRs merged in a 5-week mobile overhaul',
    '10x merged output with the agent platform',
    'Config check cut from 9 s to 0.7 s',
  ],
  sections: [
    {
      title: 'Platform and architecture',
      items: [
        {
          title: 'Next.js to TanStack Start',
          body: 'After login the game runs as a client-side app, so a client router with typed loaders fits it better than a server-first framework. Auth moved into route loaders with signed session cookies. Config loads at runtime, so one image deploys to every environment.',
        },
        {
          title: 'ts-rest contracts at the gateway',
          body: 'The generated API clients kept drifting from the gateway, and every change meant regenerating them. Contracts replaced them, with typed request and response schemas and authorization per route.',
        },
        {
          title: 'One shared-state package',
          body: 'Queries, mutations, WebSocket subscriptions, sessions and the persisted cache live in one package used by desktop and mobile. Each app used to keep its own copy, so a fix often landed on one side only. Sharing that logic made the mobile overhaul possible.',
        },
        {
          title: 'Expo and EAS in CI',
          body: 'I migrated the React Native app to Expo and kept it current through SDK 57 and 58. Each MR gets a preview build with QR codes. Releases ship as OTA updates unless the native fingerprint changed. The app also runs as an installable PWA.',
        },
        {
          title: 'Faster start',
          body: 'Mobile config revalidation went from a 764 KB download, 7 to 9 s on staging, to a 4-byte hash check at about 0.7 s. On desktop, sidebar navigation became instant through viewport preloading and caching tuned to the data the WebSocket already keeps fresh.',
        },
      ],
    },
    {
      title: 'Product decisions',
      items: [
        {
          title: 'Mobile overhaul',
          body: 'Five weeks, 93 MRs merged through one integration branch. Fights, fleets, shipyard, chat, quests, the academy and premium reached desktop parity, with the screens redesigned for touch.',
        },
        {
          title: 'Navigation',
          body: "Five popup menus on one flat stack became a bottom tab bar with a stack per tab. Back no longer jumps across sections, the tab bar shows where you are, and every URL kept working, so deep links didn't break.",
        },
        {
          title: 'Tactical scan radar',
          body: 'Contacts sit on a square radar inside an x/y/z coordinate frame, with pinch to zoom and a tap that opens a spot card with "Fly here". Before this, players read coordinates off a table.',
        },
        {
          title: 'Push opt-in',
          body: 'The app asks after onboarding or the first fleet send instead of at launch. "Not now" brings the prompt back after 3 days, at most 3 times, and players choose categories. The backend sends through Expo Push in 7 languages and disables dead devices based on push receipts.',
        },
        {
          title: 'Chat moderation',
          body: 'Reporting, blocking and a moderator queue meet Apple guideline 1.2 on user-generated content. Only senders and moderators can delete messages.',
        },
        {
          title: 'Analytics plan',
          body: "PostHog events match on mobile and desktop through one shared event core, so the clients can't drift. The plan covers the core funnels and consent for session replay.",
        },
      ],
    },
    {
      title: 'AI-agent delivery platform',
      items: [
        {
          title: 'Agents that ship safely',
          body: 'I built and run the platform that lets coding agents ship in a large TypeScript monorepo. It has agent rules, seeded review scenarios with a CI check that gameplay service changes include one, isolated dev stacks, a shared build queue and EAS preview builds for each MR.',
        },
        {
          title: 'Autonomous workers',
          body: 'A Discord Codex worker and a PostHog error intake publish fixes through the same review as every other change.',
        },
        {
          title: '10x merged output',
          body: 'October 2026 against my February to September monthly average, with screenshot or recording evidence on every MR.',
        },
      ],
    },
  ],
}

const pitchhub: Project = {
  slug: 'pitchhub',
  name: 'PitchHub',
  kind: 'Founder and angel investor matching app',
  role: 'Solo developer for a client founder',
  shortRole: 'Solo developer',
  result: 'Live on both app stores',
  start: '2025-05',
  accent: '#ff8a5c',
  screens: [
    screen('pitchhub', 'public-feed', 'phone', 'Public pitch feed shown before sign-up'),
    screen('pitchhub', 'roles', 'phone', 'Founder or angel investor choice during onboarding'),
    screen('pitchhub', 'home', 'phone', 'Founder home dashboard'),
    screen('pitchhub', 'login', 'phone', 'Sign-in with Apple, Google or email'),
  ],
  summary:
    'PitchHub matches founders with angel investors through video pitches. I scoped the MVP with the founder and built it alone. It is live on the App Store and Google Play.',
  facts: [
    'Live on the App Store and Google Play',
    '6 tables, 21 RLS policies, 2 edge functions',
    'v2 adds tiers and store-native billing',
  ],
  sections: [
    {
      title: 'Version 1',
      items: [
        {
          title: 'MVP scope',
          body: 'Onboarding by role, video pitches as the core format instead of decks, swipe discovery, matching and push notifications.',
        },
        {
          title: 'Matching rules',
          body: "An investor's like creates a pending match and only the founder can confirm it, enforced in Postgres with a restrictive RLS policy. The contact email appears only after confirmation.",
        },
        {
          title: 'Browse before sign-up',
          body: 'Visitors can browse published pitches first, so they see what the app offers before the account wall.',
        },
        {
          title: 'Expo and Supabase',
          body: 'I chose them so one developer could ship to both stores. The backend has 6 tables, 21 RLS policies, database triggers for match notifications and 2 edge functions. Sign-in covers email, Google and Apple. EAS channels publish an OTA preview on every push to master.',
        },
        {
          title: 'Media costs',
          body: 'Video goes to ImageKit with 5-minute signed upload tokens from an edge function instead of a Supabase Storage bucket. I dropped image transforms when Supabase made them a Pro feature.',
        },
      ],
    },
    {
      title: 'Version 2, in progress',
      items: [
        {
          title: 'Tiers and billing',
          body: 'Free, Standard and Premium with a 30-day trial. Billing is store-native through RevenueCat, which is free under $2.5k monthly revenue, instead of Stripe web checkout. The first paywall sits on pitch views.',
        },
        {
          title: 'One profile',
          body: 'Founder and investor roles merge into one profile with two-way matching.',
        },
        {
          title: 'Supabase to Convex',
          body: 'The backend moves to Convex and migrates existing users instead of resetting them.',
        },
      ],
    },
  ],
}

const meezan: Project = {
  slug: 'meezan',
  name: 'Meezan',
  kind: 'Multi-tenant ERP for gold and jewelry businesses',
  role: 'Lead frontend engineer (contract)',
  shortRole: 'Lead frontend',
  result: '99 routes across 36 modules',
  start: '2025-08',
  accent: '#e0b85a',
  screens: [
    screen('meezan', 'home', 'browser', 'Meezan dashboard with gold and silver prices'),
    screen('meezan', 'sales-invoice', 'browser', 'Sales invoice with ZATCA e-invoicing'),
    screen('meezan', 'daily-journal', 'browser', 'Daily journal entry with balances per karat'),
    screen('meezan', 'vat-reports', 'browser', 'VAT reports'),
    screen('meezan', 'item-cards', 'browser', 'Item card form'),
    screen('meezan', 'gold-conversions', 'browser', 'Gold conversions list'),
  ],
  summary:
    "Meezan is an Arabic and English accounting and ERP dashboard for Saudi gold and jewelry shops. I own the frontend architecture, UX and visual design. The client's team owns the backend API.",
  facts: [
    '99 routes across 36 feature modules',
    'Arabic and English, full right-to-left',
    'ZATCA e-invoicing per branch',
  ],
  sections: [
    {
      title: 'Scope',
      items: [
        {
          title: 'One subdomain per business',
          body: '99 routes across 36 feature modules cover sales, purchase and return invoices, vouchers, the chart of accounts, journals, gold karat balances, inventory counts, VAT reports and ZATCA e-invoicing per branch.',
        },
        {
          title: 'One invoice foundation',
          body: 'Sales, purchases and returns share it, so a new document type reuses invoice lines, attachments, payment cases and branch state.',
        },
      ],
    },
    {
      title: 'Design',
      items: [
        {
          title: 'Built for all-day entry',
          body: 'Staff enter invoices all day. They get virtualized tables, validated forms, attachment upload from a phone by QR code and a full right-to-left layout.',
        },
      ],
    },
    {
      title: 'Stack',
      items: [
        {
          title: 'Next.js 16 and React 19',
          body: 'React Compiler with TanStack Query, Table and Virtual.',
        },
        {
          title: 'Reports and files',
          body: 'Stimulsoft PDF and Excel reports load lazily. The file proxy is hardened against SSRF.',
        },
      ],
    },
  ],
}

export const projects: [Project, ...Project[]] = [universeDawn, pitchhub, meezan]
