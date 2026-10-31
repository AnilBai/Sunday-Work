import { useEffect, useRef } from 'react'

export default function AsciiField() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const surface = canvas.current
    const context = surface?.getContext('2d')
    if (!surface || !context) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0, previous = 0, width = 1, height = 1, visible = true
    const pointer = { x: .5, y: .5, targetX: .5, targetY: .5 }
    const resize = () => {
      width = surface.clientWidth; height = surface.clientHeight
      const dpr = Math.min(devicePixelRatio, 2)
      surface.width = width * dpr; surface.height = height * dpr
      context.setTransform(dpr,0,0,dpr,0,0)
      previous = 0
    }
    const observer = new ResizeObserver(resize); observer.observe(surface); resize()
    const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting }); visibility.observe(surface)
    const move = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect()
      pointer.targetX = (event.clientX - rect.left) / rect.width; pointer.targetY = (event.clientY - rect.top) / rect.height
    }
    surface.addEventListener('pointermove',move,{passive:true})
    const chars = ' .:;+x*%#@$W80'
    const render = (now: number) => {
      frame = requestAnimationFrame(render)
      if (!visible || now - previous < 16 || (reduced && previous)) return
      const dt = Math.min(.05, (now - previous) / 1000 || .016)
      previous = now
      const easing = 1 - Math.exp(-5 * dt)
      pointer.x += (pointer.targetX - pointer.x) * easing
      pointer.y += (pointer.targetY - pointer.y) * easing
      const t = reduced ? 0 : now * .00012
      context.clearRect(0,0,width,height)
      const step = width < 760 ? 12 : 19
      context.font = `600 ${step * .86}px ui-monospace, SFMono-Regular, Menlo, monospace`
      context.textAlign = 'center'
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const u = x / width, v = y / height
          const crest = .48 + Math.sin(u * 7 - t * 2) * .12 + Math.cos(u * 13 + t) * .06
          const distance = (v - crest) / .24
          const shape = Math.exp(-distance * distance * 2)
          const ripple = .5 + .5 * Math.sin(u * 23 + v * 11 - t * 4 + Math.sin(v * 9 + t) * 2)
          const edge = Math.pow(Math.sin(Math.PI * Math.min(1,Math.max(0,v))),1.4)
          const mouse = Math.exp(-((u-pointer.x)**2+(v-pointer.y)**2)*30) * .14
          const density = shape * (.25 + ripple * .75) * edge
          const alpha = density * .58 + mouse * shape
          if(alpha < .035) continue
          // Crossfade neighbouring glyphs instead of switching characters abruptly.
          const value = Math.min(chars.length-1,(ripple * .65 + shape * .35) * (chars.length-1))
          const index = Math.floor(value)
          const blend = value - index
          context.fillStyle = `rgba(235,235,235,${alpha * (1-blend)})`
          context.fillText(chars[index],x,y)
          if (blend > .01 && index < chars.length-1) {
            context.fillStyle = `rgba(235,235,235,${alpha * blend})`
            context.fillText(chars[index+1],x,y)
          }
        }
      }
    }
    frame = requestAnimationFrame(render)
    return () => {cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();surface.removeEventListener('pointermove',move)}
  },[])
  return <canvas ref={canvas} className="stride-ascii" aria-hidden="true" />
}
