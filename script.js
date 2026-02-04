// ===== RAW MATERIALS STYLE ANIMATIONS =====
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initialize all features
    initLoader();
    initCustomCursor();
    initMenu();
    initHeroAnimations();
    initScrollAnimations();
    initHorizontalScroll();
    initMagneticElements();
    initCounterAnimations();
    initSmoothScroll();
});

// ===== LOADING SCREEN =====
function initLoader() {
    const loader = document.getElementById('loader');
    const loaderWords = document.querySelectorAll('.loader-word');

    // Animate loader out after loading
    const tl = gsap.timeline({
        onComplete: () => {
            loader.style.display = 'none';
            document.body.style.overflow = 'auto';

            // Trigger hero animations after loader
            animateHeroContent();
        }
    });

    tl.to(loaderWords, {
        duration: 0.8,
        y: '-100%',
        stagger: 0.1,
        delay: 2.2,
        ease: 'power3.inOut'
    })
        .to(loader, {
            duration: 0.8,
            yPercent: -100,
            ease: 'power3.inOut'
        }, '-=0.3');
}

// ===== CUSTOM CURSOR =====
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursor-follower');

    if (!cursor || !cursorFollower) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor animation
    function animateCursor() {
        // Cursor follows immediately
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;

        // Follower has more delay
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .magnetic');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorFollower.classList.add('hover');
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorFollower.classList.remove('hover');
        });
    });
}

// ===== MENU =====
function initMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-link');

    if (!menuBtn || !menuOverlay) return;

    let isOpen = false;

    menuBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        menuBtn.classList.toggle('active');
        menuOverlay.classList.toggle('active');

        if (isOpen) {
            document.body.style.overflow = 'hidden';

            // Animate menu links
            gsap.fromTo(menuLinks,
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.05,
                    delay: 0.2,
                    ease: 'power3.out'
                }
            );
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close menu on link click
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            isOpen = false;
            menuBtn.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

// ===== HERO ANIMATIONS =====
function initHeroAnimations() {
    // Initial state - hero words hidden
    gsap.set('.hero-word', { y: '100%', opacity: 0 });
    gsap.set('.hero-tagline', { y: 30, opacity: 0 });
    gsap.set('.hero-cta', { y: 30, opacity: 0 });
    gsap.set('.hero-scroll', { opacity: 0 });
}

function animateHeroContent() {
    const tl = gsap.timeline();

    tl.to('.hero-word', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out'
    })
        .to('.hero-tagline', {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5')
        .to('.hero-cta', {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5')
        .to('.hero-scroll', {
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.3');
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    // Split text animations
    const splitTexts = document.querySelectorAll('[data-animation="split"]');

    splitTexts.forEach(text => {
        gsap.fromTo(text,
            {
                y: 60,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: text,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Fade animations
    const fadeElements = document.querySelectorAll('[data-animation="fade"]');

    fadeElements.forEach((el, index) => {
        gsap.fromTo(el,
            {
                y: 40,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Section headers
    const sectionHeaders = document.querySelectorAll('.section-label, .section-number');

    sectionHeaders.forEach(header => {
        gsap.fromTo(header,
            { y: 20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Service items staggered animation
    const serviceItems = document.querySelectorAll('.service-item');

    gsap.fromTo(serviceItems,
        { y: 60, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.services-grid',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            }
        }
    );

    // Work items parallax
    const workItems = document.querySelectorAll('.work-item');

    workItems.forEach((item, index) => {
        gsap.fromTo(item.querySelector('.work-image-inner'),
            { scale: 1.2 },
            {
                scale: 1,
                duration: 1.5,
                ease: 'power2.out',
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

// ===== HORIZONTAL SCROLL =====
function initHorizontalScroll() {
    const horizontalSection = document.querySelector('.work-horizontal');
    const wrapper = document.querySelector('.work-horizontal-wrapper');

    if (!horizontalSection || !wrapper) return;

    // Calculate total scroll width
    const items = wrapper.querySelectorAll('.work-item');
    const totalWidth = (items.length * 540) - window.innerWidth + 200;

    gsap.to(wrapper, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
            trigger: horizontalSection,
            start: 'top top',
            end: `+=${totalWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1
        }
    });
}

// ===== MAGNETIC ELEMENTS =====
function initMagneticElements() {
    const magneticElements = document.querySelectorAll('.magnetic');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(el, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });
}

// ===== COUNTER ANIMATIONS =====
function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));

        ScrollTrigger.create({
            trigger: counter,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(counter, {
                    textContent: target,
                    duration: 2,
                    ease: 'power2.out',
                    snap: { textContent: 1 },
                    onUpdate: function () {
                        counter.textContent = Math.round(this.targets()[0].textContent);
                    }
                });
            },
            once: true
        });
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');

            if (targetId === '#') return;

            const target = document.querySelector(targetId);

            if (target) {
                gsap.to(window, {
                    scrollTo: {
                        y: target,
                        offsetY: 0
                    },
                    duration: 1.2,
                    ease: 'power3.inOut'
                });
            }
        });
    });

    // Back to top
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            gsap.to(window, {
                scrollTo: { y: 0 },
                duration: 1.2,
                ease: 'power3.inOut'
            });
        });
    }
}

// ===== MARQUEE PAUSE ON HOVER =====
const marquee = document.querySelector('.marquee-content');
if (marquee) {
    marquee.addEventListener('mouseenter', () => {
        marquee.style.animationPlayState = 'paused';
    });

    marquee.addEventListener('mouseleave', () => {
        marquee.style.animationPlayState = 'running';
    });
}

// ===== NAVBAR SCROLL BEHAVIOR =====
let lastScroll = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 100) {
        nav.style.mixBlendMode = 'normal';
        nav.style.background = 'rgba(10, 10, 10, 0.9)';
        nav.style.backdropFilter = 'blur(10px)';
    } else {
        nav.style.mixBlendMode = 'difference';
        nav.style.background = 'transparent';
        nav.style.backdropFilter = 'none';
    }

    lastScroll = currentScroll;
});

// ===== RESIZE HANDLER =====
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});

// ===== LOG =====
console.log('%c✨ Portfolio by Joel Lalrinhlua', 'color: #fff; background: #0a0a0a; padding: 10px 20px; font-size: 14px;');
