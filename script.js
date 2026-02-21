// ===== PLAYFUL CREATIVE PORTFOLIO ANIMATIONS =====
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    initLoader();
    initCustomCursor();
    initMenu();
    initHeroAnimations();
    initScrollAnimations();
    initMagneticElements();
    initContactModal();
    initSmoothScroll();
});

// ===== LOADING SCREEN =====
function initLoader() {
    const loader = document.getElementById('loader');
    const loaderWords = document.querySelectorAll('.loader-word');

    const tl = gsap.timeline({
        onComplete: () => {
            loader.style.display = 'none';
            document.body.style.overflow = 'auto';
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

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

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
    gsap.set('.hero-word', { y: '100%', opacity: 0 });
    gsap.set('.hero-tagline', { y: 30, opacity: 0 });
    gsap.set('.hero-skills', { y: 30, opacity: 0 });
    gsap.set('.hero-avatar-wrapper', { scale: 0.8, opacity: 0 });
    gsap.set('.hero-scroll', { opacity: 0 });
    gsap.set('.hero-top-bar', { y: -20, opacity: 0 });
    gsap.set('.hero-bottom-bar', { y: 20, opacity: 0 });
}

function animateHeroContent() {
    const tl = gsap.timeline();

    tl.to('.hero-top-bar', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out'
    })
        .to('.hero-word', {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out'
        }, '-=0.3')
        .to('.hero-avatar-wrapper', {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(1.7)'
        }, '-=0.6')
        .to('.hero-tagline', {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out'
        }, '-=0.4')
        .to('.hero-skills', {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out'
        }, '-=0.4')
        .to('.hero-bottom-bar', {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out'
        }, '-=0.3')
        .to('.hero-scroll', {
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out'
        }, '-=0.2');
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    // Split text animations
    const splitTexts = document.querySelectorAll('[data-animation="split"]');
    splitTexts.forEach(text => {
        gsap.fromTo(text,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.9,
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
            { y: 35, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                delay: index * 0.08,
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
    const sectionHeaders = document.querySelectorAll('.section-header');
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
    if (serviceItems.length > 0) {
        gsap.fromTo(serviceItems,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // Work cards stagger
    const workCards = document.querySelectorAll('.work-card');
    if (workCards.length > 0) {
        gsap.fromTo(workCards,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.works-numbered-grid',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // About columns stagger
    const aboutCols = document.querySelectorAll('.about-column');
    if (aboutCols.length > 0) {
        gsap.fromTo(aboutCols,
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.about-details-grid',
                    start: 'top 78%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // Testimonial cards stagger
    const testmCards = document.querySelectorAll('.testimonial-card');
    if (testmCards.length > 0) {
        gsap.fromTo(testmCards,
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.testimonials-slider',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // Process steps stagger
    const processSteps = document.querySelectorAll('.process-step');
    if (processSteps.length > 0) {
        gsap.fromTo(processSteps,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.process-steps',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // Floating deco stars
    const decoStars = document.querySelectorAll('.deco-star');
    decoStars.forEach(star => {
        gsap.fromTo(star,
            { scale: 0, rotation: -180 },
            {
                scale: 1,
                rotation: 0,
                duration: 0.8,
                ease: 'back.out(2)',
                scrollTrigger: {
                    trigger: star,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
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

// ===== CONTACT MODAL =====
function initContactModal() {
    const modalTrigger = document.querySelector('.mt-trigger');
    const modal = document.getElementById('contact-modal');
    const modalClose = document.getElementById('modal-close');
    const modalBackdrop = document.querySelector('.modal-backdrop');

    if (!modal || !modalTrigger || !modalClose) return;

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Optional: Animate form elements in
        const formElements = modal.querySelectorAll('.form-group, .submit-btn');
        gsap.fromTo(formElements,
            { y: 20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.1,
                delay: 0.2,
                ease: 'power2.out'
            }
        );
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    modalTrigger.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
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
        nav.style.background = 'rgba(245, 245, 240, 0.92)';
        nav.style.backdropFilter = 'blur(12px)';
        nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
    } else {
        nav.style.background = 'transparent';
        nav.style.backdropFilter = 'none';
        nav.style.boxShadow = 'none';
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
console.log('%c✨ Portfolio by Joel Lalrinhlua', 'color: #1a1a1a; background: #f5f5f0; padding: 10px 20px; font-size: 14px; border-radius: 8px;');
