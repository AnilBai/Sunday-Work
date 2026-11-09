import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import './WorkTogether.css'

gsap.registerPlugin(ScrollTrigger)

const collage = [
  'e0LAGcGE4nkhyHBpdtiWjTlfc8.png',
  'uTMpgfqdqyzGJrPIR55FV0pbqI.jpg',
  'YM4vbK7504gqynWVsNUdp6nG84.png',
]

export default function WorkTogether() {
  const section = useRef<HTMLElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = section.current
    const layer = backdrop.current
    if (!root || !layer) return

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const touch = matchMedia('(pointer: coarse)').matches
    const fade = gsap.quickTo(layer, 'opacity', { duration: .85, ease: 'power2.out' })
    const updateTone = () => {
      const { top, bottom } = root.getBoundingClientRect()
      const enter = (innerHeight * .85 - top) / (innerHeight * .65)
      const leave = bottom / (innerHeight * .8)
      const tone = gsap.utils.clamp(0, 1, Math.min(enter, leave))
      const easedTone = tone * tone * (3 - 2 * tone)
      if (reduced || touch) layer.style.opacity = String(easedTone)
      else fade(easedTone)
    }
    const theme = ScrollTrigger.create({
      trigger: root, start: 'top bottom', end: 'bottom top',
      onUpdate: updateTone, onRefresh: updateTone, onToggle: updateTone,
    })
    updateTone()

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const collage = root.querySelector('.work-together-collage')!
      const title = root.querySelector('h2')

      const [left, center, right] = Array.from(collage.children) as HTMLImageElement[]
      const sides = [left, right]
      const centerX = (image: HTMLImageElement) => image.offsetLeft + image.offsetWidth / 2
      const centerY = (image: HTMLImageElement) => image.offsetTop + image.offsetHeight / 2
      const stacked = {
        x: (index: number) => centerX(center) - centerX(sides[index]),
        y: (index: number) => centerY(center) - centerY(sides[index]),
        rotation: 0,
        scale: .85,
        opacity: 0,
      }

      const spread = { x: 0, y: 0, rotation: (index: number) => index === 0 ? -14 : 14, scale: 1, opacity: 1 }
      const scene = gsap.timeline({
        scrollTrigger: {
          trigger: collage, endTrigger: root, start: 'top bottom', end: 'bottom top',
          scrub: touch ? .35 : .85, invalidateOnRefresh: true,
        },
      })
      scene
        .fromTo(sides, stacked, { ...spread, duration: .35, ease: 'sine.inOut' }, 0)
        .fromTo(center, { scale: .94 }, { scale: 1, duration: .35, ease: 'sine.inOut' }, 0)
        .to(sides, { ...stacked, duration: .35, ease: 'sine.inOut' }, .65)
        .to(center, { scale: .94, duration: .35, ease: 'sine.inOut' }, .65)
      gsap.from(title, {
        y: 44, opacity: .35, ease: 'none',
        scrollTrigger: { trigger: title, start: 'top 95%', end: 'center 60%', scrub: true },
      })
    })
    return () => {
      theme.kill()
      fade.tween.kill()
      media.revert()
    }
  }, [])

  return (
    <section ref={section} className="work-together" aria-labelledby="work-together-title">
      <div className="work-together-collage" aria-hidden="true">
        {collage.map((image, index) => (
          <img key={image} src={`https://framerusercontent.com/images/${image}?width=${index === 1 ? 800 : 500}`} alt="" loading="lazy" decoding="async" />
        ))}
      </div>
      <h2 id="work-together-title">Let’s Work<br />Together</h2>
      <Link className="work-together-link" to="/contact">
        Get started today
      </Link>
      {createPortal(<div ref={backdrop} className="work-together-backdrop" aria-hidden="true" />, document.body)}
    </section>
  )
}
