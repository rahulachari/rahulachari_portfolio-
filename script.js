/* ==========================================================================
   RAHUL ACHARI YC — ANTIGRAVITY & REACT BITS PILLNAV SYSTEM
   1. React Bits <Antigravity /> 3D Instanced Canvas Engine
   2. React Bits <PillNav /> GSAP Pill Circle Expansion & Label Hover Animation
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     1. PRELOADER
     ======================================================================== */
  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloader-fill');
  const siteWrapper = document.getElementById('site-wrapper');

  let loadProgress = 0;
  const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 22 + 10;
    if (loadProgress >= 100) loadProgress = 100;
    if (preloaderFill) preloaderFill.style.width = loadProgress + '%';
    if (loadProgress >= 100) {
      clearInterval(loadInterval);
      setTimeout(() => {
        if (preloader) preloader.classList.add('hidden');
        if (siteWrapper) siteWrapper.classList.add('visible');
        setTimeout(initScrollAnimations, 150);
        setTimeout(initPillNav, 200);
        setTimeout(initMarqueeScroll, 300);
      }, 250);
    }
  }, 35);




  /* ========================================================================
     2. MESH GRADIENT SHADER BACKGROUND (Vanilla Three.js Port)
     ======================================================================== */
  function initMeshGradient() {
    const canvas = document.getElementById('mesh-gradient-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();

    // Orthographic camera works best for full-screen 2D shader planes
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resize);
    resize();

    // Rich, professional pastel palette (Lavender & Light Blue)
    // This is highly visible but keeps the dark text readable
    const color1 = new THREE.Color('#c2c9fb'); // Rich soft periwinkle/blue
    const color2 = new THREE.Color('#e0c3fc'); // Soft rich lavender

    // Optionally add a 3rd color if you want to extend the shader, but we stick to the provided one
    // The provided shader uses color1 and color2, we'll pass an extra "intensity" uniform.

    const vertexShader = `
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        vec3 pos = position;
        pos.y += sin(pos.x * 10.0 + time) * 0.1 * intensity;
        pos.x += cos(pos.y * 8.0 + time * 1.5) * 0.05 * intensity;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float time;
      uniform float intensity;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vec2 uv = vUv;
        
        // Create animated noise pattern
        float noise = sin(uv.x * 20.0 + time) * cos(uv.y * 15.0 + time * 0.8);
        noise += sin(uv.x * 35.0 - time * 2.0) * cos(uv.y * 25.0 + time * 1.2) * 0.5;
        
        // Mix colors based on noise and position
        vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
        color = mix(color, vec3(1.0), pow(abs(noise), 2.0) * intensity);
        
        // Add glow effect
        float glow = 1.0 - length(uv - 0.5) * 2.0;
        glow = pow(glow, 2.0);
        
        gl_FragColor = vec4(color * glow, glow * 0.8);
      }
    `;

    const uniforms = {
      time: { value: 0 },
      intensity: { value: 1.0 },
      color1: { value: color1 },
      color2: { value: color2 }
    };

    const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();

    function render() {
      requestAnimationFrame(render);
      const elapsedTime = clock.getElapsedTime();

      uniforms.time.value = elapsedTime;
      uniforms.intensity.value = 1.6 + Math.sin(elapsedTime * 1.5) * 0.4; // Stronger intensity for visibility

      renderer.render(scene, camera);
    }
    render();
  }

  /* ========================================================================
     3. PILL NAV SYSTEM & MOBILE MENU
     ======================================================================== */
  function initPillNav() {
    // 1. Mobile popover toggle
    const mobileBtn = document.getElementById('mobile-hamburger-btn');
    const mobilePopover = document.getElementById('mobile-popover-menu');
    let isMenuOpen = false;

    if (mobileBtn && mobilePopover) {
      mobileBtn.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        const lines = mobileBtn.querySelectorAll('.hamburger-line');

        if (typeof gsap !== 'undefined') {
          if (isMenuOpen) {
            gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease: 'power2.out' });
            gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease: 'power2.out' });
            gsap.set(mobilePopover, { visibility: 'visible' });
            gsap.fromTo(mobilePopover, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
          } else {
            gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: 'power2.out' });
            gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: 'power2.out' });
            gsap.to(mobilePopover, {
              opacity: 0, y: 10, duration: 0.25, ease: 'power2.out', onComplete: () => {
                gsap.set(mobilePopover, { visibility: 'hidden' });
              }
            });
          }
        }
      });

      mobilePopover.querySelectorAll('.mobile-menu-link').forEach(link => {
        link.addEventListener('click', () => {
          if (isMenuOpen) {
            mobileBtn.click();
          }
        });
      });
    }

    // 2. Desktop GSAP PillNav Hover Effects
    const pills = document.querySelectorAll('.pill-list .pill');
    if (!pills.length || typeof gsap === 'undefined') return;

    const tlRefs = [];
    const activeTweenRefs = [];
    const ease = 'power3.easeOut';

    function layout() {
      pills.forEach((pill, i) => {
        const circle = pill.querySelector('.hover-circle');
        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');
        if (!circle || !label || !white) return;

        const rect = pill.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        gsap.set(label, { y: 0 });
        gsap.set(white, { y: h + 12, opacity: 0 });

        if (tlRefs[i]) tlRefs[i].kill();

        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);
        tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);

        gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);

        tlRefs[i] = tl;
      });
    }

    layout();
    window.addEventListener('resize', layout);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(layout).catch(() => { });
    }

    // Expose handlers for HTML inline attributes
    window.pillEnter = function (i) {
      const tl = tlRefs[i];
      if (!tl) return;
      if (activeTweenRefs[i]) activeTweenRefs[i].kill();
      activeTweenRefs[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' });
    };

    window.pillLeave = function (i) {
      const tl = tlRefs[i];
      if (!tl) return;
      if (activeTweenRefs[i]) activeTweenRefs[i].kill();
      activeTweenRefs[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' });
    };
  }


  /* ========================================================================
     4. GSAP SCROLL ANIMATIONS (Silky 60fps Smooth Scroll)
     ======================================================================== */
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const els = document.querySelectorAll('[data-scroll]');

    els.forEach(el => {
      const delay = parseFloat(el.dataset.delay || 0);

      gsap.fromTo(el,
        {
          opacity: 0,
          y: 35
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true // Runs once cleanly to prevent scrollbar lag or sticking
          }
        }
      );
    });

    // Custom Observer for Spidey Animation
    const spideyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('play');
          spideyObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const spideyEl = document.querySelector('.spidey-animation');
    if (spideyEl) {
      spideyObserver.observe(spideyEl);
    }
  }


  /* ========================================================================
     5. HERO TYPING EFFECT
     ======================================================================== */
  const heroTyped = document.getElementById('hero-typed');
  if (heroTyped) {
    const phrases = [
      'predictive ML models',
      'autonomous AI agents',
      'intelligent OCR tools',
      'full-stack AI apps'
    ];
    let phraseIdx = 0, charIdx = 0, deleting = false, speed = 80;

    function type() {
      const current = phrases[phraseIdx];
      if (deleting) {
        heroTyped.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        speed = 35;
      } else {
        heroTyped.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        speed = 75;
      }

      if (!deleting && charIdx === current.length) {
        deleting = true;
        speed = 2800;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        speed = 500;
      }

      setTimeout(type, speed);
    }
    setTimeout(type, 1200);
  }

  // Initialize systems when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initMeshGradient();
      initPillNav();
    });
  } else {
    setTimeout(() => {
      initMeshGradient();
      initPillNav();
    }, 100);
  }

  function initMarqueeScroll() {
    const marquee = document.querySelector('.icon-marquee-track');
    if (!marquee) return;

    let baseSpeed = 1.2;
    let currentSpeed = baseSpeed;
    let targetSpeed = baseSpeed;
    let position = 0;
    let lastScrollY = window.scrollY;
    let scrollTimeout;

    function getTrackWidth() {
      return marquee.scrollWidth / 3;
    }

    window.addEventListener("scroll", () => {
      let currentScrollY = window.scrollY;
      let delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (Math.abs(delta) < 1) return;

      let direction = delta > 0 ? 1 : -1;
      let scrollBoost = Math.min(Math.abs(delta) * 0.15, 12);
      targetSpeed = direction * (baseSpeed + scrollBoost);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        targetSpeed = baseSpeed;
      }, 200);
    });

    function tick() {
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;

      position -= currentSpeed;

      let trackWidth = getTrackWidth();

      // Guard against zero width (hidden element)
      if (trackWidth > 0) {
        if (position <= -trackWidth) {
          position += trackWidth;
        } else if (position >= 0) {
          position -= trackWidth;
        }
        marquee.style.transform = `translateX(${position}px)`;
      }

      requestAnimationFrame(tick);
    }

    // Start with a small negative offset so the loop wraps correctly from the start
    let tw = getTrackWidth();
    if (tw > 0) position = -1;

    tick();
  }

})();
