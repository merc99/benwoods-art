'use client'
// 100K Club demos, ported from handoff/100k-club/components (crest-tilt-holo, metal-lettering, webgl-shader-bg).

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { createShader, fit } from '../webgl'
import { reducedMotion, useInView } from '../useInView'
import s from './club.module.css'

const TIERS = [
  { n: '100K Club', src: '/lab/100k/crest-hero-gold-logo.webp' },
  { n: 'Member', src: '/lab/100k/crest-hero-member.webp' },
  { n: 'Rising Sharp', src: '/lab/100k/crest-hero-rising-sharp.webp' },
  { n: 'Sharp', src: '/lab/100k/crest-hero-sharp.webp' },
  { n: 'Club Legend', src: '/lab/100k/crest-hero-club-legend.webp' },
]

/** Hero crest: tilts toward the pointer with a holo sheen and a gold sweep clipped to the crest's shape. Click to cycle finishes. */
export function ClubCrest() {
  const crest = useRef<HTMLButtonElement>(null)
  const target = useRef({ x: 0.5, y: 0.5 })
  const [tier, setTier] = useState(0)
  const visible = useInView(crest)

  useEffect(() => {
    // preload every finish so the crossfade never flashes
    TIERS.forEach((t) => {
      const im = new Image()
      im.src = t.src
    })
  }, [])

  useEffect(() => {
    const el = crest.current
    if (!el || !visible || reducedMotion()) return
    let cx = 0.5
    let cy = 0.5
    let raf = 0
    const tick = () => {
      cx += (target.current.x - cx) * 0.14
      cy += (target.current.y - cy) * 0.14
      el.style.setProperty('--cx', cx.toFixed(4))
      el.style.setProperty('--cy', cy.toFixed(4))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible])

  const legend = tier === 4
  return (
    <div
      className={cn(s.stage, 'flex h-full flex-col items-center justify-center gap-4 p-6 [perspective:900px]')}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        target.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
      }}
      onPointerLeave={() => (target.current = { x: 0.5, y: 0.5 })}
    >
      <button
        ref={crest}
        type="button"
        className={s.crest}
        onClick={() => setTier((t) => (t + 1) % TIERS.length)}
        aria-label={`${TIERS[tier].n} crest. Show the next finish`}
      >
        {TIERS.map((t, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={t.src} src={t.src} alt="" draggable={false} style={{ opacity: i === tier ? 1 : 0 }} />
        ))}
        <span className={cn(s.mask, s.sweep)} />
        <span className={cn(s.mask, s.sheen)} data-legend={legend || undefined} />
      </button>
      <p className="t-label text-[#C9D0DD]" aria-live="polite">
        {TIERS[tier].n} · click to cycle
      </p>
    </div>
  )
}

const RANKS = ['Member', 'Rising Sharp', 'Sharp', 'Featured Sharp', 'Club Legend']

