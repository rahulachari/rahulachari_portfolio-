/**
 * Liquid Metal Button — Vanilla JS
 * ================================
 * Applies a WebGL liquid metal shader effect to all .btn elements.
 * Ported from a React/TSX component using @paper-design/shaders.
 *
 * Each button gets a multi-layered 3D-perspective structure:
 *   Z=25  Click layer (transparent, handles all interactions)
 *   Z=20  Label layer (text + icons, pointer-events: none)
 *   Z=10  Inner dark pill (linear-gradient #202020→#000)
 *   Z=0   Shader layer (WebGL liquid metal canvas)
 *
 * The original <a> element is replaced with this structure.
 * If the shader library fails to load, buttons remain in their
 * original CSS-styled state (graceful degradation).
 */

import { ShaderMount, liquidMetalFragmentShader } from 'https://esm.sh/@paper-design/shaders';

/* ──────────────────────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────────────────────── */

const UNIFORMS = {
  u_repetition: 4,
  u_softness: 0.5,
  u_shiftRed: 0.3,
  u_shiftBlue: 0.3,
  u_distortion: 0,
  u_contour: 0,
  u_angle: 45,
  u_scale: 8,
  u_shape: 1,
  u_offsetX: 0.1,
  u_offsetY: -0.1,
};

const SPEED = { idle: 0.6, hover: 1.0, click: 2.4 };

const SHADOW = {
  idle:
    '0px 0px 0px 1px rgba(0,0,0,0.3),' +
    '0px 36px 14px 0px rgba(0,0,0,0.02),' +
    '0px 20px 12px 0px rgba(0,0,0,0.08),' +
    '0px 9px 9px 0px rgba(0,0,0,0.12),' +
    '0px 2px 5px 0px rgba(0,0,0,0.15)',
  hover:
    '0px 0px 0px 1px rgba(0,0,0,0.4),' +
    '0px 12px 6px 0px rgba(0,0,0,0.05),' +
    '0px 8px 5px 0px rgba(0,0,0,0.1),' +
    '0px 4px 4px 0px rgba(0,0,0,0.15),' +
    '0px 1px 2px 0px rgba(0,0,0,0.2)',
  pressed:
    '0px 0px 0px 1px rgba(0,0,0,0.5),' +
    '0px 1px 2px 0px rgba(0,0,0,0.3)',
};

/* ──────────────────────────────────────────────────────────────
   LiquidMetalBtn class
   ────────────────────────────────────────────────────────────── */

class LiquidMetalBtn {
  constructor(el) {
    this.original = el;
    this.hovered = false;
    this.pressed = false;
    this.shader = null;

    // Read computed style from the original button
    const cs = getComputedStyle(el);
    this.padding = {
      top: cs.paddingTop,
      right: cs.paddingRight,
      bottom: cs.paddingBottom,
      left: cs.paddingLeft,
    };
    this.fontSize = cs.fontSize;
    this.fontFamily = cs.fontFamily;
    this.fontWeight = cs.fontWeight;

    // Preserve original element attributes
    this.html = el.innerHTML;
    this.href = el.getAttribute('href');
    this.target = el.getAttribute('target');
    this.rel = el.getAttribute('rel');
    this.ariaLabel = el.textContent.replace(/\s+/g, ' ').trim();

    this._build();
    this._initShader();
    this._bind();
  }

  /* ── DOM construction ── */

  _build() {
    // Wrapper (flex item that replaces the original button)
    this.wrap = this._el('div', 'lm-wrap');

    // Perspective root
    const persp = this._el('div', 'lm-perspective');

    // Main container — sized by padding + label content
    this.container = this._el('div', 'lm-container');
    Object.assign(this.container.style, {
      paddingTop: this.padding.top,
      paddingRight: this.padding.right,
      paddingBottom: this.padding.bottom,
      paddingLeft: this.padding.left,
    });

    // ── Layer 1: Label (z=20) ──
    this.labelEl = this._el('div', 'lm-label');
    this.labelEl.innerHTML = this.html;
    Object.assign(this.labelEl.style, {
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fontWeight: this.fontWeight,
    });

    // ── Layer 2: Inner dark pill (z=10) ──
    this.innerLayer = this._el('div', 'lm-inner-layer');
    this.innerFill = this._el('div', 'lm-inner-fill');
    this.innerLayer.appendChild(this.innerFill);

    // ── Layer 3: Shader (z=0) ──
    this.shaderLayer = this._el('div', 'lm-shader-layer');
    this.shaderOutline = this._el('div', 'lm-shader-outline');
    this.shaderOutline.style.boxShadow = SHADOW.idle;
    this.shaderMountEl = this._el('div', 'lm-shader-mount');
    this.shaderOutline.appendChild(this.shaderMountEl);
    this.shaderLayer.appendChild(this.shaderOutline);

    // ── Layer 4: Click surface (z=25) ──
    const tag = this.original.tagName.toLowerCase();
    this.clickEl = document.createElement(tag);
    this.clickEl.className = 'lm-click';
    if (this.href) this.clickEl.setAttribute('href', this.href);
    if (this.target) this.clickEl.setAttribute('target', this.target);
    if (this.rel) this.clickEl.setAttribute('rel', this.rel);
    this.clickEl.setAttribute('aria-label', this.ariaLabel);

    // Screen-reader text
    const srSpan = this._el('span', 'sr-only');
    srSpan.textContent = this.ariaLabel;
    this.clickEl.appendChild(srSpan);

    // Assemble layers
    this.container.append(
      this.labelEl,
      this.innerLayer,
      this.shaderLayer,
      this.clickEl
    );
    persp.appendChild(this.container);
    this.wrap.appendChild(persp);

    // Replace original element in the DOM
    this.original.parentNode.insertBefore(this.wrap, this.original);
    this.original.remove();
  }

