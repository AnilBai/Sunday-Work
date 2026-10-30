import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const touch = matchMedia('(pointer: coarse)').matches
    let frame = 0
    const update = () => ScrollTrigger.update()
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => { frame = 0; update() })
    }
    // Native touch scrolling preserves platform inertia and sticky positioning.
    // Explicit native events also cover momentum scrolls and reduced-motion mode.
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('touchmove', schedule, { passive: true })
    window.addEventListener('touchend', schedule, { passive: true })
    const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh())
    window.addEventListener('orientationchange', refresh)
    const lenis = !touch && !reduced ? new Lenis({
      lerp: .085, smoothWheel: true, syncTouch: false, anchors: true,
      prevent: node => !!node.closest('dialog'),
    }) : null
    let lastScroll = window.scrollY
    const tick = (time: number) => {
      lenis?.raf(time * 1000)
      // Mobile Safari can scroll on the compositor before delivering scroll events.
      // Read its native position on the same ticker that paints GSAP animations.
      if (touch && window.scrollY !== lastScroll) {
        lastScroll = window.scrollY
        update()
      }
    }
    lenis?.on('scroll', update)
    if (lenis || touch) gsap.ticker.add(tick)
    ScrollTrigger.refresh()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('touchmove', schedule)
      window.removeEventListener('touchend', schedule)
      window.removeEventListener('orientationchange', refresh)
      gsap.ticker.remove(tick)
      if (lenis) { lenis.off('scroll', update); lenis.destroy() }
    }
  }, [])
  return null
}
