import { CellField, type Grid, type Point, type Scene } from './CellField'

const WORD = 'SAFTY'
const FONT = '700 100px "Instrument Sans Variable", sans-serif'
const SAMPLE = 4
const SPACING = 8
const REST = 0.3
const SOLID = 0.42

type Tile = Point & { gap: number; fade: number }

function wordmark({ columns, rows, light }: Grid): Scene {
  const sampler = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  let tiles: Tile[] = []
  let loose: Tile[] = []
  let drops: Point[] = []
  let nextDrop = 0

  const sample = () => {
    if (!sampler || !columns || !rows) return
    sampler.canvas.width = columns * SAMPLE
    sampler.canvas.height = rows * SAMPLE
    sampler.font = FONT
    sampler.letterSpacing = `${SPACING}px`
    const width = sampler.measureText(WORD).width - SPACING
    const cap = sampler.measureText('T').actualBoundingBoxAscent
    const height = Math.min(Math.floor(((columns * 0.86) / width) * cap), rows - 1)
    const scale = (height / cap) * SAMPLE
    sampler.setTransform(scale, 0, 0, scale, (columns * SAMPLE - width * scale) / 2, rows * SAMPLE)
    sampler.rect(0, -cap, width, cap)
    sampler.clip()
    sampler.fillStyle = '#fff'
    sampler.fillText(WORD, 0, 0)
    const { data } = sampler.getImageData(0, 0, columns * SAMPLE, rows * SAMPLE)
    tiles = []
    for (let y = rows - height; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const alpha = data[((y * SAMPLE + SAMPLE / 2) * columns * SAMPLE + x * SAMPLE + SAMPLE / 2) * 4 + 3] ?? 0
        if (alpha <= 110) continue
        const depth = (y - rows + height) / height
        tiles.push({
          x,
          y,
          gap: depth < SOLID ? -1 : Math.random() - 1 + ((depth - SOLID) / (1 - SOLID)) ** 1.1,
          fade: Math.min(1, (1 - depth ** 1.3) * 1.25),
        })
      }
    }
    loose = tiles.filter((tile) => tile.gap > 0)
  }
  sample()
  document.fonts.load(FONT).then(sample)

  return {
    trail: 0.02,
    tick({ step, time, pointer }) {
      const sweep = ((time * 26) % (columns + 60)) - 20
      for (const tile of tiles) {
        if (Math.sin(time * 1.3 + tile.x * 0.7 + tile.y) * 0.08 < tile.gap) continue
        const swept = Math.abs(tile.x + tile.y * 0.6 - sweep) < 1.5
        const near = pointer ? 1 - Math.hypot(tile.x - pointer.x, tile.y - pointer.y) / 7 : 0
        light(tile.x, tile.y, (swept ? 1 : Math.max(REST, near)) * tile.fade)
      }

      const fallen = loose[Math.floor(Math.random() * loose.length)]
      if (time > nextDrop && fallen) {
        nextDrop = time + 0.22
        drops.push({ x: fallen.x, y: fallen.y })
      }
      drops = drops.filter((drop) => drop.y < rows + 1)
      for (const drop of drops) {
        drop.y += step * 11
        light(drop.x, drop.y, 0.7)
      }
    },
  }
}

export function Wordmark() {
  return (
    <CellField
      start={wordmark}
      className="block aspect-[11/2] w-full [--cell:6px] sm:[--cell:8px] [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]"
    />
  )
}