  /* ── Shader initialisation ── */

  _initShader() {
    // Wait one frame so the mount element has computed dimensions
    requestAnimationFrame(() => {
      try {
        this.shader = new ShaderMount(
          this.shaderMountEl,
          liquidMetalFragmentShader,
          { ...UNIFORMS },
          undefined,
          0 // Start paused
        );

        // Performance Optimization: Only animate when visible in viewport
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (!this.hovered) this.shader?.setSpeed?.(SPEED.idle);
              else this.shader?.setSpeed?.(SPEED.hover);
            } else {
              this.shader?.setSpeed?.(0);
            }
          });
        }, { rootMargin: '100px' });
        
        this.observer.observe(this.wrap);

      } catch (e) {
        console.warn('[LiquidMetal] Shader init failed:', e);
      }
    });
  }

  /* ── Event binding ── */

  _bind() {
    const click = this.clickEl;

    // ─ Mouse events ─
    click.addEventListener('mouseenter', () => {
      this.hovered = true;
      this.shader?.setSpeed?.(SPEED.hover);
      this.shaderOutline.style.boxShadow = SHADOW.hover;
    });

    click.addEventListener('mouseleave', () => {
      this.hovered = false;
      this.pressed = false;
      this.shader?.setSpeed?.(SPEED.idle);
      this._resetPress();
      this.shaderOutline.style.boxShadow = SHADOW.idle;
    });

    click.addEventListener('mousedown', () => {
      this.pressed = true;
      this._applyPress();
    });

    click.addEventListener('mouseup', () => {
      this.pressed = false;
      this._resetPress();
      if (this.hovered) {
        this.shaderOutline.style.boxShadow = SHADOW.hover;
      }
    });

    // ─ Touch events (mobile) ─
    click.addEventListener(
      'touchstart',
      () => {
        this.hovered = true;
        this.pressed = true;
        this.shader?.setSpeed?.(SPEED.hover);
        this._applyPress();
      },
      { passive: true }
    );

    click.addEventListener(
      'touchend',
      () => {
        this.pressed = false;
        this.hovered = false;
        this._resetPress();
        this.shaderOutline.style.boxShadow = SHADOW.idle;
        setTimeout(() => {
          this.shader?.setSpeed?.(SPEED.idle);
        }, 300);
      },
      { passive: true }
    );

    // ─ Click (works for both mouse and touch) ─
    click.addEventListener('click', (e) => {
      // Shader speed burst
      if (this.shader?.setSpeed) {
        this.shader.setSpeed(SPEED.click);
        setTimeout(() => {
          this.shader?.setSpeed?.(
            this.hovered ? SPEED.hover : SPEED.idle
          );
        }, 300);
      }

      // Ripple effect
      const rect = click.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = this._el('span', 'lm-ripple');
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      click.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  /* ── Press state helpers ── */

  _applyPress() {
    this.innerLayer.style.transform =
      'translateZ(10px) translateY(1px) scale(0.98)';
    this.shaderLayer.style.transform =
      'translateZ(0px) translateY(1px) scale(0.98)';
    this.innerFill.style.boxShadow =
      'inset 0px 2px 4px rgba(0,0,0,0.4), inset 0px 1px 2px rgba(0,0,0,0.3)';
    this.shaderOutline.style.boxShadow = SHADOW.pressed;
  }

  _resetPress() {
    this.innerLayer.style.transform =
      'translateZ(10px) translateY(0) scale(1)';
    this.shaderLayer.style.transform =
      'translateZ(0px) translateY(0) scale(1)';
    this.innerFill.style.boxShadow = 'none';
  }

  /* ── Utility ── */

  _el(tag, cls) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }
}

/* ──────────────────────────────────────────────────────────────
   Initialisation
   ────────────────────────────────────────────────────────────── */

function initAllLiquidMetalButtons() {
  const buttons = document.querySelectorAll('button:not(#mobile-hamburger-btn), .btn:not(#mobile-hamburger-btn), .hz-btn, .hz-btn-outline');
  if (buttons.length === 0) return;

  buttons.forEach((btn) => {
    try {
      new LiquidMetalBtn(btn);
    } catch (e) {
      console.warn('[LiquidMetal] Failed for button:', btn.textContent, e);
    }
  });

  console.log(`[LiquidMetal] Transformed ${buttons.length} button(s)`);
}

// Module scripts are deferred — DOM is ready when this runs
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllLiquidMetalButtons);
} else {
  initAllLiquidMetalButtons();
}
