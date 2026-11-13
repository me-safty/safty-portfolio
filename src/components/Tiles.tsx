import type { MotionValue } from 'motion/react'
import { useMemo } from 'react'
import type { Project } from '../content/projects'
import { CellField, type Grid, type Scene } from './CellField'

type Sprite = string[]

const LEVELS: Record<string, number> = { '#': 1, '+': 0.5 }
const REST = 0.55

function stamp(light: Grid['light'], sprite: Sprite, left: number, top: number, gain = 1) {
  sprite.forEach((line, y) => {
    for (let x = 0; x < line.length; x++) {
      const level = LEVELS[line[x] ?? '']
      if (level) light(left + x, top + y, level * gain)
    }
  })
}

const list = (active: number): Sprite =>
  Array.from({ length: 7 }, (_, row) => (row % 2 === 0 ? '.......' : row === active ? '#.#####' : '..+++++'))

const bars = (heights: number[]): Sprite =>
  Array.from({ length: 7 }, (_, row) =>
    heights.map((height) => (7 - row > height ? '.' : 7 - row === height ? '#' : '+')).join('.'),
  )

const bubble = (dots: string): Sprite => ['.+++++.', '+.....+', `+${dots}+`, '+.....+', '.+++++.', '.+.....', '+......']

const blocks = (count: number): Sprite =>
  Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => {
      const block = (row < 3 ? 2 : 0) + (column < 3 ? 0 : 1)
      if (row === 3 || column === 3 || block >= count) return '.'
      return block === count - 1 ? '#' : '+'
    }).join(''),
  )

const envelope = (flap: string): Sprite => [
  '.......',
  '#######',
  `#${flap}...${flap}#`,
  `#.${flap}.${flap}.#`,
  `#..${flap}..#`,
  '#######',
  '.......',
]

const target = (aim: string): Sprite => ['...#...', '.#####.', '.#...#.', `##.${aim}.##`, '.#...#.', '.#####.', '...#...']

const browser = (line: string): Sprite => ['#######', '#+++++#', '#######', '#.....#', `#${line}#`, '#.....#', '#######']

const phone = (alert: string): Sprite => ['.#####.', '.#...#.', `.#.${alert}.#.`, '.#...#.', '.#...#.', '.#.+.#.', '.#####.']

const rack = (busy: number): Sprite =>
  Array.from({ length: 7 }, (_, row) => (row % 2 === 0 ? '.......' : row === busy ? '#####.#' : '#####.+'))

const branch = (tip: string): Sprite => [
  `##...${tip}${tip}`,
  `##...${tip}${tip}`,
  '#....#.',
  '#...#..',
  '####...',
  '##.....',
  '##.....',
]

const spark = (tip: string): Sprite => [
  `...${tip}...`,
  '...#...',
  '..###..',
  `${tip}#####${tip}`,
  '..###..',
  '...#...',
  `...${tip}...`,
]

const glyph =
  (frames: Sprite[]) =>
  ({ columns, still, light }: Grid): Scene => ({
    tick({ time }) {
      const shown = still ? columns : time / 0.12
      const frame = frames[Math.floor(time / 1.1) % frames.length] ?? []
      stamp(
        light,
        frame.map((line) => line.slice(0, shown)),
        0,
        0,
      )
    },
  })

const glyphs = {
  work: glyph([1, 3, 5].map(list)),
  numbers: glyph([[2, 4, 3, 6], [3, 5, 4, 7], [2, 3, 5, 7]].map(bars)),
  clients: glyph(['.#...', '.#.#.', '.....'].map(bubble)),
  skills: glyph([1, 2, 3, 4].map(blocks)),
  contact: glyph(['#', '+'].map(envelope)),
  product: glyph(['#', '.'].map(target)),
  frontend: glyph(['+....', '+++..', '+++++'].map(browser)),
  mobile: glyph(['.', '#'].map(phone)),
  backend: glyph([1, 3, 5].map(rack)),
  platform: glyph(['#', '+'].map(branch)),
  ai: glyph(['.', '+', '#'].map(spark)),
}

export type GlyphName = keyof typeof glyphs

export function SectionGlyph({ name }: { name: GlyphName }) {
  return <CellField start={glyphs[name]} className="size-[21px] shrink-0 text-fg [--cell:3px]" />
}

type Step = { sprite: Sprite; x: number; y: number }

const CHECK = [
  [1, 4],
  [2, 5],
  [3, 4],
  [4, 3],
  [5, 2],
] as const
const STAR = ['..#..', '#####', '.###.', '.#.#.', '#...#']
const PHONE = ['.#####.', ...Array<string>(7).fill('#.....#'), '#..#..#', '.#####.']

const graphics = {
  bars: Array.from({ length: 10 }, (_, bar): Step => ({ sprite: Array<string>(bar + 1).fill('##'), x: bar * 3, y: 9 - bar })),
  phones: [0, 9].flatMap((x): Step[] => [
    { sprite: PHONE, x, y: 0 },
    ...CHECK.map(([left, top]) => ({ sprite: ['#'], x: x + left, y: top })),
  ]),
  years: [
    ...Array.from({ length: 4 }, (_, year): Step => ({ sprite: Array<string>(6).fill('#####'), x: year * 6, y: 4 })),
    { sprite: ['+.+.+'], x: 24, y: 9 },
  ],
  stars: Array.from({ length: 5 }, (_, star): Step => ({ sprite: STAR, x: star * 6, y: 5 })),
}

