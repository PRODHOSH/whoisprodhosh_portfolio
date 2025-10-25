/**
 * Simple Particles Implementation
 * A reliable particle system using Canvas 2D for better compatibility
 */

class SimpleParticles {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        
        // Default options
        this.options = {
            particleCount: 200,
            particleSize: 2,
            particleSpeed: 0.5,
            particleColors: ['#8a2be2', '#900fedff', '#6a0dad', '#ff69b4'],
            connectionDistance: 100,
            connectionOpacity: 0.1,
            mouseRepulsion: true,
            repulsionStrength: 2,
            ...options
        };
        
        this.init();
    }

    init() {
        this.createParticles();
        this.setupEventListeners();
        this.resize();
        this.animate();
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.options.particleSpeed,
                vy: (Math.random() - 0.5) * this.options.particleSpeed,
                size: Math.random() * this.options.particleSize + 1,
                color: this.options.particleColors[Math.floor(Math.random() * this.options.particleColors.length)],
                opacity: Math.random() * 0.8 + 0.2
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    resize() {
        const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.createParticles();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Enhanced Mouse interaction with stronger repulsion
            if (this.options.mouseRepulsion) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const force = (150 - distance) / 150;
                    const repulsionForce = force * this.options.repulsionStrength;
                    particle.x -= (dx / distance) * repulsionForce;
                    particle.y -= (dy / distance) * repulsionForce;
                    
                    // Add some velocity change for more dynamic effect
                    particle.vx -= (dx / distance) * force * 0.1;
                    particle.vy -= (dy / distance) * force * 0.1;
                }
            }
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Keep particles in bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();
        });
        
        // Draw connections
        this.drawConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        this.ctx.globalAlpha = this.options.connectionOpacity;
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.createParticles();
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleParticles;
} else if (typeof window !== 'undefined') {
    window.SimpleParticles = SimpleParticles;
}
