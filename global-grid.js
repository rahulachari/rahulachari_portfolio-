window.addEventListener('load', () => {
    // Disable on mobile devices
    if (window.innerWidth <= 768) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'global-grid-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0'; // Behind most content, but above mesh gradient (-1)
    
    // Insert before mesh gradient if it exists, otherwise at start of site-wrapper
    const siteWrapper = document.getElementById('site-wrapper');
    const mesh = document.getElementById('mesh-gradient-canvas');
    if (mesh && mesh.parentNode) {
        mesh.parentNode.insertBefore(canvas, mesh.nextSibling);
    } else if (siteWrapper) {
        siteWrapper.prepend(canvas);
    } else {
        document.body.prepend(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let gridParticles = [];
    const spacing = 45; // slightly wider spacing for full page to avoid clutter

    class GridParticle {
        constructor(x, y) {
            this.baseX = x;
            this.baseY = y;
            this.offset = Math.random() * Math.PI * 2;
            
            const rand = Math.random();
            if (rand > 0.99) this.color = '#EA4335'; // Rare Google Red
            else if (rand > 0.98) this.color = '#4285F4'; // Rare Google Blue
            else this.color = 'rgba(0,0,0,0.4)'; // Subtle black for grid
            
            this.size = Math.random() > 0.9 ? 1.5 : 1.0;
        }
        
        update(time, scrollY) {
            this.x = this.baseX;
            this.y = (this.baseY - scrollY) % height;
            
            if (this.y < -spacing) this.y += height + spacing;
            if (this.y > height + spacing) this.y -= height + spacing;
            
            this.x += Math.sin(time * 0.5 + this.offset) * 2;
            this.y += Math.cos(time * 0.5 + this.offset) * 2;
        }
    }

    function initGrid() {
        gridParticles = [];
        for (let y = 0; y < height + spacing * 2; y += spacing) {
            for (let x = 0; x < width; x += spacing) {
                gridParticles.push(new GridParticle(x, y));
            }
        }
        // Group by color to minimize fillStyle state changes (massive performance boost)
        gridParticles.sort((a, b) => a.color.localeCompare(b.color));
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        
        initGrid();
    }

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { isVisible = entry.isIntersecting; });
    }, { rootMargin: '100px' });
    observer.observe(canvas);

    function animate() {
        if (isVisible) {
            ctx.clearRect(0, 0, width, height);
            
            const time = Date.now() * 0.001;
            const scrollY = window.scrollY; // Parallax effect
            
            let currentColor = '';
            
            for (let i = 0; i < gridParticles.length; i++) {
                const p = gridParticles[i];
                p.update(time, scrollY);
                
                if (p.color !== currentColor) {
                    currentColor = p.color;
                    ctx.fillStyle = currentColor;
                }
                
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        }
        
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
});
