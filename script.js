/* ==========================================================================
   RAHUL ACHARI YC — ANTIGRAVITY & REACT BITS PILLNAV SYSTEM
   1. React Bits <Antigravity /> 3D Instanced Canvas Engine
   2. React Bits <PillNav /> GSAP Pill Circle Expansion & Label Hover Animation
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     1. PRELOADER & SIGNATURE HERO DOCKING TRANSITION
     ======================================================================== */
  const preloader = document.getElementById('preloader');
  const siteWrapper = document.getElementById('site-wrapper');
  const signatureContainer = document.getElementById('signature-loader-container');
  const heroSignatureTarget = document.getElementById('hero-signature-target');

  let preloaderDismissed = false;

  // Pre-render the signature SVG in the hero section immediately so layout is stable
  function renderHeroSignature() {
    if (!heroSignatureTarget) return;
    if (heroSignatureTarget.querySelector('.signature-svg')) return;

    if (typeof window.createSignatureSVG === 'function' && window.ComponentrySignature) {
      const pathData = window.ComponentrySignature.DEFAULT_SIGNATURE_DATA;
      if (pathData) {
        heroSignatureTarget.innerHTML = '';
        const res = window.createSignatureSVG({
          paths: pathData.paths,
          width: pathData.width,
          height: pathData.height,
          viewBox: pathData.viewBox,
          fontSize: 21,
          color: '#050505',
          className: 'hero-docked-signature'
        });
        heroSignatureTarget.appendChild(res.svg);
        heroSignatureTarget.style.opacity = '0';
      }
    }
  }

  function triggerSiteReveal() {
    if (triggerSiteReveal.done) return;
    triggerSiteReveal.done = true;

    if (typeof playHeroAnimation === 'function') {
      playHeroAnimation();
    } else if (typeof window.playHeroAnimation === 'function') {
      window.playHeroAnimation();
    }

    setTimeout(() => {
      if (typeof initScrollAnimations === 'function') initScrollAnimations();
      if (typeof initPillNav === 'function') initPillNav();
      if (typeof initMarqueeScroll === 'function') initMarqueeScroll();
    }, 150);
  }

  function transitionSignatureToHero() {
    if (preloaderDismissed) return;
    preloaderDismissed = true;

    // Ensure we start from top of viewport for exact alignment
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Make sure hero signature is ready in place
    renderHeroSignature();

    const preloaderSvg = signatureContainer ? signatureContainer.querySelector('.signature-svg') : null;
    const heroSvg = heroSignatureTarget ? heroSignatureTarget.querySelector('.signature-svg') : null;

    if (!preloaderSvg || !heroSvg || typeof gsap === 'undefined') {
      // Fallback: simply show hero and hide preloader
      if (heroSignatureTarget) heroSignatureTarget.style.opacity = '1';
      if (siteWrapper) siteWrapper.classList.add('visible');
      if (preloader) preloader.style.display = 'none';
      triggerSiteReveal();
      return;
    }

    // 1. Reveal site underneath so coordinates are calculated accurately
    if (siteWrapper) {
      siteWrapper.classList.add('visible');
      siteWrapper.style.opacity = '1';
    }

    // 2. Measure starting and target coordinates
    const startRect = preloaderSvg.getBoundingClientRect();
    const targetRect = heroSvg.getBoundingClientRect();

    const deltaX = (targetRect.left + targetRect.width / 2) - (startRect.left + startRect.width / 2);
    const deltaY = (targetRect.top + targetRect.height / 2) - (startRect.top + startRect.height / 2);
    const scale = targetRect.width / startRect.width;

    // 3. Elevate preloader SVG above preloader background
    gsap.set(preloaderSvg, {
      position: 'relative',
      zIndex: 10001,
      transformOrigin: 'center center'
    });

    // 4. Smooth, hardware-accelerated glide UP into hero position
    const tl = gsap.timeline({
      onComplete: () => {
        // Hero signature is already in DOM, make it permanently visible
        heroSignatureTarget.style.opacity = '1';
        if (preloader) preloader.style.display = 'none';

        // Trigger hero subheadings smoothly
        triggerSiteReveal();
      }
    });

    // Fade preloader background away smoothly
    tl.to(preloader, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut'
    }, 0);

    // Glide UP from preloader center directly into hero position
    tl.to(preloaderSvg, {
      x: deltaX,
      y: deltaY,
      scale: scale,
      duration: 0.9,
      ease: 'power3.inOut'
    }, 0);

    // Crossfade hero signature in at the moment of landing
    tl.to(heroSignatureTarget, {
      opacity: 1,
      duration: 0.15,
      ease: 'none'
    }, 0.75);
  }

  // Allow clicking anywhere to skip straight to hero docking
  if (preloader) {
    preloader.addEventListener('click', () => {
      if (window.__sigTimeline) {
        window.__sigTimeline.progress(1);
      }
      transitionSignatureToHero();
    });
  }

  // Initialize Signature loading animation
  function startSignatureLoader() {
    if (startSignatureLoader.started) return;
    startSignatureLoader.started = true;

    renderHeroSignature();

    if (typeof window.initSignature === 'function' && signatureContainer) {
      window.initSignature({
        container: signatureContainer,
        text: "Rahul Achari YC",
        color: "#050505",
        fontSize: 21,
        duration: 0.85,
        delay: 0.1,
        onComplete: () => {
          setTimeout(transitionSignatureToHero, 150);
        }
      });
    } else {
      setTimeout(transitionSignatureToHero, 600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSignatureLoader);
  } else {
    startSignatureLoader();
  }





  /* ========================================================================
     3. PILL NAV SYSTEM & MOBILE MENU
     ======================================================================== */
  function initPillNav() {
    // 1. Mobile popover toggle
    const mobileBtn = document.getElementById('mobile-hamburger-btn');
    const mobilePopover = document.getElementById('mobile-popover-menu');
    let isMenuOpen = false;

    if (mobileBtn && mobilePopover && !mobileBtn.__bound) {
      mobileBtn.__bound = true;
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

    // 2. Desktop PillNav Handlers (Smooth CSS Transition Engine)
    window.pillEnter = function() {};
    window.pillLeave = function() {};
  }

  /* ========================================================================
     4. GSAP SCROLL ANIMATIONS & LENIS & SCROLLSTACK
     ======================================================================== */
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.6,
      infinite: false,
    });
    window.lenis = lenis;

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

    // Intercept internal anchor links for buttery smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, {
            offset: -35,
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        }
      });
    });
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

    // Exclude any elements in #hero to prevent conflicting double-reveal animations
    const els = document.querySelectorAll('[data-scroll]:not(#hero [data-scroll])');

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

    // Initialize Extrafazant team section interactions
    initTeamSectionInteractions();
  }

  function splitIntoChars(el) {
    if (!el || el.querySelector('.hero-char')) return;
    const text = el.innerText.trim();
    el.innerHTML = '';
    const words = text.split(/\s+/);
    words.forEach((word, wIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'hero-word';

      for (let i = 0; i < word.length; i++) {
        const charWrap = document.createElement('span');
        charWrap.className = 'hero-char-wrap';

        const charSpan = document.createElement('span');
        charSpan.className = 'hero-char';
        charSpan.textContent = word[i];

        charWrap.appendChild(charSpan);
        wordSpan.appendChild(charWrap);
      }

      el.appendChild(wordSpan);

      if (wIdx < words.length - 1) {
        const space = document.createTextNode(' ');
        el.appendChild(space);
      }
    });
  }

  /* ========================================================================
     5. HERO TEXT EFFECT (Extrafazant Line Reveal & Variable Font Proximity Hover)
     ======================================================================== */
  function initExtrafazantHeroText() {
    if (initExtrafazantHeroText.done) return;
    initExtrafazantHeroText.done = true;

    const mainTitle = document.getElementById('main-hero-title');
    if (!mainTitle) return;

    mainTitle.style.opacity = '1';

    const line1 = mainTitle.querySelector('.hero-line-1');
    const line2 = mainTitle.querySelector('.hero-line-2');
    if (!line1 || !line2) return;

    splitIntoChars(line1);
    splitIntoChars(line2);

    const allChars = mainTitle.querySelectorAll('.hero-char');
    if (typeof gsap !== 'undefined') {
      gsap.set(allChars, { yPercent: 135 });
      gsap.to(allChars, {
        yPercent: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.012,
        onComplete: () => {
          gsap.set(mainTitle.querySelectorAll('.hero-char-wrap, .hero-word'), { overflow: 'visible' });
          initFontWeightHover();
        }
      });

      // Animate buttons and header in together once and for all
      gsap.fromTo('.hero-buttons', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.7, delay: 0.35, ease: 'power3.out' }
      );
      gsap.fromTo('.header', 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.7, delay: 0.45, ease: 'power3.out' }
      );
    } else {
      initFontWeightHover();
    }
  }

  function initFontWeightHover() {
    const hoverElements = Array.from(document.querySelectorAll('[data-font-weight-hover]'));
    if (!hoverElements.length || typeof gsap === 'undefined') return;

    const charItems = [];
    const mouse = { x: -9999, y: -9999 };
    let hasMoved = false;

    hoverElements.forEach(el => {
      if (!el.querySelector('.hero-char')) {
        splitIntoChars(el);
      }
      const chars = el.querySelectorAll('.hero-char');
      if (!chars.length) return;

      const rest = parseFloat(el.dataset.weightRest) || 700;
      const near = parseFloat(el.dataset.weightNear) || 200;
      const radius = parseFloat(el.dataset.radius) || 350;

      chars.forEach(ch => {
        ch.style.setProperty('--wght', rest);
        ch.style.fontVariationSettings = `'wght' var(--wght)`;

        const quickSet = gsap.quickTo(ch, '--wght', {
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        charItems.push({
          el: ch,
          cx: 0,
          cy: 0,
          rest: rest,
          near: near,
          radius: radius,
          last: rest,
          lo: Math.min(rest, near),
          hi: Math.max(rest, near),
          setw: quickSet
        });
      });
    });

    if (!charItems.length) return;

    let isHeroInView = true;
    let needsTick = false;
    const heroSection = document.getElementById('hero') || document.querySelector('.hero');
    if (heroSection && typeof IntersectionObserver !== 'undefined') {
      const heroObserver = new IntersectionObserver(([entry]) => {
        isHeroInView = entry.isIntersecting;
        if (!isHeroInView) {
          // Reset chars to rest weight when hero is scrolled out of view
          for (let i = 0; i < charItems.length; i++) {
            if (charItems[i].last !== charItems[i].rest) {
              charItems[i].last = charItems[i].rest;
              charItems[i].setw(charItems[i].rest);
            }
          }
        }
      }, { threshold: 0 });
      heroObserver.observe(heroSection);
    }

    function updateCenters() {
      for (let i = 0; i < charItems.length; i++) {
        const rect = charItems[i].el.getBoundingClientRect();
        charItems[i].cx = rect.left + rect.width / 2 + window.scrollX;
        charItems[i].cy = rect.top + rect.height / 2 + window.scrollY;
      }
    }

    updateCenters();
    window.addEventListener('resize', updateCenters, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateCenters).catch(() => {});
    }

    window.addEventListener('pointermove', (e) => {
      if (!isHeroInView) return;
      hasMoved = true;
      needsTick = true;
      mouse.x = e.pageX;
      mouse.y = e.pageY;
    }, { passive: true });

    gsap.ticker.add(() => {
      if (!hasMoved || !isHeroInView || !needsTick) return;
      let anyChanged = false;
      for (let i = 0; i < charItems.length; i++) {
        const item = charItems[i];
        const dist = Math.hypot(mouse.x - item.cx, mouse.y - item.cy);
        const factor = dist >= item.radius ? 0 : 1 - dist / item.radius;
        let targetWeight = item.rest + (item.near - item.rest) * factor;
        targetWeight = Math.max(item.lo, Math.min(item.hi, targetWeight));

        if (Math.abs(targetWeight - item.last) >= 1) {
          item.last = targetWeight;
          item.setw(targetWeight);
          anyChanged = true;
        }
      }
      if (!anyChanged) {
        needsTick = false;
      }
    });
  }

  function playHeroAnimation() {
    if (window.__heroAnimationDone) return;
    window.__heroAnimationDone = true;
    initExtrafazantHeroText();
  }
  window.playHeroAnimation = playHeroAnimation;

  /* ========================================================================
     6. EXTRAFAZANT TEAM SECTION (Parallax & Momentum Hover)
     ======================================================================== */
  function initTeamSectionInteractions() {
    if (typeof gsap === 'undefined') return;

    // Scroll Parallax on Team Cards if ScrollTrigger available
    if (typeof ScrollTrigger !== 'undefined') {
      const teamSection = document.getElementById('projects');
      const teamItems = document.querySelectorAll('.team_item[data-team-parallax-item]');

      if (teamSection && teamItems.length) {
        teamItems.forEach((item, idx) => {
          const card = item.querySelector('.team_card');
          if (!card) return;
          const isOdd = idx % 2 === 1;
          const yDist = isOdd ? 20 : -20;
          gsap.fromTo(card, 
            { y: -yDist },
            {
              y: yDist,
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
              }
            }
          );
        });
      }
    }

    // Momentum Tilt on Team Cards and Stickers
    const momentumCards = document.querySelectorAll('[data-momentum-hover]');
    momentumCards.forEach(card => {
      let bounds;
      
      card.addEventListener('mouseenter', () => {
        bounds = card.getBoundingClientRect();
      });

      card.addEventListener('mousemove', (e) => {
        if (!bounds) bounds = card.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const xPercent = (x / bounds.width - 0.5) * 2;
        const yPercent = (y / bounds.height - 0.5) * 2;

        gsap.to(card, {
          rotateY: xPercent * 6,
          rotateX: -yPercent * 6,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 800
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
      });
    });
  }

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
      initPillNav();
    });
  } else {
    setTimeout(() => {
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
    let rafId = 0;
    let isVisible = true;
    
    // Cache track width to prevent layout thrashing in rAF
    let cachedTrackWidth = marquee.scrollWidth / 3;

    window.addEventListener('resize', () => {
      cachedTrackWidth = marquee.scrollWidth / 3;
    }, { passive: true });

    window.addEventListener("scroll", () => {
      if (!isVisible) return;
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
      }, 180);
    }, { passive: true });

    function tick() {
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;
      position -= currentSpeed;

      let trackWidth = cachedTrackWidth;
      if (trackWidth > 0) {
        if (position <= -trackWidth) {
          position += trackWidth;
        } else if (position >= 0) {
          position -= trackWidth;
        }
        marquee.style.transform = `translate3d(${position.toFixed(2)}px, 0, 0)`;
      }

      if (isVisible) {
        rafId = requestAnimationFrame(tick);
      }
    }

    // Observer to pause animation loop when marquee is offscreen
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafId) {
          rafId = requestAnimationFrame(tick);
        } else if (!isVisible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      }, { threshold: 0 });
      observer.observe(marquee.parentElement || marquee);
    }

    if (cachedTrackWidth > 0) position = -1;
    rafId = requestAnimationFrame(tick);
  }

  /* ========================================================================
     7. CIRCULAR TEXT LOGO (React Bits Port)
     ======================================================================== */
  function initCircularLogo() {
    const container = document.getElementById('circular-logo');
    if (!container || typeof gsap === 'undefined') return;

    const text = "RAHUL * ACHARI * PORTFOLIO * ";
    const spinDuration = 20;
    const letters = Array.from(text);

    // Create the spans for each letter
    letters.forEach((letter, i) => {
      const span = document.createElement('span');
      span.innerText = letter === ' ' ? '\u00A0' : letter;
      
      const rotationDeg = (360 / letters.length) * i;
      const transform = `rotateZ(${rotationDeg}deg)`;
      
      span.style.transform = transform;
      span.style.webkitTransform = transform;
      container.appendChild(span);
    });

    // Create GSAP spinning animation
    let tween = gsap.to(container, {
      rotation: 360,
      duration: spinDuration,
      ease: 'none',
      repeat: -1
    });

    // Handle hover speedUp variant
    container.addEventListener('mouseenter', () => {
      gsap.to(tween, { timeScale: 4, duration: 0.5, ease: 'power2.out' });
      gsap.to(container, { scale: 1.1, duration: 0.5, ease: 'back.out(2)' });
    });

    container.addEventListener('mouseleave', () => {
      gsap.to(tween, { timeScale: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(container, { scale: 1, duration: 0.5, ease: 'power2.out' });
    });
  }
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCircularLogo);
  } else {
    initCircularLogo();
  }

})();
