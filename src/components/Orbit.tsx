import { useEffect, useRef } from 'react'

const CELL = 8
const GLYPHS = '01<>/=+*#{}'
const FONT = '"JetBrains Mono Variable", monospace'
const TRAIL = 0.2
const MOONS = [
  { reach: 2.6, tilt: 0.3, rate: 0.3 },
  { reach: 4.4, tilt: 0.22, rate: 0.14 },
]

type Comet = { x: number; y: number; speedX: number; speedY: number }

const between = (low: number, high: number) => low + Math.random() * (high - low)

export function Orbit() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const pen = canvas?.getContext('2d')
    if (!canvas || !pen) return

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let columns = 0
    let rows = 0
    let heat = new Float32Array(0)
    let stars: { column: number; row: number }[] = []
    let comets: Comet[] = []
    let nextComet = 0
    let lastFrame = 0
    let frame = 0

    const light = (x: number, y: number, value: number) => {
      const column = Math.round(x)
      const row = Math.round(y)
      if (column < 0 || row < 0 || column >= columns || row >= rows) return
      const index = row * columns + column
      heat[index] = Math.max(heat[index] ?? 0, value)
    }

    const paint = (now: number) => {
      if (!still) frame = requestAnimationFrame(paint)
      const step = Math.min(0.05, (now - lastFrame) / 1000)
      const time = now / 1000
      const fade = TRAIL ** step
      lastFrame = now
      for (let index = 0; index < heat.length; index++) heat[index] = (heat[index] ?? 0) * fade

      const centerX = Math.floor(columns / 2)
      const centerY = Math.floor(rows / 2)
      const radius = Math.floor(Math.min(8, rows * 0.3)) + 0.5
      const behindPlanet = (x: number, y: number) => Math.hypot(x - centerX, y - centerY) < radius + 0.5
      for (let y = -Math.ceil(radius); y <= radius; y++) {
        for (let x = -Math.ceil(radius); x <= radius; x++) {
          const far = (x * x + y * y) / radius ** 2
          if (far > 1) continue
          const lit = (-x / radius) * 0.55 - (y / radius) * 0.45 + Math.sqrt(1 - far) * 0.6
          light(centerX + x, centerY + y, 0.16 + Math.max(0, Math.min(1, lit)) * 0.84)
        }
      }

      const moons = MOONS.map((moon, index) => {
        const angle = time * moon.rate + index * 2
        const reach = Math.min(radius * moon.reach, columns * 0.45)
        const x = Math.round(centerX + Math.cos(angle) * reach)
        const y = Math.round(centerY + Math.sin(angle) * reach * moon.tilt)
        return { x, y, hidden: Math.sin(angle) < 0 && behindPlanet(x, y) }
      })

      if (!still && time > nextComet) {
        nextComet = time + between(1.2, 2.6)
        comets.push({ x: between(-10, columns * 0.6), y: -1, speedX: between(14, 22), speedY: between(5, 9) })
      }
      comets = comets.filter((comet) => comet.x > -12 && comet.x < columns + 2 && comet.y > -3 && comet.y < rows + 2)
      for (const comet of comets) {
        comet.x += comet.speedX * step
        comet.y += comet.speedY * step
        if (!behindPlanet(comet.x, comet.y)) light(comet.x, comet.y, 1)
      }

      const width = columns * CELL
      const height = rows * CELL
      pen.clearRect(0, 0, width, height)
      pen.fillStyle = getComputedStyle(canvas).color
      pen.globalAlpha = 0.05
      for (let column = 0; column <= columns; column++) pen.fillRect(column * CELL, 0, 1, height)
      for (let row = 0; row <= rows; row++) pen.fillRect(0, row * CELL, width, 1)
      pen.globalAlpha = 0.5
      for (const star of stars) {
        if ((heat[star.row * columns + star.column] ?? 0) < 0.05) pen.fillRect(star.column * CELL + 2, star.row * CELL + 3, 4, 1)
      }
      heat.forEach((value, index) => {
        if (value < 0.05) return
        pen.globalAlpha = Math.min(1, value)
        pen.fillRect((index % columns) * CELL + 1, Math.floor(index / columns) * CELL + 1, CELL - 1, CELL - 1)
      })
      pen.globalCompositeOperation = 'destination-out'
      pen.globalAlpha = 0.7
      heat.forEach((value, index) => {
        if (value < 0.6) return
        const column = index % columns
        const row = Math.floor(index / columns)
        const glyph = GLYPHS[(column * 7 + row * 13) % GLYPHS.length] ?? ''
        pen.fillText(glyph, column * CELL + CELL / 2 + 0.5, row * CELL + CELL / 2 + 1)
      })
      pen.globalCompositeOperation = 'source-over'
      pen.globalAlpha = 1
      for (const moon of moons) {
        if (moon.hidden) continue
        pen.clearRect(moon.x * CELL, moon.y * CELL, CELL * 2 + 1, CELL * 2 + 1)
        pen.fillRect(moon.x * CELL + 1, moon.y * CELL + 1, CELL * 2 - 1, CELL * 2 - 1)
      }
    }

    const layout = () => {
      const ratio = Math.min(devicePixelRatio, 2)
      canvas.width = canvas.clientWidth * ratio
      canvas.height = canvas.clientHeight * ratio
      pen.setTransform(ratio, 0, 0, ratio, 0, 0)
      pen.font = `700 ${CELL - 1}px ${FONT}`
      pen.textAlign = 'center'
      pen.textBaseline = 'middle'
      columns = Math.ceil(canvas.clientWidth / CELL)
      rows = Math.ceil(canvas.clientHeight / CELL)
      heat = new Float32Array(columns * rows)
      comets = []
      stars = Array.from({ length: Math.round(columns / 3) }, () => ({
        column: Math.floor(between(0, columns)),
        row: Math.floor(between(0, rows)),
      }))
      if (still) paint(performance.now())
    }

    const launch = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      comets.push({
        x: (event.clientX - rect.left) / CELL,
        y: (event.clientY - rect.top) / CELL,
        speedX: between(16, 24) * (Math.random() < 0.5 ? -1 : 1),
        speedY: between(-6, 6),
      })
    }

    const resizes = new ResizeObserver(layout)
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      if (entry?.isIntersecting && !still) frame = requestAnimationFrame(paint)
    })
    resizes.observe(canvas)
    visibility.observe(canvas)
    canvas.addEventListener('pointerdown', launch)

    return () => {
      resizes.disconnect()
      visibility.disconnect()
      cancelAnimationFrame(frame)
      canvas.removeEventListener('pointerdown', launch)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="block h-[152px] w-full cursor-crosshair [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] sm:h-[208px]"
    />
  )
}
