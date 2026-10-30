import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const pages = [
  ['/', 'Home'], ['/about', 'About'], ['/work', 'Work'],
  ['/studio', 'Studio'], ['/journal', 'Journal'], ['/contact', 'Contact'],
]

type FooterProps = {
  privacyUrl?: string
  termsUrl?: string
}

export default function Footer({ privacyUrl, termsUrl }: FooterProps) {
  const wordmark = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const text = wordmark.current
    const container = text?.parentElement
    if (!text || !container) return
    let disposed = false
    let lastWidth = -1
    const fit = () => {
      if (disposed) return
      text.style.fontSize = '100px'
      const measured = text.getBoundingClientRect().width
      if (measured) text.style.fontSize = `${100 * (container.clientWidth - 2) / (measured + 3.5)}px`
    }
    const observer = new ResizeObserver(([entry]) => {
      if (Math.abs(entry.contentRect.width - lastWidth) < .1) return
      lastWidth = entry.contentRect.width
      fit()
    })
    observer.observe(container)
    fit()
    void document.fonts.ready.then(fit)
    document.fonts.addEventListener('loadingdone', fit)
    return () => { disposed = true; observer.disconnect(); document.fonts.removeEventListener('loadingdone', fit) }
  }, [])
  const legal = [
    { label: 'Privacy Policy', href: privacyUrl },
    { label: 'Terms & Conditions', href: termsUrl },
  ]
  const renderLink = ({ label, href }: { label: string; href?: string }) => href
    ? <a key={label} href={href}>{label}</a>
    : <span key={label}>{label}</span>

  return <footer className="sunday-footer" aria-labelledby="footer-title">
    <h2 id="footer-title" className="sunday-footer-title">Have a project? <a href="mailto:hello@sundayandcompany.com">Let’s talk.</a></h2>
    <div className="sunday-footer-columns">
      <div className="sunday-footer-column">
        <h3>Sunday &amp; Company</h3>
        <p>Independent thinking.<br />Shared ambition.</p>
        <p>Brand / Product / Development<br />Growth / Intelligence</p>
      </div>
      <div className="sunday-footer-column">
        <h3>Get in touch</h3>
        <a href="tel:+919876543210">+91 9876543210</a>
        <a href="mailto:hello@sundayandcompany.com">hello@sundayandcompany.com</a>
      </div>
      <div className="sunday-footer-column">
        <h3>Explore</h3>
        <nav className="sunday-footer-navigation" aria-label="Footer navigation">
          {pages.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
        </nav>
      </div>
    </div>
    <Link className="sunday-footer-wordmark" to="/" aria-label="Sunday & Company homepage" onClick={() => {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }}><span ref={wordmark}>Sunday &amp; Company</span></Link>
    <div className="sunday-footer-bottom">
      <p>© Copyrights Sunday &amp; Company</p>
      <div className="sunday-footer-legal" aria-label="Legal information">{legal.map(renderLink)}</div>
    </div>
  </footer>
}
