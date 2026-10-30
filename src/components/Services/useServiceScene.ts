import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** A shared viewport layer avoids visible colour seams at section boundaries. */
export function useServiceScene(section: RefObject<HTMLElement | null>, backdrop: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const root = section.current
    const layer = backdrop.current
    if (!root || !layer) return
    document.body.classList.add('sunday-scroll-theme')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const theme = { light: 0 }
    const paint = () => {
      layer.style.opacity = String(theme.light)
      document.body.style.setProperty('--sunday-scroll-ink', gsap.utils.interpolate('#fff', '#0f0e0e', theme.light))
    }
    const fade = gsap.quickTo(theme, 'light', { duration: reduced ? 0 : .85, ease: 'power2.out', onUpdate: paint })
    const update = () => {
      const box = root.getBoundingClientRect()
      const enter = gsap.utils.clamp(0, 1, (innerHeight * .9 - box.top) / (innerHeight * .5))
      const leave = gsap.utils.clamp(0, 1, (box.bottom - innerHeight * .45) / (innerHeight * .5))
      fade(Math.min(enter, leave))
    }
    const trigger = ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onUpdate: update, onRefresh: update })
    update()
    return () => {
      trigger.kill()
      fade.tween.kill()
      document.body.classList.remove('sunday-scroll-theme')
      document.body.style.removeProperty('--sunday-scroll-ink')
    }
  }, [section, backdrop])
}
