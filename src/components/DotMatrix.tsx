import { useEffect, useRef } from 'react'

const ROWS = 27
const SAMPLE = 6
const REACH = 95
const SCENE_MS = 2600
const RIPPLE_MS = 900
const FONT = '"Instrument Sans Variable", sans-serif'

type Pen = CanvasRenderingContext2D
type Scenes = [Scene, ...Scene[]]
type Scene = { word: string; width: number; draw: (pen: Pen, x: number, middle: number) => void }
type Dot = {
  column: number
  row: number
  homeX: number
  homeY: number
  x: number
  y: number
  speedX: number
  speedY: number
  value: number
  target: number
  start: number
}

// Glyphs are drawn in grid cells: one unit is one dot.
export const heroScenes: Scenes = [
  {
    word: 'MOBILE',
    width: 11,
    draw(pen, x, middle) {
      pen.beginPath()
      pen.roundRect(x + 1, middle - 8.5, 9, 17, 2)
      pen.stroke()
      pen.fillRect(x + 4, middle + 5.3, 3, 1.2)
    },
  },
  {
    word: 'WEB',
    width: 21,
    draw(pen, x, middle) {
      pen.beginPath()
      pen.roundRect(x + 0.5, middle - 7.5, 20, 15, 1.5)
      pen.stroke()
      pen.fillRect(x + 0.5, middle - 4, 20, 1.2)
      pen.fillRect(x + 4, middle, 8, 1.2)
      pen.fillRect(x + 4, middle + 3, 12, 1.2)
    },
  },
  {
    word: 'AI',
    width: 19,
    draw(pen, x, middle) {
      const center = x + 9.5
      pen.beginPath()
      pen.moveTo(center, middle - 9.5)
      pen.quadraticCurveTo(center + 1.5, middle - 1.5, center + 9.5, middle)
      pen.quadraticCurveTo(center + 1.5, middle + 1.5, center, middle + 9.5)
      pen.quadraticCurveTo(center - 1.5, middle + 1.5, center - 9.5, middle)
      pen.quadraticCurveTo(center - 1.5, middle - 1.5, center, middle - 9.5)
      pen.fill()
    },
  },
  {
    word: 'SHIPPED',
    width: 17,
    draw(pen, x, middle) {
      pen.lineWidth = 2.4
      pen.beginPath()
      pen.moveTo(x + 1.5, middle + 0.5)
      pen.lineTo(x + 6.5, middle + 5.5)
      pen.lineTo(x + 15.5, middle - 6)
      pen.stroke()
    },
  },
]

export const contactScenes: Scenes = [
  {
    word: 'SAY HI',
    width: 21,
    draw(pen, x, middle) {
      pen.beginPath()
      pen.roundRect(x + 0.5, middle - 7, 20, 14, 1.5)
      pen.moveTo(x + 1.5, middle - 6)
      pen.lineTo(x + 10.5, middle + 1)
      pen.lineTo(x + 19.5, middle - 6)
      pen.stroke()
    },
  },
  {
    word: 'REMOTE',
    width: 19,
    draw(pen, x, middle) {
      pen.beginPath()
      pen.arc(x + 9.5, middle, 9, 0, Math.PI * 2)
      pen.ellipse(x + 9.5, middle, 4, 9, 0, 0, Math.PI * 2)
      pen.moveTo(x + 0.5, middle)
      pen.lineTo(x + 18.5, middle)
      pen.stroke()
    },
  },
  {
    word: 'EMAIL ME',
    width: 20,
    draw(pen, x, middle) {
      pen.beginPath()
      pen.moveTo(x + 1, middle - 1)
      pen.lineTo(x + 19, middle - 8)
      pen.lineTo(x + 12, middle + 8)
      pen.lineTo(x + 9, middle + 1.5)
      pen.closePath()
      pen.moveTo(x + 9, middle + 1.5)
      pen.lineTo(x + 19, middle - 8)
      pen.stroke()
    },
  },
]

