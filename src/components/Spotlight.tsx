import { useEffect } from 'react'

export function Spotlight() {
  useEffect(() => {
    const root = document.documentElement
    let x = innerWidth * 0.74
    let y = innerHeight * 0.3
    let frame = 0
    let wander = 0
    let lastPointer = Number.NEGATIVE_INFINITY

    const paint = () => {
      frame = 0
      root.style.setProperty('--mx', `${x}px`)
      root.style.setProperty('--my', `${y}px`)
      root.style.setProperty('--sy', `${scrollY * -0.15}px`)
      // These inline variables can land before React hydrates the element, so [data-lit] and [data-near] elements set suppressHydrationWarning.
      for (const element of document.querySelectorAll<HTMLElement>('[data-lit]')) {
        const rect = element.getBoundingClientRect()
        element.style.setProperty('--lx', `${x - rect.left}px`)
        element.style.setProperty('--ly', `${y - rect.top}px`)
      }
      for (const element of document.querySelectorAll<HTMLElement>('[data-near]')) {
        const rect = element.getBoundingClientRect()
        const distance = Math.hypot(x - rect.left - rect.width / 2, y - rect.top - rect.height / 2)
        const near = Math.max(0, 1 - distance / 130)
        element.style.setProperty('--near', near.toFixed(3))
        element.style.setProperty('--fill', near > 0.5 ? '1' : '0')
      }
    }
    const schedule = () => {
      frame ||= requestAnimationFrame(paint)
    }
    const follow = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      lastPointer = event.timeStamp
      schedule()
    }
    const drift = (time: number) => {
      if (time - lastPointer > 2500) {
        x = innerWidth * (0.5 + 0.38 * Math.sin(time / 2600))
        y = innerHeight * (0.45 + 0.3 * Math.sin(time / 1900))
        schedule()
      }
      wander = requestAnimationFrame(drift)
    }

    addEventListener('pointermove', follow, { passive: true })
    addEventListener('pointerdown', follow, { passive: true })
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    const hasNoCursor = matchMedia('(hover: none)').matches
    const prefersStill = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (hasNoCursor && !prefersStill) wander = requestAnimationFrame(drift)
    paint()

    return () => {
      removeEventListener('pointermove', follow)
      removeEventListener('pointerdown', follow)
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(wander)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none">
      <div className="dots fixed inset-0 -z-10" />
      <div className="dots dots-lit fixed inset-0 -z-10" />
      <div className="glow fixed inset-0 z-30" />
    </div>
  )
}
