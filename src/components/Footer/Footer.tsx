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
    const fit = () => {
      if (disposed) return
      text.style.fontSize = '100px'
      const width = text.getBoundingClientRect().width
      if (width) text.style.fontSize = `${100 * (container.clientWidth - 2) / (width + 3.5)}px`
    }
    const observer = new ResizeObserver(fit)
    observer.observe(container)
    fit()
    void document.fonts.ready.then(fit)
    return () => { disposed = true; observer.disconnect() }
  }, [])
  const legal = [
    { label: 'Privacy Policy', href: privacyUrl },
    { label: 'Terms & Conditions', href: termsUrl },
  ]
  const renderLink = ({ label, href }: { label: string; href?: string }) => href
    ? <a key={label} href={href}>{label}</a>
    : <span key={label}>{label}</span>

  return <footer className="sunday-footer">
    <div className="sunday-footer-top">
      <nav className="sunday-footer-navigation" aria-label="Footer navigation">
        {pages.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
      </nav>
      <div className="sunday-footer-contact" aria-label="Contact details">
        <a href="mailto:hello@sundayandcompany.com">hello@sundayandcompany.com</a>
        <a href="tel:+910876543210">+91 0876543210</a>
      </div>
    </div>
    <Link className="sunday-footer-wordmark" to="/" aria-label="Sunday & Company homepage" onClick={() => {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }}>
      <span ref={wordmark}>Sunday &amp; Company</span>
    </Link>
    <div className="sunday-footer-bottom">
      <p className="sunday-footer-copyright">© Copyrights Sunday &amp; Company</p>
      <div className="sunday-footer-legal" aria-label="Legal information">{legal.map(renderLink)}</div>
    </div>
  </footer>
}
