import { AnimatePresence, motion } from 'motion/react'
import type { Screen } from '../content/projects'

export function Device({ screen, className = '' }: { screen: Screen; className?: string }) {
  return (
    <div
      data-shape={screen.shape}
      className={`device relative bg-[#1c1c1c] shadow-[0_0_0_1px_rgb(255_255_255/0.16),0_40px_80px_-30px_rgb(0_0_0/0.9)] ${className}`}
    >
      <div className="device-screen flex h-full flex-col overflow-hidden bg-black">
        {screen.shape === 'browser' && (
          <div className="flex items-center gap-[0.35em] bg-[#e9e9e6] px-[0.7em] py-[0.45em]">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="size-[0.5em] rounded-full bg-black/20" />
            ))}
            <span className="ml-[0.6em] h-[0.9em] flex-1 rounded-full bg-black/8" />
          </div>
        )}
        <div className="relative min-h-0 flex-1">
          <AnimatePresence initial={false}>
            <motion.img
              key={screen.src}
              src={screen.src}
              alt={screen.alt}
              className="absolute inset-0 size-full object-cover object-top"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
