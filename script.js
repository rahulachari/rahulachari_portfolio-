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
  const loaderCounter = document.getElementById('loader-counter');
  const siteWrapper = document.getElementById('site-wrapper');

  let loadProgress = 0;
  const loadInterval = setInterval(() => {
    // Slower increment at the beginning, faster at the end
    let increment = Math.random() * 5 + 1;
    if (loadProgress > 70) increment = Math.random() * 10 + 5;
    
    loadProgress += increment;
    
    if (loadProgress >= 100) loadProgress = 100;
    
    if (loaderCounter) loaderCounter.innerText = Math.floor(loadProgress);
    
    if (loadProgress >= 100) {
      clearInterval(loadInterval);
      setTimeout(() => {
        if (preloader) preloader.classList.add('slide-up');
        if (siteWrapper) siteWrapper.classList.add('visible');
        
        setTimeout(() => {
          if (preloader) preloader.style.display = 'none';
        }, 1000); // Wait for slide-up animation

        setTimeout(initScrollAnimations, 150);
        setTimeout(initPillNav, 200);
        setTimeout(initMarqueeScroll, 300);
        
        // Trigger hero staggered text animation
        if (typeof window.playHeroAnimation === 'function') {
           window.playHeroAnimation();
        }
      }, 300);
    }
  }, 40);




  /* ========================================================================
     2. MESH GRADIENT SHADER BACKGROUND (Vanilla Three.js Port)
     ======================================================================== */
  function initMeshGradient() {
    // Disable on mobile to improve performance
    if (window.innerWidth <= 768) return;

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
     4. GSAP SCROLL ANIMATIONS & LENIS & SCROLLSTACK
     ======================================================================== */
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Synchronize Lenis scrolling with GSAP's ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    initLenis();

    if (typeof ScrollStackManager !== 'undefined') {
      new ScrollStackManager({
        itemDistance: 100,
        itemScale: 0.03,
        itemStackDistance: 30,
        stackPosition: '20%',
        scaleEndPosition: '10%',
        baseScale: 0.85,
        rotationAmount: 0,
        blurAmount: 0,
      });
    }

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
            once: true
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

    initHorizontalScroll();
  }

  /* ========================================================================
     4B. GSAP HORIZONTAL PIN SCROLL (Native Hardware Composited Pinning)
     ======================================================================== */
  function initHorizontalScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const pinWrapper = document.getElementById('hz-pin-wrapper');
    const track = document.getElementById('hz-projects-track');

    if (!pinWrapper || !track) return;

    const getScrollAmount = () => {
      const trackWidth = track.scrollWidth;
      const offset = window.innerWidth <= 768 ? 20 : window.innerWidth * 0.05;
      return -(trackWidth - window.innerWidth + offset);
    };

    gsap.to(track, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: pinWrapper,
        start: 'top top',
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        fastScrollEnd: false
      }
    });
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
    // Typing effect is now started by playHeroAnimation
  }

  /* ========================================================================
     6. HERO STAGGERED ANIMATION (Jasmine Gunarto Style)
     ======================================================================== */
  window.playHeroAnimation = function() {
    const heroLine = document.getElementById('hero-line-1');
    const mainTitle = document.getElementById('main-hero-title');
    if (!heroLine || !mainTitle) return;

    // Split text into spans for staggered animation
    const text = heroLine.innerText;
    heroLine.innerHTML = '';
    
    // Set main title to visible if hidden
    mainTitle.style.opacity = '1';

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.innerText = text[i] === ' ' ? '\u00A0' : text[i];
      span.style.display = 'inline-block';
      span.style.transform = 'translateY(100%)';
      span.style.opacity = '0';
      heroLine.appendChild(span);
    }

    // Animate characters
    if (typeof gsap !== 'undefined') {
      gsap.to('#hero-line-1 span', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.03,
        ease: 'power4.out',
        onComplete: () => {
          // Start the typing effect after slide up finishes
          setTimeout(type, 200);
        }
      });
      
      // Animate buttons and header in
      gsap.fromTo('.hero-buttons', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, delay: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo('.header', 
        { y: -30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, delay: 1, ease: 'power3.out' }
      );
    } else {
      // Fallback if GSAP is not loaded
      heroLine.innerText = text;
      setTimeout(type, 200);
    }
  };

  // Refresh ScrollTrigger when images load and window resizes
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  window.addEventListener('resize', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

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
