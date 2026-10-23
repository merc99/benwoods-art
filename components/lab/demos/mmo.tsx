'use client'
// MMO Nodes demos, ported from handoff/mmo-nodes/components (webgl-mesh-gradient, command-palette).

import { useEffect, useRef } from 'react'
import { openPalette } from '@/components/layout/CommandPalette'
import { createShader, fit } from '../webgl'
import { reducedMotion, useInView } from '../useInView'

const MESH = `precision highp float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c0,c1,c2,c3,bg;
float spot(vec2 p,vec2 s,float k){vec2 d=p-s;return exp(-dot(d,d)/k);}
void main(){
  vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;vec2 p=vec2(uv.x*asp,uv.y);
  float tt=t*.07;
  p+=.10*vec2(sin(p.y*3.1+tt*2.)+sin(p.y*1.7-tt*1.3),cos(p.x*2.7-tt*1.6)+sin(p.x*1.3+tt));
  p+=.035*vec2(sin(p.y*9.+tt*3.),cos(p.x*8.-tt*2.5));
  vec2 s0=vec2(asp*(.22+.16*sin(tt*1.3)),.78+.12*cos(tt*1.1));
  vec2 s1=vec2(asp*(.82+.12*cos(tt*.9)),.62+.16*sin(tt*1.2));
  vec2 s2=vec2(asp*(.48+.22*sin(tt*.7+2.)),.16+.12*cos(tt*1.5));
  vec2 s3=vec2(asp*m.x,m.y);
  float w0=spot(p,s0,.16),w1=spot(p,s1,.2),w2=spot(p,s2,.18),w3=.75*spot(p,s3,.07);
  float wb=.28;
  vec3 col=(bg*wb+c0*w0+c1*w1+c2*w2+c3*w3)/(wb+w0+w1+w2+w3);
  gl_FragColor=vec4(col,1.);
}`

const hex = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const
}

/** Four soft blobs drifting, one following the pointer. Half-resolution, paused offscreen. */
export function MmoMesh() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const visible = useInView(canvas)
  const mouse = useRef({ x: 0.7, y: 0.4, tx: 0.7, ty: 0.4 })

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const made = createShader(c, MESH, ['r', 't', 'm', 'c0', 'c1', 'c2', 'c3', 'bg'])
    if (!made) return
    const { gl, u } = made
    const colors: [string, string][] = [
      ['c0', '#c7b6ff'],
      ['c1', '#a9dcff'],
      ['c2', '#86aaff'],
      ['c3', '#b9e6ff'],
      ['bg', '#eef1f8'],
    ]
    colors.forEach(([k, v]) => gl.uniform3fv(u[k], hex(v)))
    const t0 = performance.now()
    const m = mouse.current
    const draw = (now: number) => {
      const { w, h } = fit(c, gl, 0.5)
      m.x += (m.tx - m.x) * 0.04
      m.y += (m.ty - m.y) * 0.04
      gl.uniform2f(u.r, w, h)
      gl.uniform1f(u.t, (now - t0) / 1000)
      gl.uniform2f(u.m, m.x, m.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    if (reducedMotion()) {
      draw(t0)
      return
    }
    if (!visible) return
    let raf = 0
    const loop = (now: number) => {
      draw(now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [visible])

  return (
    <div
      className="relative h-full bg-[#eef1f8] text-[#000]"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mouse.current.tx = (e.clientX - r.left) / r.width
        mouse.current.ty = 1 - (e.clientY - r.top) / r.height
      }}
    >
      <canvas ref={canvas} aria-hidden className="absolute inset-0 block size-full" />
      <div className="relative flex h-full flex-col justify-between p-6">
        <p className="text-[clamp(2.5rem,1.6rem+3vw,4rem)] leading-[0.85] font-bold tracking-[-0.04em] [font-family:var(--font-sans)]">
          mmo
          <br />
          nodes
        </p>
        <p className="t-label text-[rgb(0_0_0/0.62)]">Move the pointer · the fourth blob follows it</p>
      </div>
    </div>
  )
}

/** Opens the site's own ⌘K palette (ported from MMO Nodes). */
export function MmoPalette() {
  const isMac = typeof navigator !== 'undefined' && /Mac|iP(hone|ad)/.test(navigator.platform)
  return (
    <div className="grid h-full place-items-center bg-[linear-gradient(160deg,#eef1f8,#dfe6f7)] p-6 text-[#000]">
      <div className="text-center">
        <button
          type="button"
          onClick={openPalette}
          className="inline-flex h-12 items-center gap-3 rounded-full border border-[rgb(0_0_0/0.12)] bg-[rgb(255_255_255/0.78)] px-5 text-[15px] font-medium shadow-[0_10px_30px_-12px_rgb(40_60_120/0.35)] transition-transform active:scale-[.97]"
        >
          Open the command palette
          <kbd className="t-label rounded-md border border-[rgb(0_0_0/0.15)] px-1.5 py-0.5 text-[rgb(0_0_0/0.62)]">
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
        </button>
        <p className="t-label mt-4 text-[rgb(0_0_0/0.62)]">Works anywhere on this site</p>
      </div>
    </div>
  )
}
