import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './HomeAbout.css'

gsap.registerPlugin(ScrollTrigger)

// Reference portraits are decorative placeholders until Sunday team photography is ready.
const portraits = [
  { image: 'c2XLEwqGOghXJ5c7lBcb090p6A', rate: 0, offset: 0 },
  { image: 'e0LAGcGE4nkhyHBpdtiWjTlfc8', rate: .19, offset: 200 },
  { image: 'k9PQmRbDHccgBBeupUCYnhcGw0', rate: .10, offset: 360 },
  { image: 'YM4vbK7504gqynWVsNUdp6nG84', rate: .32, offset: 286 },
  { image: '8RvSjvFQKjEyXTQffVuKZrfnk', rate: -.19, offset: -460 },
  { image: 'Czwk5ntg08zcZtYUvlcOe79oshk', rate: 0, offset: 0 },
]

export default function HomeAbout() {
  const section = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const scene = section.current!.querySelector<HTMLElement>('.home-about-inner')!
        const copy = scene.querySelector<HTMLElement>('.home-about-copy')!
        copy.querySelectorAll<HTMLElement>('.home-about-title, .home-about-description').forEach(block => {
          gsap.from(block.querySelectorAll('.home-about-reveal'), {
            opacity: 0, y: 18, filter: 'blur(8px)', duration: .65,
            stagger: .045, ease: 'power2.out',
            scrollTrigger: { trigger: block, start: 'top 88%', once: true },
          })
        })
        gsap.utils.toArray<HTMLElement>('.home-about-portrait').forEach((portrait, index) => {
          const { rate, offset } = portraits[index]
          if (!rate) return
          const position = (top: number) => (top + offset) * rate
          gsap.fromTo(portrait, { y: () => position(innerHeight) }, {
            y: () => position(-scene.offsetHeight - innerHeight * .45),
            ease: 'none',
            scrollTrigger: {
              trigger: scene, start: 'top bottom', end: 'bottom -45%',
              scrub: true, invalidateOnRefresh: true,
            },
          })
        })
      }, section)
      return () => context.revert()
    })
    return () => media.revert()
  }, [])

  return <section ref={section} className="home-about" id="about-us" aria-labelledby="home-about-title">
    <div className="home-about-inner">
      <div className="home-about-portraits" aria-hidden="true">
        {portraits.map(({ image }, index) => <div key={image} className={`home-about-portrait home-about-portrait-${index + 1}`}>
          <img src={`https://framerusercontent.com/images/${image}.png?width=500`} alt="" loading="lazy" decoding="async" />
        </div>)}
      </div>
      <div className="home-about-copy">
        <h2 id="home-about-title" className="home-about-title">{['We Listen.', 'We Design.', 'We Deliver Results.'].map(line => <span className="home-about-line" key={line}>{line.split(' ').map((word, index) => <span key={index}>{index > 0 && ' '}<span className="home-about-reveal">{word}</span></span>)}</span>)}</h2>
        <p className="home-about-description"><span className="home-about-reveal">We see possibilities where others see limits. We challenge conventions, connect the unexpected, and turn bold ideas into meaningful impact. Driven by curiosity. Built on creativity. Powered by intelligence. We don't wait for what's next. We create it. <strong>We're Sunday &amp; Company.</strong></span></p>
      </div>
    </div>
  </section>
}
