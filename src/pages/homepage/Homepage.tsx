import { Link } from 'react-router-dom'
import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Homepage.css'

gsap.registerPlugin(ScrollTrigger)

const heroImage = 'https://framerusercontent.com/images/dHtsWyw1OkKQWhvA3Lw3juGsIfY.jpg?scale-down-to=1024&width=2820&height=1880'

export default function Homepage() {
  const hero = useRef<HTMLElement>(null)
  const wordmark = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = hero.current
    const logo = wordmark.current
    if (!section || !logo) return
    const header = document.querySelector<HTMLElement>('.site-header')
    let disposed = false
    const context = gsap.context(() => {
      const headerCenter = () => (document.querySelector('.site-header')?.getBoundingClientRect().height ?? 80) / 2
      const logoHeight = () => logo.offsetHeight
      const heroScale = () => {
        const title = logo.querySelector('h1')!
        const gutter = window.innerWidth <= 760 ? 20 : window.innerWidth >= 1600 ? 48 : 36
        return Math.min((section.clientWidth - gutter * 2) / (title as HTMLElement).offsetWidth,
          section.offsetHeight * .4 / logoHeight())
      }
      const compactScale = () => (window.innerWidth <= 900 ? 22 : 28) / parseFloat(getComputedStyle(logo.querySelector('h1')!).fontSize)
      gsap.fromTo(logo, {
        y: () => section.offsetHeight / 2 - logoHeight() * heroScale() / 2,
        scale: heroScale,
      }, {
        y: () => headerCenter() - logoHeight() * compactScale() / 2,
        scale: compactScale,
        ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => `+=${section.offsetHeight * .85}`,
          scrub: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? true : .55,
          invalidateOnRefresh: true,
          onUpdate: self => { if (header) header.dataset.brandDocked = String(self.progress > .65) },
        },
      })
    }, section)
    void document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh() })
    return () => { disposed = true; context.revert(); if (header) delete header.dataset.brandDocked }
  }, [])

  return <main className="homepage" id="top">
    <section ref={hero} className="sunday-hero" aria-labelledby="sunday-title">
      <img className="sunday-hero-image" src={heroImage}
        alt="Woman wearing white sunglasses surrounded by blue smoke" fetchPriority="high" />
      <div className="sunday-hero-content">
        <div className="sunday-hero-top">
          <p>Brands with purpose.<br />Experiences with impact.</p>
          <span>Independent<br />creative studio</span>
        </div>
        <div className="sunday-hero-bottom">
          <p className="sunday-hero-caption">Brand / Product / Development<br />Growth / Intelligence</p>
          <Link className="sunday-hero-link" to="/work">Our work <ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
    <div ref={wordmark} className="sunday-wordmark">
      <h1 id="sunday-title"><Link to="/" onClick={() => window.scrollTo({
        top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })}>SUNDAY<sup>{'\u2122'}</sup></Link></h1>
    </div>
    <section className="sunday-services" aria-label="Our disciplines">
      <p>Brand / Product / Development / Growth / Intelligence</p>
      <Link to="/contact">Let&apos;s talk <ArrowUpRight aria-hidden="true" size={18} /></Link>
    </section>
    <section className="sunday-introduction" aria-labelledby="sunday-introduction-title">
      <p className="sunday-section-label">Independent thinking. Shared ambition.</p>
      <h2 id="sunday-introduction-title">Brands built for<br />what&apos;s next.</h2>
      <div className="sunday-discipline-list">
        {['Brand', 'Product', 'Development', 'Growth', 'Intelligence'].map((discipline, index) =>
          <div key={discipline}><span>0{index + 1}</span><span>{discipline}</span></div>)}
      </div>
      <Link className="sunday-hero-link" to="/work">Explore our work <ArrowUpRight aria-hidden="true" /></Link>
    </section>
  </main>
}
