/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

interface FluidBackgroundProps {
  enabled?: boolean;
  opacity?: number;
  speed?: number;
  intensity?: 'subtle' | 'vibrant' | 'ambient';
}

const VS = `attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FS = `#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform float u_seed;
uniform float u_scale;
uniform float u_warp;
uniform int u_lens;
uniform float u_lensAmt;
uniform float u_sym;
uniform float u_pixel;
uniform float u_dots;
uniform float u_dot;
uniform float u_dither;
uniform float u_grain;
uniform int   u_pal;
uniform vec3  u_c0;
uniform vec3  u_c1;
uniform vec3  u_c2;
uniform vec3  u_c3;
uniform sampler2D u_tex;
uniform float u_hasTex;
uniform float u_texAspect;
uniform float u_liq;
uniform float u_mix;
uniform float u_split;
uniform int   u_field;
uniform int   u_field2;
uniform int   u_blend;
uniform float u_layerMix;
uniform int   u_field3;
uniform int   u_blend2;
uniform float u_layerMix2;
uniform int   u_screen;
uniform int   u_material;
uniform sampler2D u_glyph;
uniform sampler2D u_mask;
uniform float u_hasMask;
uniform vec3  u_maskBg;
uniform vec3  u_maskBg2;
uniform float u_maskGrad;
uniform vec2  u_pan;
uniform vec2  u_mouse;
uniform float u_mouseAmt;
uniform int   u_mouseMode;
uniform float u_rec;

float hash(vec2 p){
  p = fract(p * 0.3183099 + fract(u_seed * 0.1031) + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * (p.x + p.y));
}
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for(int i = 0; i < 5; i++){
    v += a * vnoise(p);
    p = p * 2.03 + vec2(11.7, 5.9);
    a *= 0.5;
  }
  return v;
}

vec2 hash22(vec2 p){
  return vec2(hash(p), hash(p + vec2(37.2, 17.3)));
}

vec2 hexCenter(vec2 p){
  vec2 r = vec2(1.0, 1.7320508);
  vec2 h = r * 0.5;
  vec2 a = mod(p, r) - h;
  vec2 b = mod(p - h, r) - h;
  vec2 gv = dot(a, a) < dot(b, b) ? a : b;
  return p - gv;
}

vec2 fgrad(vec2 p, vec2 off){
  float e = 0.06;
  float gx = fbm(p + vec2(e, 0.0) + off) - fbm(p - vec2(e, 0.0) + off);
  float gy = fbm(p + vec2(0.0, e) + off) - fbm(p - vec2(0.0, e) + off);
  return vec2(gx, gy) / (2.0 * e);
}

