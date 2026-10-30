import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useServiceScene } from './useServiceScene'
import './Services.css'

gsap.registerPlugin(ScrollTrigger)
const services = [
  { name: 'Art Direction', image: 'xvbmP2RETgW6oOPW5kTmPh6busg' },
  { name: 'Production', image: 'BwCmxlMIwWfqxkz8nvxIQfKBgk' },
  { name: 'Strategy', image: '4WNOPai8HNpbkzXGrHQZwYWmibA' },
  { name: 'Rebranding', image: 'xYeTN1Bn52IZWANLkSiNFVPy0jY' },
  { name: 'Design', image: '1QkHnDWCstFb6jXN6WFLV6yDZB0' },
]

export default function Services() {
  const section = useRef<HTMLElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)
  const visual = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)
  useServiceScene(section, backdrop)

  useLayoutEffect(() => {
    const root = section.current!, image = visual.current!, items = list.current!
    const rows = Array.from(items.querySelectorAll<HTMLElement>('.sunday-service-name'))
    const images = Array.from(image.querySelectorAll<HTMLImageElement>('img'))
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0, y: 0 }
    const current = { y: 0, x: 0, tiltX: 0, tiltY: 0 }
    let targetY = 0, active = -1, disposed = false
    const setImage = gsap.quickSetter(image, 'css')
    const setActive = (index: number) => {
      if (index === active) return
      active = index
      rows.forEach((row, i) => {
        row.dataset.active = String(i === index)
        gsap.to(row, { opacity: i === index ? 1 : .325, duration: reduced ? 0 : .35, ease: 'power2.out', overwrite: true })
      })
      images.forEach((img, i) => {
        if (i === index) {
          gsap.set(img, { zIndex: 2 })
          gsap.fromTo(img, { autoAlpha: 0, scale: .98 }, { autoAlpha: 1, scale: 1, duration: reduced ? 0 : .55, ease: 'power2.out', overwrite: true })
        } else {
          gsap.set(img, { zIndex: 1 })
          gsap.to(img, { autoAlpha: 0, duration: reduced ? 0 : .4, overwrite: true })
        }
      })
    }
    const update = () => {
      const center = innerHeight / 2
      let nearest = 0, distance = Infinity
      rows.forEach((row, i) => {
        const r = row.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - center)
        if (d < distance) { nearest = i; distance = d }
      })
      setActive(nearest)
      const row = rows[nearest].getBoundingClientRect()
      const stage = items.getBoundingClientRect()
      targetY = row.top - stage.top + row.height / 2 - image.offsetHeight / 2 - (innerWidth >= 1200 ? 100 : 40)
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || reduced) return
      const bounds = root.getBoundingClientRect()
      pointer.x = gsap.utils.clamp(-1, 1, (event.clientX - bounds.left) / bounds.width * 2 - 1)
      pointer.y = gsap.utils.clamp(-1, 1, event.clientY / innerHeight * 2 - 1)
    }
    const leave = () => { pointer.x = 0; pointer.y = 0 }
    const tick = (_time: number, delta: number) => {
      const factor = 1 - Math.pow(.87, Math.min(delta, 64) / 16.667)
      current.y += (targetY - current.y) * factor
      current.x += (pointer.x * 36 - current.x) * factor * .5
      current.tiltX += (-pointer.y * 6 - current.tiltX) * factor * .5
      current.tiltY += (pointer.x * 10 - current.tiltY) * factor * .5
      setImage({ x: current.x, y: reduced ? targetY : current.y, rotationX: current.tiltX, rotationY: current.tiltY, transformPerspective: 900 })
    }
    const context = gsap.context(() => {
      gsap.set(images, { autoAlpha: 0 })
      const trigger = ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onUpdate: update, onRefresh: update })
      update()
      current.y = targetY
      tick(0, 16.667)
      const resize = new ResizeObserver(() => { if (!disposed) update() })
      resize.observe(items)
      void document.fonts.ready.then(() => { if (!disposed) { update(); ScrollTrigger.refresh() } })
      gsap.ticker.add(tick)
      root.addEventListener('pointermove', move)
      root.addEventListener('pointerleave', leave)
      return () => {
        resize.disconnect()
        trigger.kill()
        gsap.ticker.remove(tick)
        root.removeEventListener('pointermove', move)
        root.removeEventListener('pointerleave', leave)
      }
    }, root)
    return () => { disposed = true; context.revert(); gsap.killTweensOf([...rows, ...images]) }
  }, [])

  return <>
    {createPortal(<div ref={backdrop} className="sunday-page-backdrop" aria-hidden="true" />, document.body)}
    <section ref={section} className="sunday-services-scroll" aria-labelledby="services-heading">
      <div className="sunday-services-container">
        <h2 id="services-heading">What we do <span aria-hidden="true">↴</span></h2>
        <div className="sunday-services-stage">
          <div ref={visual} className="sunday-service-visual" aria-hidden="true">
            {services.map(({ name, image }) => <img key={name} src={`https://framerusercontent.com/images/${image}.jpg?width=684`} alt="" width="456" height="656" decoding="async" />)}
          </div>
          <ul ref={list} className="sunday-services-list">
            {services.map(({ name }) => <li className="sunday-service-name" key={name}><span aria-label={name}>{Array.from(name).map((letter, index) => <span aria-hidden="true" className="sunday-service-letter" key={index}>{letter}</span>)}</span></li>)}
          </ul>
        </div>
        <div className="sunday-services-note">
          <p>Independent thinking.<br />Shared ambition.</p>
          <p>Brand / Product / Development / Growth / Intelligence</p>
        </div>
      </div>
    </section>
  </>
}
