document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('spider-web-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const wrapper = document.getElementById('logo-3d-wrapper');

    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    class WebParticle {
        constructor(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 1.2;
            this.vy = (Math.random() - 0.5) * 1.2;
            this.radius = Math.random() * 1.5 + 0.5;
        }

        update(w, h) {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
        }
    }

    function init() {
        resize();
        particles = [];
        const numParticles = 40; // Dense enough for the logo box
        for (let i = 0; i < numParticles; i++) {
            particles.push(new WebParticle(width, height));
        }
    }

    function resize() {
        const rect = wrapper.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw background web nodes inside the 3D logo wrapper
        ctx.lineWidth = 0.8;
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(width, height);

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = dx * dx + dy * dy;

                if (dist < 4000) {
                    ctx.beginPath();
                    // Spiderman web color (white/grey)
                    ctx.strokeStyle = `rgba(200, 200, 200, ${0.4 - dist / 4000 * 0.4})`;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }

            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.arc(particles[i].x, particles[i].y, particles[i].radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Interactive Web Shooting from cursor
        const cx = width / 2;
        const cy = height / 2;

        const mdx = mouse.x - cx;
        const mdy = mouse.y - cy;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

        // If mouse is inside the wrapper
        if (mouse.x > 0 && mouse.x < width && mouse.y > 0 && mouse.y < height) {
            ctx.lineWidth = 1.5;
            const intensity = 0.8;

            // Draw web strands shooting from cursor to random nodes
            particles.forEach(p => {
                const pdx = mouse.x - p.x;
                const pdy = mouse.y - p.y;
                const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

                if (pDist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - pDist / 120})`;
                    ctx.moveTo(mouse.x, mouse.y);

                    // Jagged web physics
                    let currX = mouse.x;
                    let currY = mouse.y;
                    const steps = 3;
                    for (let s = 1; s <= steps; s++) {
                        const nextX = mouse.x + (p.x - mouse.x) * (s / steps) + (Math.random() - 0.5) * 15;
                        const nextY = mouse.y + (p.y - mouse.y) * (s / steps) + (Math.random() - 0.5) * 15;
                        ctx.lineTo(nextX, nextY);
                    }
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();

                    // Pull particles towards cursor
                    p.x += pdx * 0.05;
                    p.y += pdy * 0.05;
                }
            });
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        init();
    });

    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    wrapper.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    init();
    animate();
});
