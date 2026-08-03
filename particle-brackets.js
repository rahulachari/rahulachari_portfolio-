window.addEventListener('load', () => {
    const canvas = document.getElementById('particle-brackets-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const section = document.getElementById('skills');
    const container = section ? section.querySelector('.container') : null;
    
    let width, height;
    let shapeParticles = [];
    let isAssembled = false;

    class ShapeParticle {
        constructor(tx, ty, canvasW, canvasH) {
            this.targetX = tx;
            this.targetY = ty;
            
            // Random initial scattered position across section
            this.x = Math.random() * canvasW;
            this.y = Math.random() * canvasH;
            
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4;
            this.friction = 0.86;
            this.spring = 0.06;
            this.offset = Math.random() * Math.PI * 2;
            
            // 96% Google Blue, 4% Google Red (exact Antigravity palette)
            this.color = Math.random() > 0.04 ? '#4285F4' : '#EA4335';
            this.size = Math.random() * 1.4 + 1.8; // Bolder 1.8px - 3.2px dots
            this.alpha = Math.random() * 0.45 + 0.55; 
        }

        update(assembled, time) {
            if (assembled) {
                // Smooth organic wave float around target
                const floatX = this.targetX + Math.sin(time * 0.8 + this.offset) * 1.6;
                const floatY = this.targetY + Math.cos(time * 0.8 + this.offset) * 1.6;
                this.vx += (floatX - this.x) * this.spring;
                this.vy += (floatY - this.y) * this.spring;
            } else {
                // Scattered background floating movement
                this.vx += Math.cos(time * 0.5 + this.offset) * 0.3;
                this.vy += Math.sin(time * 0.5 + this.offset) * 0.3;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.x += this.vx;
            this.y += this.vy;
        }
    }

    // Generate thick, bold, wide Google Antigravity bracket geometry
    function generateAntigravityBracketPoints(isLeft, rectLeft, rectTop, rectWidth, rectHeight) {
        const points = [];
        
        // Increased thickness, width, & size
        const gapX = Math.min(60, rectWidth * 0.07);       // Clearance from content edge
        const armLength = Math.min(180, rectWidth * 0.24);  // Wider top/bottom horizontal arm length
        const lipLength = 26;                               // Inward vertical lip at arm tips
        const tubeHalfWidth = 22;                           // 44px thick tube (more than doubled thickness!)
        const tabDepth = 42;                                // Wider middle square tab depth
        const tabHeight = 50;                               // Taller middle square tab height
        const cornerR = 36;                                 // Corner curve radius
        
        const topY = rectTop - 35;
        const bottomY = rectTop + rectHeight + 35;
        const midY = topY + (bottomY - topY) / 2;
        
        let stemX, armDir, tabDir;
        if (isLeft) {
            stemX = rectLeft - gapX;
            armDir = 1;   // Arm extends right towards content
            tabDir = -1;  // Tab juts left away from content
        } else {
            stemX = rectLeft + rectWidth + gapX;
            armDir = -1;  // Arm extends left towards content
            tabDir = 1;   // Tab juts right away from content
        }

        // Helper: multi-line outline sampling along straight line (5 parallel dot layers)
        function addLineOutline(x1, y1, x2, y2, step) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.hypot(dx, dy);
            if (len === 0) return;
            
            const nx = -dy / len;
            const ny = dx / len;
            
            const count = Math.ceil(len / step);
            for (let i = 0; i <= count; i++) {
                const t = i / count;
                const px = x1 + dx * t;
                const py = y1 + dy * t;
                
                // 5 parallel layers across the 44px thick tube
                [-tubeHalfWidth, -tubeHalfWidth * 0.5, 0, tubeHalfWidth * 0.5, tubeHalfWidth].forEach(wOffset => {
                    points.push({
                        x: px + nx * wOffset + (Math.random() - 0.5) * 3.5,
                        y: py + ny * wOffset + (Math.random() - 0.5) * 3.5
                    });
                });
            }
        }

        // Helper: multi-line outline sampling along quarter arc
        function addArcOutline(cx, cy, radius, startAngle, endAngle, step) {
            const arcLen = Math.abs(endAngle - startAngle) * radius;
            const count = Math.ceil(arcLen / step);
            
            for (let i = 0; i <= count; i++) {
                const t = i / count;
                const angle = startAngle + (endAngle - startAngle) * t;
                
                [-tubeHalfWidth, -tubeHalfWidth * 0.5, 0, tubeHalfWidth * 0.5, tubeHalfWidth].forEach(wOffset => {
                    const rCurr = radius + wOffset;
                    points.push({
                        x: cx + Math.cos(angle) * rCurr + (Math.random() - 0.5) * 3.5,
                        y: cy + Math.sin(angle) * rCurr + (Math.random() - 0.5) * 3.5
                    });
                });
            }
        }

        // Helper: end cap at tip
        function addTipCap(x, y, isVertical) {
            for (let offset = -tubeHalfWidth; offset <= tubeHalfWidth; offset += 3.5) {
                for (let depth = -3; depth <= 3; depth += 3) {
                    if (isVertical) {
                        points.push({ x: x + offset, y: y + depth });
                    } else {
                        points.push({ x: x + depth, y: y + offset });
                    }
                }
            }
        }

        const d = 3.5; // High dot sampling density along path

        const armTipX = stemX + armDir * armLength;
        const tabTopY = midY - tabHeight / 2;
        const tabBottomY = midY + tabHeight / 2;
        const tabOuterX = stemX + tabDir * tabDepth;

        // 1. Top vertical lip tip
        const topLipY = topY + lipLength;
        addLineOutline(armTipX, topLipY, armTipX, topY, d);
        addTipCap(armTipX, topLipY, true);

        // 2. Top horizontal arm (180px wide)
        addLineOutline(armTipX, topY, stemX + armDir * cornerR, topY, d);

        // 3. Top corner arc
        if (isLeft) {
            addArcOutline(stemX + cornerR, topY + cornerR, cornerR, -Math.PI / 2, -Math.PI, d);
        } else {
            addArcOutline(stemX - cornerR, topY + cornerR, cornerR, -Math.PI / 2, 0, d);
        }

        // 4. Upper vertical stem
        addLineOutline(stemX, topY + cornerR, stemX, tabTopY, d);

        // 5. Square middle tab jut (42px wide)
        addLineOutline(stemX, tabTopY, tabOuterX, tabTopY, d);
        addLineOutline(tabOuterX, tabTopY, tabOuterX, tabBottomY, d);
        addLineOutline(tabOuterX, tabBottomY, stemX, tabBottomY, d);

        // 6. Lower vertical stem
        addLineOutline(stemX, tabBottomY, stemX, bottomY - cornerR, d);

        // 7. Bottom corner arc
        if (isLeft) {
            addArcOutline(stemX + cornerR, bottomY - cornerR, cornerR, Math.PI, Math.PI / 2, d);
        } else {
            addArcOutline(stemX - cornerR, bottomY - cornerR, cornerR, 0, Math.PI / 2, d);
        }

        // 8. Bottom horizontal arm (180px wide)
        addLineOutline(stemX + armDir * cornerR, bottomY, armTipX, bottomY, d);

        // 9. Bottom vertical lip tip
        const bottomLipY = bottomY - lipLength;
        addLineOutline(armTipX, bottomY, armTipX, bottomLipY, d);
        addTipCap(armTipX, bottomLipY, true);

        return points;
    }

    function initShapes() {
        shapeParticles = [];
        if (!section || !container) return;

        const sectionRect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const cLeft = containerRect.left - sectionRect.left;
        const cTop = containerRect.top - sectionRect.top;
        const cWidth = containerRect.width;
        const cHeight = containerRect.height;

        const leftTargets = generateAntigravityBracketPoints(true, cLeft, cTop, cWidth, cHeight);
        const rightTargets = generateAntigravityBracketPoints(false, cLeft, cTop, cWidth, cHeight);

        [...leftTargets, ...rightTargets].forEach(t => {
            shapeParticles.push(new ShapeParticle(t.x, t.y, width, height));
        });
    }

    function resize() {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        if (height < 200) height = 800;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        initShapes();
    }

    let isVisible = true;

    function animate() {
        if (isVisible) {
            ctx.clearRect(0, 0, width, height);
            const time = Date.now() * 0.001;

            let currentOpacity = -1;
            let currentColor = '';

            shapeParticles.forEach(p => {
                p.update(isAssembled, time);
                
                if (p.alpha !== currentOpacity || p.color !== currentColor) {
                    currentOpacity = p.alpha;
                    currentColor = p.color;
                    ctx.globalAlpha = currentOpacity;
                    ctx.fillStyle = currentColor;
                }
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
        requestAnimationFrame(animate);
    }

    setTimeout(() => {
        resize();
        window.addEventListener('resize', resize);
        animate();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { isVisible = entry.isIntersecting; });
        }, { rootMargin: '200px' });
        observer.observe(section);

        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
            ScrollTrigger.create({
                trigger: section,
                start: "top 75%",
                end: "bottom 25%",
                onEnter: () => isAssembled = true,
                onLeave: () => isAssembled = false,
                onEnterBack: () => isAssembled = true,
                onLeaveBack: () => isAssembled = false
            });
        } else {
            const ao = new IntersectionObserver((entries) => {
                entries.forEach(entry => { isAssembled = entry.isIntersecting; });
            }, { threshold: 0.3 });
            ao.observe(section);
        }
    }, 500);
});
