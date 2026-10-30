import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useServiceScene } from './useServiceScene'
import './Services.css'

gsap.registerPlugin(ScrollTrigger)
const services = [
  { name: 'Brand', image: 'xvbmP2RETgW6oOPW5kTmPh6busg' },
  { name: 'Product', image: 'BwCmxlMIwWfqxkz8nvxIQfKBgk' },
  { name: 'Engineering', image: '4WNOPai8HNpbkzXGrHQZwYWmibA' },
  { name: 'Growth', image: 'xYeTN1Bn52IZWANLkSiNFVPy0jY' },
  { name: 'Intelligence', image: '1QkHnDWCstFb6jXN6WFLV6yDZB0' },
]

export default function Services() {
  const section = useRef<HTMLElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)
  const visual = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const reveal = useRef<HTMLDivElement>(null)
  useServiceScene(section, backdrop)

  useLayoutEffect(() => {
    const root = section.current!, image = visual.current!, items = list.current!
    const rows = Array.from(items.querySelectorAll<HTMLElement>('.sunday-service-name'))
    const images = Array.from(image.querySelectorAll<HTMLImageElement>('img'))
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const touch = matchMedia('(pointer: coarse)').matches
    const finePointer = !reduced && matchMedia('(hover: hover) and (pointer: fine)').matches
    const pointer = { x: 0, y: 0, clientX: null as number | null }
    const current = { x: 0, driftY: 0, tiltX: 0, tiltY: 0, roll: 0 }
    let active = -1, disposed = false, sceneActive = false
    const geometry = { top: 0, cardCenter: 0, cardWidth: 1, pointerRange: 0, centers: [] as number[] }
    let scrollLean = 0
    let targetLean = 0
    // Decode each layer before its first crossfade, avoiding a first-use hitch.
    images.forEach(img => { void img.decode().catch(() => {}) })
    const measure = () => {
      const bounds = items.getBoundingClientRect()
      geometry.top = bounds.top + window.scrollY
      // Engage the mobile sticky rail as the first row reaches the activation line,
      // rather than several short rows later at a fixed 150px viewport offset.
      root.style.setProperty('--service-touch-anchor', `${Math.max(120, innerHeight / 2 - rows[0].offsetHeight / 2)}px`)
      const rail = root.querySelector<HTMLElement>('.sunday-service-track')!.getBoundingClientRect()
      geometry.cardCenter = rail.left + rail.width / 2
      geometry.cardWidth = rail.width
      const textLeft = Math.min(...rows.map(row => row.firstElementChild!.getBoundingClientRect().left))
      const gap = innerWidth >= 1200 ? Math.min(72, innerWidth * .04) : 24
      // Reserve breathing room even at the furthest right cursor position.
      geometry.pointerRange = Math.max(0, Math.min(innerWidth * .3, textLeft - gap - rail.width / 2 - 16))
      if (pointer.clientX !== null) {
        pointer.x = gsap.utils.clamp(0, geometry.pointerRange, pointer.clientX) - geometry.cardCenter
      }
      current.x = gsap.utils.clamp(-geometry.cardCenter, geometry.pointerRange - geometry.cardCenter, current.x)
      geometry.centers = rows.map(row => row.getBoundingClientRect().top - bounds.top + row.offsetHeight / 2)
    }
    // Tie the blend to scroll distance so rapid swipes never queue animations.
    const opacity = images.map(img => gsap.quickSetter(img, 'opacity'))
    const rowOpacity = rows.map(row => gsap.quickSetter(row, 'opacity'))
    const update = () => {
      const position = window.scrollY + innerHeight / 2 - geometry.top
      let lower = 0
      while (lower < rows.length - 1 && position > geometry.centers[lower + 1]) lower++
      const upper = Math.min(lower + 1, rows.length - 1)
      const span = geometry.centers[upper] - geometry.centers[lower]
      const progress = span ? gsap.utils.clamp(0, 1, (position - geometry.centers[lower]) / span) : 0
      // Zero acceleration at either end keeps reversals and slow scrolling gentle.
      const blend = progress ** 3 * (progress * (progress * 6 - 15) + 10)
      const nearest = progress < .5 ? lower : upper
      if (nearest !== active) {
        active = nearest
        rows.forEach((row, i) => { row.dataset.active = String(i === active) })
      }
      rows.forEach((_row, i) => {
        const weight = reduced ? Number(i === nearest) : i === lower ? 1 - blend : i === upper ? blend : 0
        rowOpacity[i](.325 + .675 * weight)
        // Opaque lower layer prevents a brightness dip in the crossfade.
        images[i].style.zIndex = i === upper ? '2' : '1'
        opacity[i](reduced ? Number(i === nearest) : i === lower ? 1 : i === upper ? blend : 0)
      })
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !finePointer) return
      pointer.clientX = event.clientX
      // A one-to-one horizontal follower across the left 30% of the viewport.
      // At x=0 the card's centre reaches the edge, allowing half the image off-screen.
      pointer.x = gsap.utils.clamp(0, geometry.pointerRange, event.clientX) - geometry.cardCenter
      pointer.y = gsap.utils.clamp(-1, 1, event.clientY / innerHeight * 2 - 1)
    }
    const tick = (_time: number, delta: number) => {
      if (!sceneActive || document.hidden) return
      // Native sticky positioning owns scrolling. Only the inner card floats.
      const floatEase = 1 - Math.exp(-Math.min(delta, 64) / 220)
      const px = finePointer ? pointer.x : 0, py = finePointer ? pointer.y : 0
      const nx = gsap.utils.clamp(-1, 1, px / geometry.cardWidth)
      const horizontalEase = 1 - Math.exp(-Math.min(delta, 64) / 380)
      current.x += (px - current.x) * horizontalEase
      current.driftY += (py * 24 - current.driftY) * floatEase
      current.tiltX += (-py * 5 - current.tiltX) * floatEase
      current.tiltY += (nx * 8 - current.tiltY) * floatEase
      scrollLean += (targetLean - scrollLean) * floatEase
      current.roll += (nx * 1.8 + scrollLean - current.roll) * floatEase
      targetLean *= Math.exp(-Math.min(delta, 64) / 240)
      const bob = finePointer ? Math.sin(_time * .9) * 2 : 0
      const floatY = reduced ? 0 : current.driftY + bob
      image.style.transform = `perspective(1100px) translate3d(${current.x}px, ${floatY}px, 0) rotateX(${current.tiltX}deg) rotateY(${current.tiltY}deg) rotateZ(${current.roll}deg)`
    }
    const context = gsap.context(() => {
      gsap.set(images, { opacity: 0, visibility: 'visible' })
      measure()
      const trigger = ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onUpdate: self => { targetLean = !reduced ? gsap.utils.clamp(touch ? -.65 : -1.5, touch ? .65 : 1.5, self.getVelocity() / 1800) : 0; update() }, onRefresh: () => { measure(); update() } })
      const entry = reveal.current!
      gsap.set(entry, { autoAlpha: 0, scale: .96, y: 16 })
      const visibility = ScrollTrigger.create({
        trigger: items, start: 'top 80%', end: 'bottom 15%',
        onToggle: self => {
          sceneActive = self.isActive
          entry.dataset.visible = String(self.isActive)
          gsap.to(entry, { autoAlpha: self.isActive ? 1 : 0, scale: self.isActive ? 1 : .96, y: self.isActive ? 0 : 16, duration: reduced ? 0 : touch ? .18 : .55, ease: 'power2.out', overwrite: true })
        },
      })
      sceneActive = visibility.isActive
      entry.dataset.visible = String(visibility.isActive)
      gsap.set(entry, { autoAlpha: visibility.isActive ? 1 : 0, scale: visibility.isActive ? 1 : .96, y: visibility.isActive ? 0 : 16 })
      update()
      tick(0, 16.667)
      const resize = new ResizeObserver(() => { if (!disposed) { measure(); update() } })
      resize.observe(items)
      void document.fonts.ready.then(() => { if (!disposed) { update(); ScrollTrigger.refresh() } })
      gsap.ticker.add(tick)
      root.addEventListener('pointermove', move)
      return () => {
        resize.disconnect()
        trigger.kill()
        visibility.kill()
        gsap.killTweensOf(entry)
        gsap.ticker.remove(tick)
        image.style.removeProperty('transform')
        root.removeEventListener('pointermove', move)
      }
    }, root)
    return () => { disposed = true; context.revert(); root.style.removeProperty('--service-touch-anchor'); gsap.killTweensOf([...rows, ...images]) }
  }, [])

  return <>
    {createPortal(<div ref={backdrop} className="sunday-page-backdrop" aria-hidden="true" />, document.body)}
    <section ref={section} className="sunday-services-scroll" aria-label="Our services">
      <div className="sunday-services-container">
        <div className="sunday-services-stage">
          <div className="sunday-service-track" aria-hidden="true"><div className="sunday-service-anchor"><div ref={reveal} className="sunday-service-reveal"><div ref={visual} className="sunday-service-visual">
            {services.map(({ name, image }) => <img key={name} src={`https://framerusercontent.com/images/${image}.jpg?width=684`} alt="" width="456" height="656" decoding="async" />)}
          </div></div></div></div>
          <ul ref={list} className="sunday-services-list">
            {services.map(({ name }) => <li className="sunday-service-name" key={name}><span aria-label={name}>{Array.from(name).map((letter, index) => <span aria-hidden="true" className="sunday-service-letter" key={index}>{letter}</span>)}</span></li>)}
          </ul>
        </div>
        <div className="sunday-services-note">
          <p>Independent thinking.<br />Shared ambition.</p>
          <div className="sunday-services-descriptions">
            <p>Brand Strategy / Identity / Visual Systems</p>
            <p>Product Design / UI/UX / Design Systems</p>
            <p>Web / Applications / Software Development</p>
            <p>SEO / Digital Strategy / Conversion</p>
            <p>AI / Automation / Intelligent Workflows</p>
          </div>
        </div>
      </div>
    </section>
  </>
}