export function DotMatrix({ scenes }: { scenes: Scenes }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const pen = canvas?.getContext('2d')
    const sampler = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    if (!canvas || !pen || !sampler) return

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const away = { x: -9999, y: -9999 }
    let dots: Dot[] = []
    let ripples: { x: number; y: number; start: number }[] = []
    let gap = 0
    let columns = 0
    let sceneIndex = 0
    let sceneStart = 0
    let pointer = away
    let lastPointer = away
    let lastFrame = 0
    let frame = 0

    const show = () => {
      if (!columns) return
      const scene = scenes[sceneIndex % scenes.length] ?? scenes[0]
      const middle = ROWS / 2
      const space = 5
      sampler.setTransform(SAMPLE, 0, 0, SAMPLE, 0, 0)
      sampler.clearRect(0, 0, columns, ROWS)
      sampler.fillStyle = sampler.strokeStyle = '#fff'
      sampler.lineWidth = 1.3
      sampler.lineJoin = sampler.lineCap = 'round'
      sampler.textBaseline = 'middle'
      sampler.font = `700 13px ${FONT}`
      const fit = (columns * 0.84) / (scene.width + space + sampler.measureText(scene.word).width)
      if (fit < 1) sampler.font = `700 ${13 * fit}px ${FONT}`
      const x = Math.round((columns - scene.width - space - sampler.measureText(scene.word).width) / 2)
      scene.draw(sampler, x, middle)
      sampler.fillText(scene.word, x + scene.width + space, middle + 0.8)

      const { data } = sampler.getImageData(0, 0, columns * SAMPLE, ROWS * SAMPLE)
      const centre = SAMPLE / 2
      sceneStart = performance.now()
      for (const dot of dots) {
        const alpha = data[((dot.row * SAMPLE + centre) * columns * SAMPLE + dot.column * SAMPLE + centre) * 4 + 3] ?? 0
        dot.target = alpha > 110 ? 1 : 0
        dot.start = still ? 0 : sceneStart + dot.column * 9 + Math.random() * 170
      }
    }

    const layout = () => {
      const ratio = Math.min(devicePixelRatio, 2)
      const { clientWidth, clientHeight } = canvas
      canvas.width = clientWidth * ratio
      canvas.height = clientHeight * ratio
      pen.setTransform(ratio, 0, 0, ratio, 0, 0)
      gap = clientHeight / ROWS
      columns = Math.floor(clientWidth / gap)
      sampler.canvas.width = columns * SAMPLE
      sampler.canvas.height = ROWS * SAMPLE
      const left = (clientWidth - (columns - 1) * gap) / 2
      dots = Array.from({ length: columns * ROWS }, (_, index) => {
        const column = index % columns
        const row = Math.floor(index / columns)
        return {
          column,
          row,
          homeX: left + column * gap,
          homeY: gap / 2 + row * gap,
          x: 0,
          y: 0,
          speedX: 0,
          speedY: 0,
          value: 0,
          target: 0,
          start: 0,
        }
      })
      show()
    }

    const paint = (now: number) => {
      frame = requestAnimationFrame(paint)
      const step = Math.min(2, (now - lastFrame) / 16.7)
      lastFrame = now
      if (!still && now - sceneStart > SCENE_MS) {
        sceneIndex++
        show()
      }

      const rect = canvas.getBoundingClientRect()
      const pointerX = pointer.x - rect.left
      const pointerY = pointer.y - rect.top
      const dragX = Math.max(-40, Math.min(40, pointer.x - lastPointer.x))
      const dragY = Math.max(-40, Math.min(40, pointer.y - lastPointer.y))
      lastPointer = pointer
      ripples = ripples.filter((ripple) => now - ripple.start < RIPPLE_MS)
      const damping = 0.86 ** step

      pen.clearRect(0, 0, rect.width, rect.height)
      pen.fillStyle = getComputedStyle(canvas).color
      for (const dot of dots) {
        if (now >= dot.start) dot.value += (dot.target - dot.value) * (still ? 1 : Math.min(1, 0.16 * step))

        const fromX = dot.homeX + dot.x - pointerX
        const fromY = dot.homeY + dot.y - pointerY
        const distance = Math.hypot(fromX, fromY) || 1
        const near = Math.max(0, 1 - distance / REACH)
        let forceX = -dot.x * 0.07
        let forceY = -dot.y * 0.07
        let flash = 0
        if (!still) {
          const push = near * near
          forceX += (fromX / distance) * push * 1.8 + dragX * push * 0.05
          forceY += (fromY / distance) * push * 1.8 + dragY * push * 0.05
          for (const ripple of ripples) {
            const age = now - ripple.start
            const awayX = dot.homeX - ripple.x
            const awayY = dot.homeY - ripple.y
            const radius = Math.hypot(awayX, awayY) || 1
            const hit = Math.max(0, 1 - Math.abs(radius - age * 0.45) / 28) * (1 - age / RIPPLE_MS)
            forceX += (awayX / radius) * hit * 1.6
            forceY += (awayY / radius) * hit * 1.6
            flash += hit
          }
        }
        dot.speedX = (dot.speedX + forceX * step) * damping
        dot.speedY = (dot.speedY + forceY * step) * damping
        dot.x += dot.speedX * step
        dot.y += dot.speedY * step

        pen.globalAlpha = Math.min(1, 0.13 + dot.value * 0.77 + near * 0.45 + flash * 0.6)
        pen.beginPath()
        pen.arc(
          dot.homeX + dot.x,
          dot.homeY + dot.y,
          gap * (0.13 + dot.value * 0.13 + near * 0.1 + flash * 0.1),
          0,
          Math.PI * 2,
        )
        pen.fill()
      }
    }

    const track = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
    }
    const release = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') pointer = away
    }
    const leave = () => {
      pointer = away
    }
    const ripple = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      ripples.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, start: event.timeStamp })
    }

    const resizes = new ResizeObserver(layout)
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      if (entry?.isIntersecting) frame = requestAnimationFrame(paint)
    })
    resizes.observe(canvas)
    visibility.observe(canvas)
    document.fonts.load(`700 13px ${FONT}`).then(show)
    addEventListener('pointermove', track, { passive: true })
    addEventListener('pointerdown', track, { passive: true })
    addEventListener('pointerup', release)
    addEventListener('pointercancel', release)
    document.documentElement.addEventListener('pointerleave', leave)
    canvas.addEventListener('pointerdown', ripple)

    return () => {
      resizes.disconnect()
      visibility.disconnect()
      cancelAnimationFrame(frame)
      removeEventListener('pointermove', track)
      removeEventListener('pointerdown', track)
      removeEventListener('pointerup', release)
      removeEventListener('pointercancel', release)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [scenes])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="block h-[150px] w-full [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] sm:h-[264px]"
    />
  )
}
