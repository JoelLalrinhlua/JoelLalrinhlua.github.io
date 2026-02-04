// ===== PARTICLE SYSTEM =====
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        this.mouse = { x: null, y: null, radius: 150 };

        this.init();
        this.animate();
        this.setupEvents();
    }

    init() {
        this.resizeCanvas();
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });

        // Connect particles
        this.connectParticles();

        requestAnimationFrame(() => this.animate());
    }

    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.strokeStyle = `rgba(102, 126, 234, ${1 - distance / 120})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }

    update(mouse) {
        // Mouse interaction
        if (mouse.x != null && mouse.y != null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                this.vx -= Math.cos(angle) * force * 0.2;
                this.vy -= Math.sin(angle) * force * 0.2;
            }
        }

        // Move particle
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ===== NAVIGATION =====
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navLinks = document.querySelector('.nav-links');
        this.links = document.querySelectorAll('.nav-link');

        this.setupEvents();
        this.updateActiveLink();
    }

    setupEvents() {
        // Scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navLinks.classList.toggle('active');
        });

        // Close menu on link click
        this.links.forEach(link => {
            link.addEventListener('click', () => {
                this.hamburger.classList.remove('active');
                this.navLinks.classList.remove('active');
            });
        });

        // Update active link on scroll
        window.addEventListener('scroll', () => this.updateActiveLink());
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY + 100;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                this.links.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        this.setupObserver();
    }

    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, this.observerOptions);

        // Observe all sections except hero
        const sections = document.querySelectorAll('section:not(.hero-section)');
        sections.forEach(section => {
            section.classList.add('scroll-reveal');
            observer.observe(section);
        });

        // Observe cards individually for stagger effect
        const cards = document.querySelectorAll('.project-card, .skill-card, .stat-card');
        cards.forEach((card, index) => {
            card.classList.add('scroll-reveal');
            card.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(card);
        });
    }
}

// ===== COUNTER ANIMATION =====
class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number');
        this.animated = false;
        this.setupObserver();
    }

    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animateCounters();
                    this.animated = true;
                }
            });
        }, { threshold: 0.5 });

        if (this.counters.length > 0) {
            observer.observe(this.counters[0].closest('.stats-grid'));
        }
    }

    animateCounters() {
        this.counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current) + '+';
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + '+';
                }
            };

            updateCounter();
        });
    }
}

// ===== SMOOTH SCROLL =====
class SmoothScroll {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]');
        this.setupEvents();
    }

    setupEvents() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;

                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ===== FORM HANDLING =====
class FormHandler {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.setupEvents();
    }

    setupEvents() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    handleSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Create success message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: fadeInScale 0.4s ease-out;
            text-align: center;
        `;
        message.innerHTML = `
            <h3 style="margin-bottom: 0.5rem; font-size: 1.5rem;">Message Sent!</h3>
            <p style="opacity: 0.9;">Thank you for reaching out. I'll get back to you soon.</p>
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(message);

        // Reset form
        this.form.reset();

        // Remove message after 3 seconds
        setTimeout(() => {
            message.style.animation = 'fadeInScale 0.4s ease-out reverse';
            setTimeout(() => message.remove(), 400);
        }, 3000);
    }
}

// ===== CURSOR EFFECT =====
class CursorEffect {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursorDot = document.createElement('div');
        this.setupCursor();
        this.setupEvents();
    }

    setupCursor() {
        this.cursor.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            border: 2px solid rgba(102, 126, 234, 0.5);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.2s ease, opacity 0.2s ease;
            transform: translate(-50%, -50%);
        `;

        this.cursorDot.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: rgba(102, 126, 234, 0.8);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            transition: transform 0.1s ease;
            transform: translate(-50%, -50%);
        `;

        document.body.appendChild(this.cursor);
        document.body.appendChild(this.cursorDot);
    }

    setupEvents() {
        document.addEventListener('mousemove', (e) => {
            this.cursorDot.style.left = e.clientX + 'px';
            this.cursorDot.style.top = e.clientY + 'px';

            setTimeout(() => {
                this.cursor.style.left = e.clientX + 'px';
                this.cursor.style.top = e.clientY + 'px';
            }, 50);
        });

        // Scale up on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                this.cursor.style.borderColor = 'rgba(102, 126, 234, 0.8)';
            });

            el.addEventListener('mouseleave', () => {
                this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                this.cursor.style.borderColor = 'rgba(102, 126, 234, 0.5)';
            });
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
            this.cursorDot.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
            this.cursorDot.style.opacity = '1';
        });
    }
}

// ===== PARALLAX EFFECT =====
class ParallaxEffect {
    constructor() {
        this.setupParallax();
    }

    setupParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;

            // Hero parallax
            const hero = document.querySelector('.hero-section');
            if (hero) {
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                hero.style.opacity = 1 - (scrolled / 600);
            }

            // Floating card parallax
            const floatingCard = document.querySelector('.floating-card');
            if (floatingCard) {
                floatingCard.style.transform = `translateY(${scrolled * 0.3}px) rotateX(${scrolled * 0.02}deg)`;
            }
        });
    }
}

// ===== INITIALIZE ALL =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    new ParticleSystem();
    new Navigation();
    new ScrollAnimations();
    new CounterAnimation();
    new SmoothScroll();
    new FormHandler();
    new ParallaxEffect();

    // Only add custom cursor on desktop
    if (window.innerWidth > 968) {
        new CursorEffect();
    }

    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    }, 100);

    console.log('🚀 Portfolio loaded successfully!');
});

// ===== PERFORMANCE OPTIMIZATION =====
// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize resize events
window.addEventListener('resize', debounce(() => {
    // Reload cursor effect on resize
    if (window.innerWidth > 968) {
        if (!document.querySelector('.cursor-effect')) {
            new CursorEffect();
        }
    }
}, 250));
