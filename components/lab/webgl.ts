// A tiny WebGL 1 runner for full-frame fragment shaders: one triangle, a few uniforms.
// Pattern shared by the 100K Club shaders and the MMO Nodes mesh gradient (see their handoff sources).

export type Uniforms = Record<string, WebGLUniformLocation | null>

export function createShader(canvas: HTMLCanvasElement, frag: string, names: string[]) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
  if (!gl) return null
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const v = sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}')
  const f = sh(gl.FRAGMENT_SHADER, frag)
  if (!v || !f) return null
  const pr = gl.createProgram()!
  gl.attachShader(pr, v)
  gl.attachShader(pr, f)
  gl.linkProgram(pr)
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null
  gl.useProgram(pr)
  const b = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, b)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(pr, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const u: Uniforms = {}
  names.forEach((n) => (u[n] = gl.getUniformLocation(pr, n)))
  return { gl, u }
}

/** Keeps the canvas backing store matched to its CSS size (times `scale`). Returns the new size. */
export function fit(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, scale: number) {
  const w = Math.max(1, Math.round(canvas.clientWidth * scale))
  const h = Math.max(1, Math.round(canvas.clientHeight * scale))
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
    gl.viewport(0, 0, w, h)
  }
  return { w, h }
}
