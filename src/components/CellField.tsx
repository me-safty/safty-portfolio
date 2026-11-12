import { useEffect, useRef } from 'react'

const LEGIBLE = 6
const GLYPHS = '01<>/=+*#{}'
const FONT = '"JetBrains Mono Variable", monospace'
const TRAIL = 0.2

export type Point = { x: number; y: number }
export type Grid = {
  columns: number
  rows: number
  cell: number
  still: boolean
  light: (x: number, y: number, value: number) => void
}
export type Scene = {
  tick: (frame: { step: number; time: number; pointer: Point | undefined }) => void
  trail?: number
  press?: (at: Point) => void
  under?: (pen: CanvasRenderingContext2D) => void
  over?: (pen: CanvasRenderingContext2D) => void
}

export function CellField({ start, className }: { start: (grid: Grid) => Scene; className: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const pen = canvas?.getContext('2d')
    if (!canvas || !pen) return

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let cell = 8
    let columns = 0
    let rows = 0
    let heat = new Float32Array(0)
    let scene: Scene | undefined
    let pointer: Point | undefined
    let lastFrame = 0
    let clock = 0
    let frame = 0

    const light = (x: number, y: number, value: number) => {
      const column = Math.round(x)
      const row = Math.round(y)
      if (column < 0 || row < 0 || column >= columns || row >= rows) return
      const index = row * columns + column
      heat[index] = Math.max(heat[index] ?? 0, value)
    }

    const paint = (now: number) => {
      frame = requestAnimationFrame(paint)
      if (!scene) return
      const style = getComputedStyle(canvas)
      const step = Math.min(0.05, (now - lastFrame) / 1000)
      const fade = (scene.trail ?? TRAIL) ** step
      lastFrame = now
      clock = still || style.getPropertyValue('--play').trim() === '0' ? 0 : clock + step
      for (let index = 0; index < heat.length; index++) heat[index] = (heat[index] ?? 0) * fade
      scene.tick({ step, time: clock, pointer })

      const width = columns * cell
      const height = rows * cell
      pen.clearRect(0, 0, width, height)
      pen.fillStyle = style.color
      pen.globalAlpha = 0.05
      for (let column = 0; column <= columns; column++) pen.fillRect(column * cell, 0, 1, height)
      for (let row = 0; row <= rows; row++) pen.fillRect(0, row * cell, width, 1)
      pen.globalAlpha = 0.5
      scene.under?.(pen)
      heat.forEach((value, index) => {
        if (value < 0.05) return
        pen.globalAlpha = Math.min(1, value)
        pen.fillRect((index % columns) * cell + 1, Math.floor(index / columns) * cell + 1, cell - 1, cell - 1)
      })
      pen.globalCompositeOperation = 'destination-out'
      pen.globalAlpha = 0.7
      heat.forEach((value, index) => {
        if (value < 0.6 || cell < LEGIBLE) return
        const column = index % columns
        const row = Math.floor(index / columns)
        const glyph = GLYPHS[(column * 7 + row * 13) % GLYPHS.length] ?? ''
        pen.fillText(glyph, column * cell + cell / 2 + 0.5, row * cell + cell / 2 + 1)
      })
      pen.globalCompositeOperation = 'source-over'
      pen.globalAlpha = 1
      scene.over?.(pen)
    }

    const layout = () => {
      const ratio = Math.min(devicePixelRatio, 2)
      canvas.width = canvas.clientWidth * ratio
      canvas.height = canvas.clientHeight * ratio
      pen.setTransform(ratio, 0, 0, ratio, 0, 0)
      cell = Number.parseFloat(getComputedStyle(canvas).getPropertyValue('--cell')) || 8
      pen.font = `700 ${cell - 1}px ${FONT}`
      pen.textAlign = 'center'
      pen.textBaseline = 'middle'
      columns = Math.ceil(canvas.clientWidth / cell)
      rows = Math.ceil(canvas.clientHeight / cell)
      heat = new Float32Array(columns * rows)
      scene = start({ columns, rows, cell, still, light })
    }

    const locate = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: (event.clientX - rect.left) / cell, y: (event.clientY - rect.top) / cell }
    }
    const move = (event: PointerEvent) => {
      pointer = locate(event)
    }
    const press = (event: PointerEvent) => {
      pointer = locate(event)
      scene?.press?.(pointer)
    }
    const release = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') pointer = undefined
    }
    const leave = () => {
      pointer = undefined
    }

    const resizes = new ResizeObserver(layout)
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      if (entry?.isIntersecting) frame = requestAnimationFrame(paint)
    })
    resizes.observe(canvas)
    visibility.observe(canvas)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerdown', press)
    canvas.addEventListener('pointerup', release)
    canvas.addEventListener('pointercancel', leave)
    canvas.addEventListener('pointerleave', leave)

    return () => {
      resizes.disconnect()
      visibility.disconnect()
      cancelAnimationFrame(frame)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', press)
      canvas.removeEventListener('pointerup', release)
      canvas.removeEventListener('pointercancel', leave)
      canvas.removeEventListener('pointerleave', leave)
    }
  }, [start])

  return <canvas ref={ref} aria-hidden className={className} />
}
