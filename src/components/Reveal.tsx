import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { type GlyphName, SectionGlyph } from './Tiles'

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.1, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SectionLabel({ children, glyph }: { children: ReactNode; glyph?: GlyphName }) {
  return (
    <h2 className="flex items-center gap-2.5 text-sm text-dim">
      {glyph && <SectionGlyph name={glyph} />}
      {children}
    </h2>
  )
}
