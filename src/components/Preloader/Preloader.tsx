import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import './Preloader.css'

const TITLE = 'Sunday &'
const WORDS = ['Company', 'Brand', 'Product', 'Development', 'Growth', 'Intelligence']

type PreloaderProps = { onComplete: () => void }

export default function Preloader({ onComplete }: PreloaderProps) {
  const overlay = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    let disposed = false
    let resizeObserver: ResizeObserver | undefined
    const context = gsap.context(() => {}, overlay)

    void document.fonts.ready.then(() => {
      if (disposed) return
      context.add(() => {
        const root = overlay.current!
        const label = root.querySelector<HTMLElement>('.sunday-preloader__label')!
        const slot = root.querySelector<HTMLElement>('.sunday-preloader__slot')!
        const words = gsap.utils.toArray<HTMLElement>('.sunday-preloader__word', root)
        const timeline = gsap.timeline({ onComplete })
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const position = { remaining: reducedMotion ? 0 : 1 }
        gsap.set(label, { x: 0 })
        const setX = gsap.quickSetter(label, 'x', 'px')
        const alignLabel = () => {
          // Center the name first; reveal Company by moving the name left into a centered pair.
          const centerCorrection = (slot.offsetWidth - words[0].offsetWidth) / 2
          const gap = parseFloat(getComputedStyle(label).gap)
          const revealDistance = (words[0].offsetWidth + gap) / 2
          setX(centerCorrection + revealDistance * position.remaining)
        }
        alignLabel()
        resizeObserver = new ResizeObserver(alignLabel)
        resizeObserver.observe(root)
        resizeObserver.observe(label)
        if (reducedMotion) {
          timeline.set('.sunday-preloader__letter', { opacity: 1, scale: 1 })
            .set(words[0], { opacity: 1, yPercent: 0 })
            .to(root, { opacity: 0, duration: .15 }, .4)
          return
        }

        // Finish the letter landing before the name makes room for its companion.
        timeline.fromTo('.sunday-preloader__letter',
          { opacity: 0, scale: 10, yPercent: -16 },
          { opacity: 1, scale: 1, yPercent: 0, duration: .75, stagger: .055, ease: 'power4.out' }, .12)
          .to(position, { remaining: 0, duration: .6, ease: 'power3.inOut', onUpdate: alignLabel }, 1.34)

        words.forEach((word, index) => {
          const start = 1.5 + index * .54
          timeline.fromTo(word,
            { opacity: 0, yPercent: 75, filter: 'blur(4px)' },
            { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: .32, ease: 'power3.out' }, start)
          if (index < words.length - 1) {
            timeline.to(word, { opacity: 0, yPercent: -65, filter: 'blur(4px)', duration: .2, ease: 'power2.in' }, start + .43)
          }
        })
        timeline.to(label, { opacity: 0, y: -12, duration: .38, ease: 'power2.in' }, '+=.3')
          .to(root, { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '<.08')
      })
    })
    return () => {
      disposed = true
      resizeObserver?.disconnect()
      context.revert()
      document.body.style.overflow = previousOverflow
    }
  }, [onComplete])

  return <div className="sunday-preloader" ref={overlay} role="status" aria-label="Loading Sunday & Company">
    <div className="sunday-preloader__label" aria-hidden="true">
      <span className="sunday-preloader__brand">
        {TITLE.split('').map((letter, index) => <span className="sunday-preloader__letter" key={index}>
          {letter === ' ' ? '\u00a0' : letter}
        </span>)}
      </span>
      <span className="sunday-preloader__slot">
        {WORDS.map((word, index) => <span className="sunday-preloader__word" key={`${word}-${index}`}>{word}</span>)}
        <span className="sunday-preloader__measure">
          {[...new Set(WORDS)].map(word => <span key={word}>{word}</span>)}
        </span>
      </span>
    </div>
  </div>
}
