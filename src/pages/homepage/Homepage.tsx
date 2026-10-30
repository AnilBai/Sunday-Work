import { Link } from 'react-router-dom'
import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Homepage.css'
import Services from '../../components/Services/Services'

gsap.registerPlugin(ScrollTrigger)

const reel = 'https://framerusercontent.com/assets/4hs3vWTiVw3QBxfwJfcc0ljer4.mp4'

function StretchWordmark() {
  const surface = useRef<SVGSVGElement>(null)
  const measure = useRef<SVGTextElement>(null)
  const letters = useRef<(SVGTextElement | null)[]>([])
  useLayoutEffect(() => {
    const svg = surface.current
    const sample = measure.current
    if (!svg || !sample) return
    let frame = 0
    let disposed = false
    let width = 1, height = 1, cap = 72, reach = 1, horizontalScale = 1, verticalScale = 1
    let positions: { x: number; center: number; sourceCenter: number; halfWidth: number }[] = []
    const springs = Array.from({ length: 6 }, () => ({ value: 0, velocity: 0 }))
    const pointer = { x: -1e6, y: -1e6, time: -1e6, pressed: false }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
    const falloff = (distance: number, radius: number) => {
      const t = clamp(1 - distance / Math.max(1, radius), 0, 1)
      return t * t * (3 - 2 * t)
    }
    const resize = () => {
      width = svg.clientWidth
      height = svg.clientHeight
      if (!width || !height) return
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      const total = sample.getComputedTextLength()
      if (!total) return
      const canvas = document.createElement('canvas').getContext('2d')
      if (canvas) {
        canvas.font = `400 100px ${getComputedStyle(svg).fontFamily}`
        cap = canvas.measureText('SUNDAY').actualBoundingBoxAscent || 72
      }
      // Keep the reference font’s natural proportions in both directions.
      const fittedScale = Math.min(width / total, height / (cap * 1.51))
      horizontalScale = fittedScale
      verticalScale = fittedScale
      const inset = (width - total * fittedScale) / 2
      positions = Array.from('SUNDAY', (_, index) => {
        const box = sample.getExtentOfChar(index)
        const sourceCenter = box.x + box.width / 2
        const letter = letters.current[index]
        letter?.setAttribute('x', String(box.x))
        letter?.setAttribute('y', '0')
        letter?.setAttribute('font-size', '100')
        return {
          x: box.x, sourceCenter, center: inset + sourceCenter * horizontalScale,
          halfWidth: box.width * horizontalScale / 2,
        }
      })
      reach = width * .21
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.time = performance.now()
    }
    const press = (event: PointerEvent) => { move(event); pointer.pressed = true }
    const leave = () => { pointer.time = -1e6 }
    const observer = new ResizeObserver(resize)
    observer.observe(svg)
    resize()
    void document.fonts.ready.then(() => { if (!disposed) resize() })
    document.fonts.addEventListener('loadingdone', resize)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', press, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    let previous = performance.now()
    let pressedUntil = 0
    const animate = (now: number) => {
      const dt = Math.min(.033, (now - previous) / 1000)
      previous = now
      const box = svg.getBoundingClientRect()
      const scale = box.width / width || 1
      const x = (pointer.x - box.left) / scale
      const y = (pointer.y - box.top) / scale
      const distance = Math.max(0, -y, y - height, -x, x - width)
      // Stop pointer influence once the wordmark is docked in the header.
      const influence = box.width > width * .5 && now - pointer.time < 2500 ? falloff(distance, 140) : 0
      const pressed = pointer.pressed && influence > 0
      pointer.pressed = false
      if (pressed) pressedUntil = now + 170
      positions.forEach(({ center, sourceCenter }, index) => {
        const spring = springs[index]
        const pull = falloff(Math.abs(x - center), reach) * influence
        const idle = .12 * (.5 + .5 * Math.sin(now / 620 - index * .75)) * (1 - influence)
        const target = now < pressedUntil ? -.42 * (pull + .25) : Math.max(pull, idle)
        if (pressed) spring.velocity -= 9 * (pull + .2)
        if (reduced) { spring.value = 0; spring.velocity = 0 }
        else {
          spring.velocity += (170 * (target - spring.value) - 14.4 * spring.velocity) * dt
          spring.value = clamp(spring.value + spring.velocity * dt, -.45, 1.6)
        }
        const sx = horizontalScale * (1 - .39 * spring.value)
        const sy = verticalScale * (1 + .6 * spring.value)
        letters.current[index]?.setAttribute('transform', `matrix(${sx} 0 0 ${sy} ${center - sx * sourceCenter} ${height})`)
      })
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.fonts.removeEventListener('loadingdone', resize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', press)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [])
  return <svg ref={surface} className="sunday-stretch-type" aria-hidden="true" width="100%" height="100%">
    <text ref={measure} x="0" y="-10000" visibility="hidden" fontSize="100" letterSpacing="0">SUNDAY</text>
    <g fill="currentColor">{'SUNDAY'.split('').map((letter, index) =>
      <text key={index} ref={node => { letters.current[index] = node }}>{letter}</text>)}</g>
  </svg>
}

export default function Homepage() {
  const [showReel, setShowReel] = useState(false)
  const reelDialog = useRef<HTMLDialogElement>(null)
  const hero = useRef<HTMLElement>(null)
  const wordmark = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = hero.current
    const logo = wordmark.current
    if (!section || !logo) return
    const header = document.querySelector<HTMLElement>('.site-header')
    const socials = header?.querySelector<HTMLElement>('.header-socials')
    const title = logo.querySelector<HTMLElement>('h1')!
    const syncSocials = () => {
      if (!header || !socials) return
      const brandRect = (title.querySelector('svg g') ?? title).getBoundingClientRect()
      const docked = logo.getBoundingClientRect().width < window.innerWidth * .5
      const socialRight = socials.offsetLeft + socials.offsetWidth
      const overlaps = docked && brandRect.left < socialRight + 16
      const opacity = overlaps ? 0 : 1
      header.style.setProperty('--social-opacity', String(opacity))
      header.style.setProperty('--social-shift', `${(1 - opacity) * -8}px`)
      socials.setAttribute('aria-hidden', String(opacity < .05))
    }
    let disposed = false
    const context = gsap.context(() => {
      const headerCenter = () => (document.querySelector('.site-header')?.getBoundingClientRect().height ?? 80) / 2
      const logoHeight = () => logo.offsetHeight
      const heroScale = () => 1
      const glyphSize = () => {
        const svg = title.querySelector('svg')
        const sample = svg?.querySelector('text')
        if (!svg || !sample) return { width: title.offsetWidth, height: title.offsetHeight / 1.51 }
        const width = sample.getComputedTextLength()
        const canvas = document.createElement('canvas').getContext('2d')
        if (canvas) canvas.font = `400 100px ${getComputedStyle(svg).fontFamily}`
        const height = canvas?.measureText('SUNDAY').actualBoundingBoxAscent || sample.getBBox().height
        if (!width || !height) return { width: title.offsetWidth, height: title.offsetHeight / 1.51 }
        const fittedScale = Math.min(svg.clientWidth / width, svg.clientHeight / (height * 1.51))
        return { width: width * fittedScale, height: height * fittedScale }
      }
      const compactScale = () => {
        const size = glyphSize()
        const viewport = section.clientWidth
        const targetHeight = viewport <= 360 ? 26 : viewport <= 900 ? 30 : viewport >= 1600 ? 40 : 34
        const gutter = viewport <= 900 ? 20 : viewport >= 1600 ? 48 : 36
        const buttonWidth = viewport <= 900 ? 44 : 56
        const availableWidth = viewport - 2 * (gutter + buttonWidth + 16)
        return Math.min(targetHeight / size.height, availableWidth / size.width)
      }
      gsap.fromTo(logo, {
        y: () => section.querySelector<HTMLElement>('.sunday-title-space')!.offsetTop,
        scale: heroScale,
      }, {
        y: () => headerCenter() - (logoHeight() - glyphSize().height / 2) * compactScale(),
        scale: compactScale,
        ease: 'none',
        onUpdate: () => {
          syncSocials()
          const rect = title.getBoundingClientRect()
          header?.classList.toggle('hero-brand-docked', rect.top < 90)
        },
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => `+=${section.offsetHeight * .85}`,
          scrub: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? true : .55,
          invalidateOnRefresh: true,
          onRefresh: syncSocials,
        },
      })
    }, section)
    void document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh() })
    return () => {
      disposed = true
      context.revert()
      header?.classList.remove('hero-brand-docked')
      header?.style.removeProperty('--social-opacity')
      header?.style.removeProperty('--social-shift')
      socials?.removeAttribute('aria-hidden')
    }
  }, [])

  return <main className="homepage" id="top">
    <section ref={hero} className="sunday-hero" aria-labelledby="sunday-title">
      <div className="sunday-hero-rule" aria-hidden="true" />
      <button className="sunday-showreel" aria-label="Play the showreel" onClick={() => {
        setShowReel(true)
        reelDialog.current?.showModal()
      }}>
        <span className="sunday-reel-seal"><svg viewBox="0 0 100 100" aria-hidden="true">
          <path className="sunday-seal-shape" d={Array.from({ length: 192 }, (_, i) => {
            const angle = i / 192 * Math.PI * 2
            const radius = 47 + 2.5 * Math.cos(angle * 16)
            return `${i ? 'L' : 'M'} ${50 + radius * Math.cos(angle)} ${50 + radius * Math.sin(angle)}`
          }).join(' ') + 'Z'} />
          <defs><path id="reel-ring" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" /></defs>
          <text><textPath href="#reel-ring">PLAY THE SHOWREEL ★ PLAY THE SHOWREEL ★ </textPath></text>
          <path d="M42 33 66 50 42 67Z" fill="currentColor" />
        </svg></span>
        <span className="sunday-reel-preview"><video src={reel} autoPlay muted loop playsInline aria-hidden="true" />
          <span>SHOWREEL 2026 <span>1:12</span></span>
        </span>
      </button>
      <div className="sunday-title-space" aria-hidden="true" />
      <div className="sunday-hero-bottom">
        <p>Hello! We’re a small, cheerful creative studio bringing ideas to life through branding, design and technology. We make things that feel as good as a slow Sunday morning — thoughtful, effortless and full of little details.</p>
        <Link className="sunday-hero-link" to="/work">Explore our work <ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </section>
    <div ref={wordmark} className="sunday-wordmark">
      <h1 id="sunday-title"><Link to="/" onClick={() => window.scrollTo({
        top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })} aria-label="Sunday homepage"><StretchWordmark /></Link></h1>
    </div>
    <dialog className="sunday-reel-dialog" ref={reelDialog} onClose={() => setShowReel(false)}>
      <button aria-label="Close showreel" onClick={() => reelDialog.current?.close()}>Close ×</button>
      {showReel && <video src={reel} controls autoPlay playsInline />}
    </dialog>
    <Services />
  </main>
}
