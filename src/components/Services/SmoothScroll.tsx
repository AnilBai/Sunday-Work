import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: .085, smoothWheel: true, syncTouch: false, anchors: true })
    const update = () => ScrollTrigger.update()
    const tick = (time: number) => lenis.raf(time * 1000)
    lenis.on('scroll', update)
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick); lenis.off('scroll', update); lenis.destroy() }
  }, [])
  return null
}
