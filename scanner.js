import { Renderer, Program, Mesh, Triangle } from 'https://esm.sh/ogl';

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const directionToFloat = dir => (dir === 'horizontal' ? 1.0 : dir === 'diagonal' ? 2.0 : 0.0);

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uSweepSpeed;
uniform float uSweepWidth;
uniform float uSweepFalloff;
uniform float uScale;
uniform float uFrequency;
uniform float uRipple;
uniform float uBandDensity;
uniform float uLineSharpness;
uniform float uGlow;
uniform float uColorSpread;
uniform float uBrightness;
uniform float uContrast;
uniform float uSoftness;
uniform float uVignette;
uniform float uOpacity;
uniform float uScanline;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uDirection;
uniform vec2 uMouse;
uniform float uMouseEnabled;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseActive;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

const float TAU = 6.2831853;

float signalField(vec2 p, float t) {
  float w = sin(p.x * 1.3 + t * 0.7);
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;
  return w * 0.35;
}

vec3 palette(float f) {
  f = clamp(f, 0.0, 1.0);
  f = pow(f, uContrast);
  vec3 c = mix(uColor1, uColor2, smoothstep(0.08, 0.6, f));
  return mix(c, uColor3, smoothstep(0.68, 1.0, f));
}

float scanBand(float x, float aa, float sharp) {
  float v = mix(0.5, 0.5 + 0.5 * cos(x * TAU), aa);
  return pow(v, sharp);
}