/** The rank ladder in chrome-horizon metal lettering; Club Legend turns the card to black lacquer. */
export function ClubMetal() {
  const [rank, setRank] = useState(2)
  return (
    <div className={cn(s.stage, 'grid h-full place-items-center p-6')}>
      <div className={cn(s.enamel, rank === 4 && s.legend, 'w-full max-w-[360px] rounded-[20px] p-6')}>
        <p className="t-label text-[#8F9AB2]">Rank {rank + 1} of 5</p>
        <p
          className={cn(s.metal, s[`rm${rank}`], 'mt-3 text-[clamp(2rem,1.4rem+2.4vw,2.75rem)] leading-none font-extrabold tracking-[-0.02em] [font-family:var(--font-display)]')}
        >
          {RANKS[rank]}
        </p>
        <div role="group" aria-label="Rank" className="mt-6 flex flex-wrap gap-1.5">
          {RANKS.map((r, i) => (
            <button
              key={r}
              type="button"
              aria-pressed={rank === i}
              onClick={() => setRank(i)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                rank === i ? 'border-[#E6C987] bg-[#E6C987] text-[#0A1430]' : 'border-[#2A3D6A] text-[#C9D0DD] hover:border-[#E6C987]',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const SILK =
  'precision highp float;uniform vec2 r;uniform float t;uniform vec2 m;uniform vec2 cc;uniform float pt;' +
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}' +
  'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}' +
  'void main(){vec2 fc=gl_FragCoord.xy;vec2 p=(fc-.5*r)/r.y;float tt=t*.075;' +
  'vec2 mp=(m-.5*r)/r.y;vec2 cp=(cc-.5*r)/r.y;float md=length(p-mp);' +
  'vec2 q=vec2(fbm(p*1.5+tt),fbm(p*1.5-tt+3.1));float f=fbm(p*1.1+q*1.5+vec2(tt*.6,-tt*.4));' +
  'vec3 deep=vec3(.02,.04,.1);vec3 navy=vec3(.075,.135,.3);vec3 blue=vec3(.22,.4,.78);vec3 gold=vec3(.93,.72,.34);' +
  'vec3 col=mix(deep,navy,smoothstep(.2,.85,f));' +
  'float folds=sin(p.x*2.1+p.y*1.4+f*6.5-t*.22);col+=blue*pow(max(folds,0.),9.)*.42;' +
  'float folds2=sin(p.x*-1.3+p.y*2.4+f*5.-t*.17);col+=vec3(.5,.62,.9)*pow(max(folds2,0.),18.)*.18;' +
  'col+=blue*exp(-md*md*9.)*.18;' +
  'float cd=length(p-cp);float rad=pt*.85;float ring=exp(-pow((cd-rad)*16.,2.))*exp(-pt*1.5);' +
  'float ring2=exp(-pow((cd-rad*.62)*22.,2.))*exp(-pt*2.2);col+=gold*(ring*.9+ring2*.5);' +
  'col*=1.-length(p*vec2(.62,1.))*.3;gl_FragColor=vec4(col,1.);}'

/** The hero's WebGL silk: folds brighten toward the cursor; a click sends a gold ring out. */
export function ClubSilk() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const visible = useInView(canvas)
  const state = useRef({ mx: 0, my: 0, tx: 0, ty: 0, cx: 0, cy: 0, pulse: 9 })

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const made = createShader(c, SILK, ['r', 't', 'm', 'cc', 'pt'])
    if (!made) return
    const { gl, u } = made
    const scale = Math.min(1, window.devicePixelRatio) * 0.75
    const st = state.current
    const t0 = performance.now()
    const draw = (now: number) => {
      const { w, h } = fit(c, gl, scale)
      st.mx += (st.tx * w - st.mx) * 0.06
      st.my += (st.ty * h - st.my) * 0.06
      st.pulse += 0.016
      gl.uniform2f(u.r, w, h)
      gl.uniform1f(u.t, (now - t0) / 1000)
      gl.uniform2f(u.m, st.mx, st.my)
      gl.uniform2f(u.cc, st.cx * w, st.cy * h)
      gl.uniform1f(u.pt, st.pulse)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    st.tx = 0.6
    st.ty = 0.5
    if (reducedMotion()) {
      draw(t0 + 4000)
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

  const local = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height }
  }
  return (
    <div className="relative h-full">
      <canvas
        ref={canvas}
        aria-label="WebGL silk shader. Move the pointer over it, click to send a gold ring."
        role="img"
        className="block size-full cursor-crosshair bg-[#0A1430]"
        onPointerMove={(e) => {
          const p = local(e)
          state.current.tx = p.x
          state.current.ty = p.y
        }}
        onPointerDown={(e) => {
          const p = local(e)
          Object.assign(state.current, { cx: p.x, cy: p.y, pulse: 0 })
        }}
      />
      <p className="t-label pointer-events-none absolute bottom-4 left-4 text-[#C9D0DD]">Move · click</p>
    </div>
  )
}
