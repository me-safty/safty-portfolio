import { CellField, type Grid, type Scene } from './CellField'

const MOONS = [
  { reach: 2.6, tilt: 0.3, rate: 0.3 },
  { reach: 4.4, tilt: 0.22, rate: 0.14 },
]

type Comet = { x: number; y: number; speedX: number; speedY: number }

const between = (low: number, high: number) => low + Math.random() * (high - low)

function orbit({ columns, rows, cell, light }: Grid): Scene {
  const centerX = Math.floor(columns / 2)
  const centerY = Math.floor(rows / 2)
  const radius = Math.floor(Math.min(8, rows * 0.3)) + 0.5
  const behindPlanet = (x: number, y: number) => Math.hypot(x - centerX, y - centerY) < radius + 0.5
  const stars = Array.from({ length: Math.round(columns / 3) }, () => ({
    x: Math.floor(between(0, columns)),
    y: Math.floor(between(0, rows)),
  })).filter((star) => !behindPlanet(star.x, star.y))
  let moons: { x: number; y: number }[] = []
  let comets: Comet[] = []
  let nextComet = 0

  return {
    tick({ step, time }) {
      for (let y = -Math.ceil(radius); y <= radius; y++) {
        for (let x = -Math.ceil(radius); x <= radius; x++) {
          const far = (x * x + y * y) / radius ** 2
          if (far > 1) continue
          const lit = (-x / radius) * 0.55 - (y / radius) * 0.45 + Math.sqrt(1 - far) * 0.6
          light(centerX + x, centerY + y, 0.16 + Math.max(0, Math.min(1, lit)) * 0.84)
        }
      }

      moons = MOONS.flatMap((moon, index) => {
        const angle = time * moon.rate + index * 2
        const reach = Math.min(radius * moon.reach, columns * 0.45)
        const x = Math.round(centerX + Math.cos(angle) * reach)
        const y = Math.round(centerY + Math.sin(angle) * reach * moon.tilt)
        return Math.sin(angle) < 0 && behindPlanet(x, y) ? [] : [{ x, y }]
      })

      if (time > nextComet) {
        nextComet = time + between(1.2, 2.6)
        comets.push({ x: between(-10, columns * 0.6), y: -1, speedX: between(14, 22), speedY: between(5, 9) })
      }
      comets = comets.filter((comet) => comet.x > -12 && comet.x < columns + 2 && comet.y > -3 && comet.y < rows + 2)
      for (const comet of comets) {
        comet.x += comet.speedX * step
        comet.y += comet.speedY * step
        if (!behindPlanet(comet.x, comet.y)) light(comet.x, comet.y, 1)
      }
    },
    press(at) {
      comets.push({ ...at, speedX: between(16, 24) * (Math.random() < 0.5 ? -1 : 1), speedY: between(-6, 6) })
    },
    under(pen) {
      for (const star of stars) pen.fillRect(star.x * cell + 2, star.y * cell + 3, 4, 1)
    },
    over(pen) {
      for (const moon of moons) {
        pen.clearRect(moon.x * cell, moon.y * cell, cell * 2 + 1, cell * 2 + 1)
        pen.fillRect(moon.x * cell + 1, moon.y * cell + 1, cell * 2 - 1, cell * 2 - 1)
      }
    },
  }
}

export function Orbit() {
  return (
    <CellField
      start={orbit}
      className="block h-[152px] w-full cursor-crosshair [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] sm:h-[208px]"
    />
  )
}
