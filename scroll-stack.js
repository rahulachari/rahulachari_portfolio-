/**
 * ScrollStackManager - Vanilla JS Port of React Bits ScrollStack
 * Optimized for Lenis and GSAP Ticker for buttery smooth performance.
 */
class ScrollStackManager {
  constructor(options = {}) {
    this.itemDistance = options.itemDistance || 100;
    this.itemScale = options.itemScale || 0.03;
    this.itemStackDistance = options.itemStackDistance || 30;
    this.stackPosition = options.stackPosition || '20%';
    this.scaleEndPosition = options.scaleEndPosition || '10%';
    this.baseScale = options.baseScale || 0.85;
    this.rotationAmount = options.rotationAmount || 0;
    this.blurAmount = options.blurAmount || 0;
    this.onStackComplete = options.onStackComplete || null;

    this.cards = Array.from(document.querySelectorAll('.scroll-stack-card'));
    this.endElement = document.querySelector('.scroll-stack-end');
    
    this.cardData = [];
    this.endElementTop = 0;
    this.stackCompleted = false;
    this.lastTransforms = new Map();
    this.isUpdating = false;
    this.containerHeight = window.innerHeight;

    this.init();
  }

  init() {
    if (!this.cards.length) return;

    this.cards.forEach((card, i) => {
      if (i < this.cards.length - 1) {
        card.style.marginBottom = `${this.itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.webkitTransform = 'translateZ(0)';
      card.style.perspective = '1000px';
    });

    this.calculateLayout();

    window.addEventListener('resize', () => {
      this.containerHeight = window.innerHeight;
      this.cards.forEach(card => {
        card.style.transform = 'none';
      });
      this.calculateLayout();
      this.updateCardTransforms();
    });

    const tick = () => {
      this.updateCardTransforms();
    };

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add(tick);
    } else {
      const loop = () => {
        tick();
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
    
    this.updateCardTransforms();
  }

  calculateLayout() {
    this.cardData = this.cards.map(card => {
      const rect = card.getBoundingClientRect();
      return {
        element: card,
        top: rect.top + window.scrollY
      };
    });
    
    if (this.endElement) {
      const rect = this.endElement.getBoundingClientRect();
      this.endElementTop = rect.top + window.scrollY;
    }
  }

  parsePercentage(value, containerHeight) {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }

  calculateProgress(scrollTop, start, end) {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }

  updateCardTransforms() {
    if (!this.cards.length || this.isUpdating) return;
    this.isUpdating = true;

    const scrollTop = window.scrollY;
    const containerHeight = this.containerHeight;

    const stackPositionPx = this.parsePercentage(this.stackPosition, containerHeight);
    const scaleEndPositionPx = this.parsePercentage(this.scaleEndPosition, containerHeight);

    this.cardData.forEach((data, i) => {
      const card = data.element;
      const cardTop = data.top;
      
      const triggerStart = cardTop - stackPositionPx - (this.itemStackDistance * i);
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - (this.itemStackDistance * i);
      const pinEnd = this.endElementTop - (containerHeight / 2);

      const scaleProgress = this.calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = this.baseScale + (i * this.itemScale);
      const scale = 1 - (scaleProgress * (1 - targetScale));
      const rotation = this.rotationAmount ? i * this.rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (this.blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < this.cardData.length; j++) {
          const jTriggerStart = this.cardData[j].top - stackPositionPx - (this.itemStackDistance * j);
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }
        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * this.blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + (this.itemStackDistance * i);
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + (this.itemStackDistance * i);
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100
      };

      const lastTransform = this.lastTransforms.get(i);
      const hasChanged = !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';

        card.style.transform = transform;
        if (this.blurAmount > 0) card.style.filter = filter;

        this.lastTransforms.set(i, newTransform);
      }

      if (i === this.cards.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !this.stackCompleted) {
          this.stackCompleted = true;
          if (this.onStackComplete) this.onStackComplete();
        } else if (!isInView && this.stackCompleted) {
          this.stackCompleted = false;
        }
      }
    });

    this.isUpdating = false;
  }
}
