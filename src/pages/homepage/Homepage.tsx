import { Link } from 'react-router-dom'
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AsciiField from './AsciiField'
import './Homepage.css'
import Services from '../../components/Services/Services'
import Projects from '../../components/Projects/Projects'

gsap.registerPlugin(ScrollTrigger)
export default function Homepage() {
  const hero = useRef<HTMLElement>(null)
  const wordmark = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const section=hero.current, logo=wordmark.current
    if(!section||!logo)return
    const header=document.querySelector<HTMLElement>('.site-header')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const scrub = reduced || matchMedia('(pointer: coarse)').matches ? true : .5
    const context=gsap.context(()=>{
      gsap.fromTo(logo, {
        y:()=>innerWidth<=760?132:130, scale:1, '--fade-stop':'48%',
      },{
        y:()=>((header?.offsetHeight??80)-logo.offsetHeight)/2,
        scale:()=>Math.min(innerWidth<=760?.43:.15,150/logo.offsetWidth),
        '--fade-stop':'100%', ease:'none',
        scrollTrigger:{trigger:section,start:'top top',end:'bottom top',scrub,invalidateOnRefresh:true,
          onUpdate:self=>header?.classList.toggle('hero-brand-docked',self.progress>.15),
          onRefresh:self=>header?.classList.toggle('hero-brand-docked',self.progress>.15)},
      })
      gsap.to('.stride-about span',{color:'#f4f4f4',stagger:.07,ease:'none',scrollTrigger:{trigger:'.stride-about',start:'top 85%',end:'bottom 55%',scrub}})
    },section.parentElement!)
    return ()=>{context.revert();header?.classList.remove('hero-brand-docked')}
  },[])
  const statement='An independent creative studio bringing bold ideas to life through branding, design and technology.'
  return <main className="homepage" id="top">
    <section ref={hero} className="sunday-hero stride-hero" aria-label="Sunday creative studio">
      <AsciiField />
      <div className="stride-meta"><p>INDEPENDENT DESIGN & TECHNOLOGY STUDIO<br/>BUILDING BRANDS. SHAPING EXPERIENCES.</p><p>SUNDAY & COMPANY<br/>THOUGHTFUL BY DESIGN.</p></div>
    </section>
    <div ref={wordmark} className="sunday-wordmark stride-wordmark"><h1><Link to="/" aria-label="Sunday homepage" onClick={()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}><svg viewBox="0 0 1000 235" role="img" aria-label="Sunday"><text x="0" y="215" textLength="1000" lengthAdjust="spacingAndGlyphs">SUNDAY</text></svg></Link></h1></div>
    <section className="stride-about" aria-label="About Sunday"><p>{statement.split(' ').map((word,index)=><span key={index}>{word} </span>)}</p></section>
    <Projects />
    <Services />
  </main>
}
