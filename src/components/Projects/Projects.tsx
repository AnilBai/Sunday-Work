import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Projects.css'

gsap.registerPlugin(ScrollTrigger)

// Reference content until Sunday's own case studies are supplied.
const projects = [
  { name: 'Sous La Lumière', line: 'Cocon Céleste', image: 'uTMpgfqdqyzGJrPIR55FV0pbqI.jpg', slug: 'sous-la-lumiere', alt: 'A woman in yellow glasses blowing bubblegum against a yellow background', position: '50% 50%' },
  { name: 'The Human Interface', line: 'Lindholm', image: 'jvdk89zl6RqytV9HJMdgZRdnM.jpg', slug: 'the-human-interface', alt: 'Lindholm product design in a minimal studio setting', position: '50% 50%' },
  { name: 'The Wendrich GT922', line: 'Porsche', image: 'yFq1hEIGI4Fa9Ku0ZGzjrQ1hue0.jpg', slug: 'the-wendrich-gt922', alt: 'Detail of a matte grey Porsche sports car', position: '50% 50%' },
  { name: 'Rituel Noir', line: 'Obliqon', image: 'aOq0ruSInv3tVbZ8lHAnEwJOKw.jpg', slug: 'rituel-noir', alt: 'Obliqon grooming products arranged against a red background', position: '50% 50%' },
  { name: 'Thermal Dynamics™', line: 'Halden®', image: 'R8Jxht81smjKYyLQuxtF8TzJpzk.jpg', slug: 'thermal-dynamics', alt: 'Halden outdoor apparel campaign', position: '50% 50%' },
]

export default function Projects() {
  const section = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = section.current!
    const media = gsap.matchMedia()
    let disposed = false
    media.add({ motion: '(prefers-reduced-motion: no-preference)', fine: '(hover: hover) and (pointer: fine)' }, context => {
      const { motion, fine } = context.conditions!
      const rows = Array.from(root.querySelectorAll<HTMLElement>('.project-row'))
      if (motion) {
        gsap.from(root.querySelectorAll('.projects-heading > *'), { y: 32, opacity: 0, duration: .9, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 85%', toggleActions: 'play none none reverse' } })
        rows.forEach(row => {
          const cards = row.querySelectorAll('.project-card')
          if (row.classList.contains('project-row-featured')) {
            const window = row.querySelector('.project-window')
            gsap.fromTo(window, { clipPath: 'inset(12% 8% 12% 8% round 32px)' }, {
              clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'power2.out',
              scrollTrigger: { trigger: row, start: 'top 94%', end: 'top 25%', scrub: fine ? .8 : true },
            })
            gsap.fromTo(row.querySelector('img'), { scale: 1.18 }, { scale: 1, ease: 'none',
              scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: fine ? .8 : true },
            })
          }
          gsap.fromTo(cards, { y: 65, opacity: 0, scale: .965 }, { y: 0, opacity: 1, scale: 1, stagger: .1, ease: 'power2.out', scrollTrigger: { trigger: row, start: 'top 96%', end: 'top 57%', scrub: fine ? .55 : true } })
          row.querySelectorAll<HTMLElement>('.project-image').forEach(image => {
            gsap.fromTo(image, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: fine ? .65 : true } })
          })
        })
      }

    })
    void document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh() })
    return () => { disposed = true; media.revert() }
  }, [])

  return <section ref={section} id="projects" className="sunday-projects" aria-labelledby="projects-title">
    <div className="projects-inner">
      <header className="projects-heading">
        <h2 id="projects-title">Our Projects<span className="projects-count" aria-label="5 projects">(05)</span></h2>
      </header>
      <div className="projects-grid">
        {[[0, 2], [2, 3], [3, 5]].map(([start, end]) => <div className={`project-row${end - start === 1 ? ' project-row-featured' : ''}`} key={start}>
          {projects.slice(start, end).map(project => <article className="project-card" key={project.slug}>
            <a className="project-link" href={`https://spector.framer.website/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.name} reference project (opens in a new tab)`}>
              <div className="project-window">
                <div className="project-image"><img src={`https://framerusercontent.com/images/${project.image}?width=1600`} srcSet={[480, 800, 1200, 1600].map(width => `https://framerusercontent.com/images/${project.image}?width=${width} ${width}w`).join(', ')} sizes={end - start === 1 ? '100vw' : '(max-width: 700px) calc(100vw - 40px), 50vw'} alt={project.alt} style={{ objectPosition: project.position }} loading="lazy" decoding="async" width="1200" height="1000" /></div>
              </div>
              <div className="project-caption"><div><h3>{project.name}</h3><p>{project.line}</p></div></div>
            </a>
          </article>)}
        </div>)}
      </div>
    </div>
  </section>
}