void main() {
  float aspect = iResolution.x / iResolution.y;
  vec2 uv0 = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv0 / max(uScale, 0.001);

  float t = iTime * uSpeed;

  float mouseBoost = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mUv = vec2((uMouse.x * 2.0 - 1.0) * aspect, uMouse.y * 2.0 - 1.0);
    vec2 md = uv0 - mUv;
    float r = max(uMouseRadius, 0.001);
    mouseBoost = exp(-dot(md, md) / (r * r)) * uMouseStrength * uMouseActive;
  }

  float axis;
  if (uDirection < 0.5) axis = p.y;
  else if (uDirection < 1.5) axis = p.x;
  else axis = (p.x + p.y) * 0.70710678;

  float sig = signalField(p * uFrequency, t);
  float coord = axis + sig * uRipple;

  float phase = coord / max(uSweepWidth, 0.05) - t * uSweepSpeed;
  float sweep = pow(0.5 + 0.5 * cos(phase * TAU), max(uSweepFalloff, 0.1));

  float lc = coord * uBandDensity;
  float aa = 1.0 / (1.0 + uSoftness * fwidth(lc) * 3.0);
  aa = clamp(aa * (1.0 + mouseBoost * 0.6), 0.0, 1.0);

  float bodyBase = clamp(0.5 + 0.5 * sig, 0.0, 1.0);
  float body = bodyBase * bodyBase * uGlow * sweep;

  float sharp = max(uLineSharpness, 0.1);
  float split = uColorSpread * 0.16;
  float fr = clamp(scanBand(lc + split, aa, sharp) * sweep + body, 0.0, 1.0);
  float fg = clamp(scanBand(lc, aa, sharp) * sweep + body, 0.0, 1.0);
  float fb = clamp(scanBand(lc - split, aa, sharp) * sweep + body, 0.0, 1.0);

  vec3 col = vec3(palette(fr).r, palette(fg).g, palette(fb).b);

  float inten = (fr + fg + fb) * 0.3333333 * uBrightness;
  inten *= 1.0 + mouseBoost * 0.9;

  if (uScanline > 0.5) {
    inten *= 1.0 - 0.18 * (0.5 + 0.5 * cos(gl_FragCoord.y * 1.7));
  }

  if (uGrain > 0.5) {
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
    inten += (g - 0.5) * uGrainIntensity;
  }

  inten *= clamp(1.0 - uVignette * smoothstep(0.55, 1.65, length(uv0)), 0.0, 1.0);
  inten = clamp(inten, 0.0, 1.0);

  float a = clamp(inten * uOpacity, 0.0, 1.0);
  fragColor = vec4(clamp(col, 0.0, 1.0) * a, a);
}
`;

export default class Scanner {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = {
      color1: '#134595',
      color2: '#264a86',
      color3: '#FFFFFF',
      speed: 0.5,
      sweepSpeed: 0.25,
      sweepWidth: 1.6,
      sweepFalloff: 6,
      scale: 1.5,
      frequency: 2,
      ripple: 0.22,
      bandDensity: 11,
      lineSharpness: 5.5,
      glow: 0.22,
      scanDirection: 'vertical',
      colorSpread: 0.7,
      brightness: 1.0,
      contrast: 1.15,
      softness: 1.4,
      vignette: 0.45,
      scanline: true,
      grain: true,
      grainIntensity: 0.05,
      opacity: 1.0,
      mouseInteraction: true,
      mouseRadius: 0.5,
      mouseStrength: 0.5,
      ...options
    };

    this.init();
  }

  init() {
    this.renderer = new Renderer({
      webgl: 2,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });

    const gl = this.renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    this.canvas = gl.canvas;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '0';
    this.canvas.style.pointerEvents = 'none';

    this.container.prepend(this.canvas);

    const geometry = new Triangle(gl);
    const c1 = hexToRgb(this.options.color1);
    const c2 = hexToRgb(this.options.color2);
    const c3 = hexToRgb(this.options.color3);

    this.program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: this.options.speed },
        uSweepSpeed: { value: this.options.sweepSpeed },
        uSweepWidth: { value: this.options.sweepWidth },
        uSweepFalloff: { value: this.options.sweepFalloff },
        uScale: { value: this.options.scale },
        uFrequency: { value: this.options.frequency },
        uRipple: { value: this.options.ripple },
        uBandDensity: { value: this.options.bandDensity },
        uLineSharpness: { value: this.options.lineSharpness },
        uGlow: { value: this.options.glow },
        uColorSpread: { value: this.options.colorSpread },
        uBrightness: { value: this.options.brightness },
        uContrast: { value: this.options.contrast },
        uSoftness: { value: this.options.softness },
        uVignette: { value: this.options.vignette },
        uOpacity: { value: this.options.opacity },
        uScanline: { value: this.options.scanline ? 1.0 : 0.0 },
        uGrain: { value: this.options.grain ? 1.0 : 0.0 },
        uGrainIntensity: { value: this.options.grainIntensity },
        uDirection: { value: directionToFloat(this.options.scanDirection) },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseEnabled: { value: this.options.mouseInteraction ? 1.0 : 0.0 },
        uMouseRadius: { value: this.options.mouseRadius },
        uMouseStrength: { value: this.options.mouseStrength },
        uMouseActive: { value: 0.0 },
        uColor1: { value: new Float32Array(c1) },
        uColor2: { value: new Float32Array(c2) },
        uColor3: { value: new Float32Array(c3) }
      }
    });

    this.mesh = new Mesh(gl, { geometry: geometry, program: this.program });

    this.setSize = () => {
      const rect = this.container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      this.renderer.setSize(w, h);
      const res = this.program.uniforms.iResolution.value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      this.renderer.render({ scene: this.mesh });
    };

    this.ro = new ResizeObserver(() => this.setSize());
    this.ro.observe(this.container);
    this.setSize();

    this.currentMouse = [0.5, 0.5];
    this.targetMouse = [0.5, 0.5];
    this.mouseActive = 0;
    this.targetMouseActive = 0;

    this.onMouseMove = e => {
      const rect = this.canvas.getBoundingClientRect();
      this.targetMouse = [(e.clientX - rect.left) / rect.width, 1.0 - (e.clientY - rect.top) / rect.height];
      this.targetMouseActive = 1;
    };
    this.onMouseLeave = () => {
      this.targetMouseActive = 0;
    };
    
    // Bind to container since canvas has pointerEvents: none
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('mouseleave', this.onMouseLeave);

    this.raf = 0;
    this.isVisible = true;
    this.isPageVisible = !document.hidden;
    this.t0 = performance.now();

    this.loop = (t) => {
      this.program.uniforms.iTime.value = (t - this.t0) * 0.001;

      if (!this.options.mouseInteraction) {
        this.targetMouseActive = 0;
      }
      this.currentMouse[0] += 0.05 * (this.targetMouse[0] - this.currentMouse[0]);
      this.currentMouse[1] += 0.05 * (this.targetMouse[1] - this.currentMouse[1]);
      this.program.uniforms.uMouse.value[0] = this.currentMouse[0];
      this.program.uniforms.uMouse.value[1] = this.currentMouse[1];
      this.mouseActive += 0.05 * (this.targetMouseActive - this.mouseActive);
      this.program.uniforms.uMouseActive.value = this.mouseActive;

      this.renderer.render({ scene: this.mesh });
      this.raf = requestAnimationFrame(this.loop);
    };

    this.tryStart = () => {
      if (this.isVisible && this.isPageVisible && this.raf === 0) this.raf = requestAnimationFrame(this.loop);
    };
    this.tryStop = () => {
      if (this.raf !== 0) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
    };

    this.io = new IntersectionObserver(
      ([entry]) => {
        this.isVisible = entry.isIntersecting;
        this.isVisible ? this.tryStart() : this.tryStop();
      },
      { threshold: 0 }
    );
    this.io.observe(this.container);

    this.onVisibility = () => {
      this.isPageVisible = !document.hidden;
      this.isPageVisible ? this.tryStart() : this.tryStop();
    };
    document.addEventListener('visibilitychange', this.onVisibility);

    this.tryStart();
  }
}
