import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Minus } from 'lucide-react'
import './Header.css'

const pages = [
  { to: '/', label: 'Home' }, { to: '/about', label: 'About' },
  { to: '/work', label: 'Work' }, { to: '/studio', label: 'Studio' },
  { to: '/journal', label: 'Journal' }, { to: '/contact', label: 'Contact' },
]

function SocialRow() {
  return <div className="header-socials" aria-label="Social channels">
    {['WA', 'X', 'IG', 'LI', 'EMAIL'].map(label => <span key={label}>{label}</span>)}
  </div>
}

function MenuSymbol({ expanded, reducedMotion }: { expanded: boolean; reducedMotion: boolean }) {
  return <span className="header-menu-symbol" aria-hidden="true">
    <Minus strokeWidth={.8} />
    <motion.span className="header-menu-symbol-rotating"
      initial={{ rotate: -90 }} animate={{ rotate: expanded ? 0 : -90 }}
      transition={{ duration: reducedMotion ? 0 : .55, ease: [.65, 0, .2, 1] }}>
      <Minus strokeWidth={.8} />
    </motion.span>
  </span>
}

function StudioClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return <div className="header-clock">
    <time dateTime={now.toISOString()}>{new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(now)}</time>
    <span>CURRENT TIME ZONE (GMT+5:30)</span>
  </div>
}

export default function Header() {
  const { pathname } = useLocation()
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const menu = dialog.current
    if (!mounted || !menu) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    menu.showModal()
    closeButton.current?.focus({ preventScroll: true })
    return () => { menu.close(); document.body.style.overflow = overflow }
  }, [mounted])

  const openMenu = () => { setMounted(true); setExpanded(true) }
  const closeMenu = () => setExpanded(false)

  return <>
    <header className="site-header">
      <SocialRow />
      {pathname !== '/' && <Link className="header-brand-center" to="/" aria-label="Sunday homepage">SUNDAY<sup>{'\u2122'}</sup></Link>}
      <button className="header-menu-button" type="button" aria-label="Open menu" title="Open menu"
        aria-expanded={mounted} aria-controls="sunday-navigation" onClick={openMenu}>
        <MenuSymbol expanded={expanded} reducedMotion={!!reducedMotion} />
      </button>
    </header>
    <motion.dialog className="header-menu" id="sunday-navigation" ref={dialog} aria-label="Main navigation"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: expanded ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' }}
      transition={{ duration: reducedMotion ? 0 : expanded ? .85 : .6, ease: [.65, 0, .2, 1] }}
      onAnimationComplete={() => { if (!expanded) setMounted(false) }}
      onCancel={event => { event.preventDefault(); closeMenu() }}>
      {mounted && <div className="header-menu-inner">
        <div className="header-menu-top">
          <SocialRow />
          <button ref={closeButton} className="header-menu-button" type="button" aria-label="Close menu" title="Close menu" onClick={closeMenu}>
            <MenuSymbol expanded={expanded} reducedMotion={!!reducedMotion} />
          </button>
        </div>
        <div className="header-menu-main">
          <nav className="header-menu-links" aria-label="Main navigation">
            {pages.map(page => <NavLink key={page.to} to={page.to} end={page.to === '/'} onClick={closeMenu}
              className={({ isActive }) => isActive && page.to !== '/' ? 'is-active' : undefined}>{page.label}</NavLink>)}
          </nav>
          <div className="header-menu-legal" aria-label="Legal">
            <span>Privacy Policy</span><span>Terms of Service</span><span>Disclaimer</span>
          </div>
          <div className="header-menu-intro">
            <h2>We{'\u2019'}re based in <span className="header-location">India, Dubai, and the USA</span>, and we work remotely.</h2>
            <StudioClock />
          </div>
        </div>
      </div>}
    </motion.dialog>
  </>
}