float spreadF(float v, float g){ return clamp((v - 0.5) * g + 0.5, 0.0, 1.0); }
vec2 cmul(vec2 a, vec2 b){ return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
vec2 cdiv(vec2 a, vec2 b){ float d = dot(b, b) + 1e-6; return vec2(dot(a, b), a.y * b.x - a.x * b.y) / d; }

float fieldSmoke(vec2 p, float t){
  float w = max(u_warp, 1.0);
  vec2 a1 = vec2(sin(t * 0.2), cos(t * 0.17)) * 0.8;
  vec2 a2 = vec2(cos(t * 0.15), sin(t * 0.24)) * 0.8;
  vec2 q = vec2(fbm(p + a1), fbm(p + vec2(5.2, 1.3) - a2));
  vec2 r = vec2(fbm(p + w * 0.42 * q + vec2(1.7, 9.2) + a2),
               fbm(p + w * 0.42 * q + vec2(8.3, 2.8) - a1));
  float body = fbm(p + w * 0.5 * r);
  float fine = fbm(p * 2.4 + r * 1.6 + a1 * 0.4);
  float d = body * 0.72 + fine * 0.28;
  return pow(clamp((d - 0.15) * 1.65, 0.0, 1.0), 1.6);
}

float fieldKaleido(vec2 p, float t){
  float ang = atan(p.y, p.x);
  float rad = length(p);
  float sectors = 3.0 + floor(u_warp * 0.7);
  float seg = 6.2831853 / sectors;
  ang = mod(ang, seg);
  ang = abs(ang - 0.5 * seg);
  vec2 q = vec2(cos(ang), sin(ang)) * rad;
  return spreadF(fbm(q * 1.6 + vec2(t * 0.35, t * 0.12)), 1.6);
}

float fieldGrid(vec2 p, float t){
  float freq = 4.0 + u_warp * 1.4;
  float gx = sin(p.x * freq + t * 0.5);
  float gy = sin(p.y * freq - t * 0.5);
  float lines = max(gx, gy);
  float nodes = gx * gy;
  return spreadF(0.5 + 0.5 * mix(lines, nodes, 0.35), 1.5);
}

vec3 ramp4(float t, vec3 a, vec3 b, vec3 c, vec3 d){
  t = clamp(t, 0.0, 1.0);
  vec3 col = mix(a, b, smoothstep(0.0, 0.34, t));
  col = mix(col, c, smoothstep(0.33, 0.67, t));
  col = mix(col, d, smoothstep(0.66, 1.0, t));
  return col;
}

vec3 palChrome(float f){
  float band = sin(f * 22.0);
  vec3 c = vec3(0.10 + 0.82 * f) * (0.78 + 0.22 * band);
  float edge = pow(1.0 - abs(band), 4.0);
  vec3 sheen = 0.5 + 0.5 * cos(6.28318 * (f * 3.0 + vec3(0.0, 0.33, 0.67)));
  return c + sheen * edge * 0.22;
}

float fieldOf(int eng, vec2 p, float t, out vec2 disp){
  float d1 = 1.8 * sin(t * 0.12) + 1.2 * cos(t * 0.067);
  float d2 = 1.8 * cos(t * 0.10) + 1.2 * sin(t * 0.084);
  disp = vec2(0.5);
  if (eng == 6){ return fieldKaleido(p, t); }
  else if (eng == 8){ return fieldGrid(p, t); }
  else if (eng == 10){ return fieldSmoke(p, t); }
  vec2 m1 = vec2(d1, d2);
  vec2 m2 = vec2(d2, -d1);
  vec2 q = vec2(fbm(p + m1 * 0.5), fbm(p + vec2(5.2, 1.3) + m2 * 0.5));
  disp = vec2(
    fbm(p + u_warp * q + vec2(1.7, 9.2) + m1),
    fbm(p + u_warp * q + vec2(8.3, 2.8) + m2)
  );
  return spreadF(fbm(p + u_warp * disp), 1.5);
}

float blendField(float a, float b, int mode, float amt){
  float r;
  if (mode == 1){ r = a * b; }
  else if (mode == 2){ r = 1.0 - (1.0 - a) * (1.0 - b); }
  else if (mode == 3){ r = min(a + b, 1.0); }
  else if (mode == 4){ r = abs(a - b); }
  else if (mode == 5){ r = a < 0.5 ? 2.0 * a * b : 1.0 - 2.0 * (1.0 - a) * (1.0 - b); }
  else { r = b; }
  return mix(a, r, amt);
}

vec3 shadeMaterial(int mat, vec3 base, vec3 N, float fv){
  vec3 L = normalize(vec3(0.4, 0.7, 0.6));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float ndl = max(dot(N, L), 0.0);
  float ndh = max(dot(N, H), 0.0);
  float fres = pow(1.0 - max(N.z, 0.0), 2.5);
  vec3 col = base;
  if (mat == 2){
    vec3 env = mix(base * 0.15 + 0.02, base * 0.7 + 0.55, smoothstep(-0.6, 0.6, N.y));
    col = env + pow(ndh, 40.0) * 2.0 + fres * 0.5;
  }
  return col;
}

void main(){
  float mn = sqrt(u_res.x * u_res.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / mn;
  vec2 p = uv * u_scale * 3.0;

  if (u_mouseAmt > 0.001 && u_mouseMode > 0){
    vec2 mUv = (u_mouse * u_res - 0.5 * u_res) / mn;
    vec2 dv = uv - mUv;
    float md = length(dv);
    if (u_mouseMode == 1){
      vec2 nz = vec2(fbm(dv * 6.0 + u_time * 0.3), fbm(dv * 6.0 + vec2(7.3, 2.1) - u_time * 0.25)) - 0.5;
      float env = exp(-md * 9.0);
      float wave = cos((md + nz.x * 0.12) * 30.0 - u_time * 2.0);
      vec2 dir = normalize(dv / max(md, 0.0008) + nz * 0.9);
      p += dir * wave * env * u_mouseAmt * 0.08;
    } else if (u_mouseMode == 2){
      float env = exp(-md * 5.0);
      p -= dv * env * u_mouseAmt * 0.5;
    } else if (u_mouseMode == 3){
      float angle = u_mouseAmt * 3.0 * exp(-md * 4.0);
      float ca = cos(angle), sa = sin(angle);
      p += vec2(dv.x * ca - dv.y * sa, dv.x * sa + dv.y * ca) - dv;
    }
  }

  if (u_lens > 0 && u_lensAmt > 0.001){
    float lsc = u_scale * 1.5;
    vec2 w = p / lsc;
    vec2 lw = w;
    if (u_lens == 3){
      vec2 a = vec2(cos(u_time * 0.07), sin(u_time * 0.09)) * 0.45;
      lw = cdiv(w - a, vec2(1.0, 0.0) - cmul(vec2(a.x, -a.y), w));
      lw = clamp(lw, -8.0, 8.0);
    }
    p = mix(p, lw * lsc, u_lensAmt);
  }

  vec2 disp = vec2(0.5);
  float f = fieldOf(u_field, p, u_time, disp);
  f = smoothstep(0.08, 0.92, f);

  vec3 col = ramp4(f, u_c0, u_c1, u_c2, u_c3);
  col += smoothstep(0.72, 1.0, f) * 0.12;

  if (u_material > 0){
    vec2 grd = vec2(dFdx(f), dFdy(f)) * u_res.y * 0.06;
    col = shadeMaterial(u_material, col, normalize(vec3(-grd, 1.0)), f);
  }

  float grPhase = mod(floor(u_time * 10.0), 61.0) * 1.7;
  float gr = hash(gl_FragCoord.xy * 0.731 + grPhase) - 0.5;
  col += gr * u_grain;
  col *= 1.0 - 0.22 * dot(uv, uv);

  gl_FragColor = vec4(col, 1.0);
}`;

const P = {
  speed: 0.85,
  scale: 1.55,
  warp: 0,
  sym: 0,
  pixel: 31,
  dots: 0,
  dot: 13,
  thresh: 0.15,
  grain: 0.15,
  pal: 8,
  cols: [
    [0.2988, 0.6706, 0.83],
    [1.0, 0.9307, 0.9712],
    [0.5569, 0.6431, 0.6039],
    [0.7195, 0.8151, 0.6017],
  ],
  field: 10,
  field2: 6,
  blend: 2,
  layerMix: 0,
  field3: 8,
  blend2: 4,
  layerMix2: 0,
  screen: 0,
  material: 2,
  seed: 21.21,
  lens: 3,
  lensAmt: 0.25,
};

export const FluidBackground: React.FC<FluidBackgroundProps> = ({
  enabled = true,
  opacity = 0.35,
  speed = 0.85,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, amt: 0 });
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const cv = canvasRef.current;
    if (!cv) return;

    const gl = cv.getContext('webgl', { antialias: false, powerPreference: 'low-power' }) ||
               (cv.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      setHasWebGL(false);
      return;
    }

    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) {
      // standard derivatives not supported, fallback cleanly
    }

    function createShader(type: number, src: string) {
      const sh = gl!.createShader(type);
      if (!sh) return null;
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      return sh;
    }

    const vShader = createShader(gl.VERTEX_SHADER, VS);
    const fShader = createShader(gl.FRAGMENT_SHADER, FS);
    if (!vShader || !fShader) return;

    const pr = gl.createProgram();
    if (!pr) return;
    gl.attachShader(pr, vShader);
    gl.attachShader(pr, fShader);
    gl.linkProgram(pr);

    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      console.warn('Fluid shader link failed');
      return;
    }

    gl.useProgram(pr);

    const bf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const al = gl.getAttribLocation(pr, 'a_pos');
    gl.enableVertexAttribArray(al);
    gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);

    const U: Record<string, WebGLUniformLocation | null> = {};
    'u_res u_time u_seed u_scale u_warp u_lens u_lensAmt u_sym u_pixel u_dots u_dot u_dither u_grain u_pal u_c0 u_c1 u_c2 u_c3 u_hasTex u_texAspect u_liq u_mix u_split u_field u_field2 u_blend u_layerMix u_field3 u_blend2 u_layerMix2 u_screen u_material u_pan u_mouse u_mouseAmt u_mouseMode u_rec u_hasMask u_maskBg'.split(' ').forEach((n) => {
      U[n] = gl.getUniformLocation(pr, n);
    });

    gl.uniform1f(U['u_seed'], P.seed);
    gl.uniform1f(U['u_scale'], P.scale);
    gl.uniform1f(U['u_warp'], P.warp);
    gl.uniform1f(U['u_sym'], P.sym);
    gl.uniform1f(U['u_dots'], P.dots);
    gl.uniform1f(U['u_dither'], P.thresh);
    gl.uniform1f(U['u_grain'], P.grain);
    gl.uniform1i(U['u_pal'], P.pal);
    gl.uniform3f(U['u_c0'], P.cols[0][0], P.cols[0][1], P.cols[0][2]);
    gl.uniform3f(U['u_c1'], P.cols[1][0], P.cols[1][1], P.cols[1][2]);
    gl.uniform3f(U['u_c2'], P.cols[2][0], P.cols[2][1], P.cols[2][2]);
    gl.uniform3f(U['u_c3'], P.cols[3][0], P.cols[3][1], P.cols[3][2]);
    gl.uniform1f(U['u_hasTex'], 0);
    gl.uniform1f(U['u_texAspect'], 1);
    gl.uniform1f(U['u_liq'], 0);
    gl.uniform1f(U['u_mix'], 0);
    gl.uniform1f(U['u_split'], 0);
    gl.uniform1i(U['u_field'], P.field);
    gl.uniform1i(U['u_field2'], P.field2);
    gl.uniform1i(U['u_blend'], P.blend);
    gl.uniform1f(U['u_layerMix'], P.layerMix);
    gl.uniform1i(U['u_field3'], P.field3);
    gl.uniform1i(U['u_blend2'], P.blend2);
    gl.uniform1f(U['u_layerMix2'], P.layerMix2);
    gl.uniform1i(U['u_screen'], P.screen);
    gl.uniform1i(U['u_material'], P.material);
    gl.uniform1i(U['u_lens'], P.lens || 0);
    gl.uniform1f(U['u_lensAmt'], P.lensAmt == null ? 1 : P.lensAmt);
    gl.uniform2f(U['u_pan'], 0, 0);
    gl.uniform1i(U['u_mouseMode'], 1);
    gl.uniform1f(U['u_rec'], 0);
    gl.uniform1f(U['u_hasMask'], 0);
    gl.uniform3f(U['u_maskBg'], 0.05, 0.05, 0.06);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    function resize() {
      if (!cv) return;
      const w = Math.round(cv.clientWidth * dpr);
      const h = Math.round(cv.clientHeight * dpr);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      gl!.viewport(0, 0, cv.width, cv.height);
      gl!.uniform2f(U['u_res'], cv.width, cv.height);
      gl!.uniform1f(U['u_pixel'], P.pixel <= 1.5 ? 1.0 : P.pixel * dpr);
      gl!.uniform1f(U['u_dot'], P.dot * dpr);
    }

    window.addEventListener('resize', resize);
    resize();

    let animId: number;
    let st: number | null = null;

    function render(now: number) {
      if (st === null) st = now;
      gl!.uniform1f(U['u_time'], (now - st) * 0.001 * (P.speed * (speed / 0.85)));
      gl!.uniform2f(U['u_mouse'], mouseRef.current.x, mouseRef.current.y);
      gl!.uniform1f(U['u_mouseAmt'], mouseRef.current.amt);

      // Smooth decay of mouse amt
      mouseRef.current.amt *= 0.95;

      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    const handlePointerMove = (e: PointerEvent) => {
      if (!cv) return;
      const rect = cv.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouseRef.current.amt = Math.min(mouseRef.current.amt + 0.3, 1.0);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      if (pr) gl.deleteProgram(pr);
      if (vShader) gl.deleteShader(vShader);
      if (fShader) gl.deleteShader(fShader);
      if (bf) gl.deleteBuffer(bf);
    };
  }, [enabled, speed]);

  if (!enabled || !hasWebGL) {
    return (
      <div 
        className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-tr from-slate-950 via-gray-900 to-indigo-950/40"
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-opacity duration-700 ease-out"
      style={{ opacity }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ filter: 'blur(1px)' }}
      />
      {/* Subtle radial vignette overlay for contrast and focus */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
    </div>
  );
};

export default FluidBackground;
