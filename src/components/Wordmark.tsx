import { CellField, type Grid, type Point, type Scene } from './CellField'

const WORD = 'SAFTY'
const FONT = '700 100px "Instrument Sans Variable", sans-serif'
const SAMPLE = 4
const SPACING = 8
const REST = 0.3

function wordmark({ columns, rows, light }: Grid): Scene {
  const sampler = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  let cells: Point[] = []

  const sample = () => {
    if (!sampler || !columns || !rows) return
    sampler.canvas.width = columns * SAMPLE
    sampler.canvas.height = rows * SAMPLE
    sampler.font = FONT
    sampler.letterSpacing = `${SPACING}px`
    const width = sampler.measureText(WORD).width - SPACING
    const cap = sampler.measureText('T').actualBoundingBoxAscent
    const height = Math.floor(Math.min(((columns * 0.86) / width) * cap, rows - 2))
    const scale = (height / cap) * SAMPLE
    const left = (columns * SAMPLE - width * scale) / 2
    sampler.setTransform(scale, 0, 0, scale, left, Math.round((rows + height) / 2) * SAMPLE)
    sampler.rect(0, -cap, width, cap)
    sampler.clip()
    sampler.fillStyle = '#fff'
    sampler.fillText(WORD, 0, 0)
    const { data } = sampler.getImageData(0, 0, columns * SAMPLE, rows * SAMPLE)
    cells = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const alpha = data[((y * SAMPLE + SAMPLE / 2) * columns * SAMPLE + x * SAMPLE + SAMPLE / 2) * 4 + 3] ?? 0
        if (alpha > 110) cells.push({ x, y })
      }
    }
  }
  sample()
  document.fonts.load(FONT).then(sample)

  return {
    tick({ time, pointer }) {
      const sweep = ((time * 26) % (columns + 60)) - 20
      for (const cell of cells) {
        const swept = Math.abs(cell.x + cell.y * 0.6 - sweep) < 1.5
        const near = pointer ? 1 - Math.hypot(cell.x - pointer.x, cell.y - pointer.y) / 7 : 0
        light(cell.x, cell.y, swept ? 1 : Math.max(REST, near))
      }
    },
  }
}

export function Wordmark() {
  return (
    <CellField
      start={wordmark}
      className="block h-[90px] w-full [--cell:6px] sm:h-[160px] sm:[--cell:8px] [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]"
    />
  )
}