export type GraphicName = keyof typeof graphics

export function StatGraphic({ name, progress }: { name: GraphicName; progress: MotionValue<number> }) {
  const start = useMemo(() => {
    const steps = graphics[name]
    return ({ light }: Grid): Scene => ({
      tick() {
        const reached = progress.get() * steps.length
        steps.forEach((step, index) => {
          if (index < reached) stamp(light, step.sprite, step.x, step.y, Math.max(REST, 1 - (reached - index) / 2))
        })
      },
    })
  }, [name, progress])
  return <CellField start={start} className="block h-10 w-[116px] [--cell:4px]" />
}

function rating({ still, light }: Grid): Scene {
  return {
    trail: 0.01,
    tick({ time }) {
      for (let star = 0; star < 5; star++) {
        const since = still ? 1 : time - 0.5 - star * 0.16
        if (since > 0) stamp(light, STAR, star * 6, 0, Math.max(0.85, 1 - since))
      }
    },
  }
}

export function Rating() {
  return <CellField start={rating} className="h-[15px] w-[87px] [--cell:3px]" />
}

export function Pipeline({ stations, active }: { stations: number; active: MotionValue<number | undefined> }) {
  const start = useMemo(
    () =>
      ({ columns, light }: Grid): Scene => {
        const centre = (station: number) => Math.floor(((station + 0.5) * columns) / stations)
        const end = centre(stations - 1)
        let packets: number[] = []
        let nextPacket = 0
        return {
          tick({ step, time }) {
            for (let x = centre(0); x <= end; x++) light(x, 4, 0.14)
            for (let station = 0; station < stations; station++) {
              const hot = active.get() === station
              for (let y = 2; y <= 6; y++) {
                for (let x = -2; x <= 2; x++) {
                  const edge = Math.abs(x) === 2 || y === 2 || y === 6
                  light(centre(station) + x, y, hot ? 1 : edge ? 0.5 : 0.18 + Math.sin(time * 2 + station) * 0.1)
                }
              }
            }
            if (time > nextPacket) {
              nextPacket = time + 0.9
              packets.push(centre(0))
            }
            packets = packets.map((x) => x + step * 16).filter((x) => x <= end)
            for (const x of packets) light(x, 4, 1)
          },
        }
      },
    [stations, active],
  )
  return (
    <CellField
      start={start}
      className="block h-[54px] w-full [--cell:6px] sm:h-[72px] sm:[--cell:8px] [mask-image:linear-gradient(90deg,transparent,#000_3%,#000_97%,transparent)]"
    />
  )
}

const SKY = [
  [1, 1],
  [12, 0],
  [14, 3],
  [2, 9],
  [13, 10],
  [4, 5],
] as const
const PLAY = ['#...', '##..', '###.', '####', '###.', '##..', '#...']
const CRISP = 1e-4

function planet({ light }: Grid): Scene {
  return {
    trail: CRISP,
    tick({ time }) {
      for (let y = 3; y <= 8; y++) {
        for (let x = 5; x <= 10; x++) {
          const across = (x - 7.5) / 3
          const down = (y - 5.5) / 3
          const far = across ** 2 + down ** 2
          if (far > 1) continue
          const lit = -across * 0.55 - down * 0.45 + Math.sqrt(1 - far) * 0.6
          light(x, y, 0.2 + Math.max(0, Math.min(1, lit)) * 0.8)
        }
      }
      SKY.forEach(([x, y], index) => light(x, y, 0.22 + Math.sin(time * 3 + index * 2) * 0.18))
      const angle = time * 1.4
      const x = 7.5 + Math.cos(angle) * 6.5
      const y = 5.5 + Math.sin(angle) * 2.2
      if (Math.sin(angle) > 0 || Math.hypot(x - 7.5, y - 5.5) > 3.5) light(x, y, 1)
    },
  }
}

function pitch({ light }: Grid): Scene {
  return {
    trail: CRISP,
    tick({ time }) {
      stamp(light, PLAY, 6, 1, 0.75 + Math.cos(time * 5) * 0.25)
      const played = ((time * 0.35) % 1) * 12
      for (let x = 0; x < 12; x++) light(2 + x, 10, x < played ? 1 : 0.25)
    },
  }
}

function scale({ light }: Grid): Scene {
  return {
    trail: 0,
    tick({ time }) {
      const tip = Math.sin(time * 1.8) * 0.25
      const beam = (x: number) => Math.round(2 + (x - 7.5) * tip)
      for (let y = 2; y <= 9; y++) for (const x of [7, 8]) light(x, y, 0.5)
      for (let x = 5; x <= 10; x++) light(x, 10, 0.5)
      for (let x = 2; x <= 13; x++) light(x, beam(x), 1)
      for (const [end, pan] of [
        [2, 1],
        [13, 11],
      ] as const) {
        light(end, beam(end) + 1, 0.3)
        light(end, beam(end) + 2, 0.3)
        for (let x = pan; x < pan + 4; x++) light(x, beam(end) + 3, 0.9)
      }
    },
  }
}

const scenes: Record<Project['slug'], (grid: Grid) => Scene> = { 'universe-dawn': planet, pitchhub: pitch, meezan: scale }

export function WorkThumb({ slug, className }: { slug: Project['slug']; className: string }) {
  return (
    <CellField
      start={scenes[slug]}
      className={`${className} [--cell:4px] group-hover:[--play:1] group-focus-visible:[--play:1] [@media(hover:hover)]:[--play:0]`}
    />
  )
}
