'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'

// Skip the transition on the very first load so content is never hidden before hydration.
let firstLoad = true

/** Page transition: a short cross-fade with an 8px rise on route changes (calm tier). */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  const animate = !firstLoad
  useEffect(() => {
    firstLoad = false
  }, [])
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: reduce ? 0 : 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
