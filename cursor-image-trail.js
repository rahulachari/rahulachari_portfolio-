/**
 * Cursor Image Trail Effect
 * Port of @unlumen-ui/cursor-image-trail with GSAP Animation
 * Configured with working projects images & icons in the CTA section
 */

(function () {
  'use strict';

  const TRAIL_PROJECTS = [
    {
      title: "Control-D",
      icon: "fa-solid fa-heart-pulse",
      image: "assets/images/ContoL-D.jpg"
    },
    {
      title: "UniML",
      icon: "fa-solid fa-file-contract",
      image: "assets/images/UnimL.jpg"
    },
    {
      title: "PropCast",
      icon: "fa-solid fa-chart-line",
      image: "assets/images/propcast.jpg"
    },
    {
      title: "Adhikar",
      icon: "fa-solid fa-file-invoice",
      image: "assets/images/Adhikar.jpg"
    },
    {
      title: "Precast Walls",
      icon: "fa-solid fa-cubes-stacked",
      image: "assets/images/precast walls.jpg"
    },
    {
      title: "VoiceOS",
      icon: "fa-solid fa-microphone-lines",
      image: "assets/images/VoiceOS.jpg"
    },
    {
      title: "Beat Sync",
      icon: "fa-solid fa-music",
      image: "assets/images/Beat-sync.jpg"
    },
    {
      title: "Reminder Remix",
      icon: "fa-solid fa-bell",
      image: "assets/images/reminder remix.jpg"
    }
  ];

  class CursorImageTrail {
    constructor(options = {}) {
      this.container = options.container || document.getElementById('cta');
      if (!this.container) return;

      this.itemSize = options.itemSize || 135;
      this.trailLength = options.trailLength || 8;
      this.spawnDistance = options.spawnDistance || 75;
      this.rotationRange = options.rotationRange || 20;
      this.itemLifetime = options.itemLifetime || 2400; // ms before auto-exit
      this.items = options.items || TRAIL_PROJECTS;

      this.trail = [];
      this.lastPos = null;
      this.counter = 0;
      this.idCounter = 0;

      this.init();
    }

    init() {
      // Find or create trail layer inside container
      let layer = this.container.querySelector('.cursor-trail-layer');
      if (!layer) {
        layer = document.createElement('div');
        layer.className = 'cursor-trail-layer';
        this.container.appendChild(layer);
      }
      this.layer = layer;

      // Event listeners
      this.onMove = this.onMove.bind(this);
      this.onLeave = this.onLeave.bind(this);

      this.container.addEventListener('mousemove', this.onMove);
      this.container.addEventListener('mouseleave', this.onLeave);
    }

    onMove(e) {
      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.lastPos) {
        const dx = x - this.lastPos.x;
        const dy = y - this.lastPos.y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.spawnDistance) return;
      }

      this.lastPos = { x, y };

      const rotation = (Math.random() * 2 - 1) * this.rotationRange;
      const project = this.items[this.counter % this.items.length];
      this.counter++;

      this.spawnItem(x, y, rotation, project);
    }

    spawnItem(x, y, rotation, project) {
      const id = ++this.idCounter;

      const card = document.createElement('div');
      card.className = 'trail-card';
      card.style.width = `${this.itemSize}px`;
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      card.style.zIndex = id;

      card.innerHTML = `
        <div class="trail-card-inner">
          <img src="${project.image}" alt="${project.title}" class="trail-card-img" loading="eager" />
          <div class="trail-card-badge">
            <i class="${project.icon}"></i>
            <span>${project.title}</span>
          </div>
        </div>
      `;

      this.layer.appendChild(card);

      const item = {
        id,
        el: card,
        x,
        y,
        rotation,
        timer: null
      };

      // Entrance animation with GSAP matching motion/react spec
      if (typeof gsap !== 'undefined') {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          opacity: 0,
          scale: 0.5,
          rotation: rotation * 1.5,
          filter: 'blur(0px)'
        });

        gsap.to(card, {
          opacity: 1,
          scale: 1,
          rotation: rotation,
          duration: 0.4,
          ease: 'power2.out'
        });
      } else {
        card.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
        card.style.opacity = '1';
      }

      // Auto-exit timer
      item.timer = setTimeout(() => {
        this.exitItem(item);
      }, this.itemLifetime);

      this.trail.push(item);

      // If trail exceeds max simultaneous items, remove oldest
      if (this.trail.length > this.trailLength) {
        const oldest = this.trail.shift();
        this.exitItem(oldest);
      }

      // Update scale of existing items based on age
      this.updateTrailAges();
    }

    updateTrailAges() {
      const total = this.trail.length;
      this.trail.forEach((item, i) => {
        const age = total - 1 - i;
        const scale = 0.6 + 0.4 * (1 - age / this.trailLength);
        if (typeof gsap !== 'undefined' && item.el) {
          gsap.to(item.el, {
            scale: scale,
            duration: 0.35,
            ease: 'power1.out',
            overwrite: 'auto'
          });
        }
      });
    }

    exitItem(item) {
      if (!item || !item.el || item.isExiting) return;
      item.isExiting = true;
      if (item.timer) clearTimeout(item.timer);

      // Remove from active trail array
      const idx = this.trail.indexOf(item);
      if (idx > -1) {
        this.trail.splice(idx, 1);
      }

      if (typeof gsap !== 'undefined') {
        gsap.to(item.el, {
          opacity: 0,
          scale: 0.3,
          rotation: item.rotation * 0.5,
          filter: 'blur(4px)',
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => {
            if (item.el && item.el.parentNode) {
              item.el.parentNode.removeChild(item.el);
            }
          }
        });
      } else {
        if (item.el && item.el.parentNode) {
          item.el.parentNode.removeChild(item.el);
        }
      }
    }

    onLeave() {
      this.lastPos = null;
      // Animate out all items when cursor exits container
      const itemsToClear = [...this.trail];
      this.trail = [];
      itemsToClear.forEach(item => this.exitItem(item));
    }

    destroy() {
      if (this.container) {
        this.container.removeEventListener('mousemove', this.onMove);
        this.container.removeEventListener('mouseleave', this.onLeave);
      }
      this.onLeave();
    }
  }

  // Initialize on DOM load
  function initCTAImageTrail() {
    const ctaSection = document.getElementById('cta');
    if (ctaSection) {
      new CursorImageTrail({
        container: ctaSection,
        itemSize: 135,
        trailLength: 8,
        spawnDistance: 70,
        rotationRange: 20
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCTAImageTrail);
  } else {
    initCTAImageTrail();
  }

  window.CursorImageTrail = CursorImageTrail;
})();
