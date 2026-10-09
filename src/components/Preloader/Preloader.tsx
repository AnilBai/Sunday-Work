import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import './Preloader.css'

const TITLE = 'Sunday'
const WORDS = ['', 'work', 'Brand', 'Product', 'Development', 'Growth', 'Intelligence']

type PreloaderProps = { onComplete: () => void }

export default function Preloader({ onComplete }: PreloaderProps) {
  const overlay = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)

  useLayoutEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete })
      if (reducedMotion) {
        timeline.set('.sunday-preloader__letter', { opacity: 1, scale: 1 })
          .to(overlay.current, { opacity: 0, duration: .2 })
        return
      }
      timeline.fromTo('.sunday-preloader__letter',
        { opacity: 0, scale: 10 },
        { opacity: 1, scale: 1, duration: .7, stagger: .09, ease: 'power3.out' }, .3)
        .to({}, { duration: .12 })
      WORDS.slice(1).forEach((_, index) => {
        timeline.call(() => setStep(index + 1)).to({}, { duration: .65 })
      })
      timeline.to({}, { duration: .2 })
        .to('.sunday-preloader__label', { filter: 'blur(5px)', duration: .8 }, 'exit')
        .to(overlay.current, { yPercent: -100, duration: 1.15, ease: 'power4.inOut' }, 'exit')
    }, overlay)
    return () => {
      context.revert()
      document.body.style.overflow = previousOverflow
    }
  }, [onComplete])

  return (
    <div className="sunday-preloader" ref={overlay} role="status" aria-label="Loading Sunday">
      <div className="sunday-preloader__label" aria-hidden="true">
        <span className="sunday-preloader__brand">
          {TITLE.split('').map((letter, index) => <span className="sunday-preloader__letter" key={index}>{letter}</span>)}
          <sup className="sunday-preloader__letter">{'\u2122'}</sup>
        </span>
        <span className="sunday-preloader__slot">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={step}
              initial={{ opacity: 0, y: 11, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -11, filter: 'blur(5px)' }}
              transition={{ duration: .18, ease: [.22, 1, .36, 1] }}>
              <span className="sunday-preloader__text">{WORDS[step]}</span>
            </motion.span>
          </AnimatePresence>
          <span className="sunday-preloader__measure">
            {WORDS.slice(1).map(word => <span key={word}>{word}</span>)}
          </span>
        </span>
      </div>
    </div>
  )
}
