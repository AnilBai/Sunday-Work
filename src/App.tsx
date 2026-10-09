import { useCallback, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Header from './components/Header/Header'
import Preloader from './components/Preloader/Preloader'
import About from './pages/about/About'
import Contact from './pages/contact/Contact'
import Homepage from './pages/homepage/Homepage'
import Journal from './pages/journal/Journal'
import Studio from './pages/studio/Studio'
import Work from './pages/work/Work'

function App() {
  const [loading, setLoading] = useState(true)
  const completeLoading = useCallback(() => setLoading(false), [])

  return (
    <>
      <div inert={loading} aria-hidden={loading || undefined}>
        <Header />
        <div className="site-content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/work" element={<Work />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="*" element={<Link to="/">Return to homepage</Link>} />
          </Routes>
        </div>
      </div>
      {loading && <Preloader onComplete={completeLoading} />}
    </>
  )
}

export default App
