// ===== UTILITIES =====
class Emitter {
    constructor() { this.events = {}; }
    on(e, fn, ctx) {
        (this.events[e] = this.events[e] || []).push({ fn, ctx });
    }
    off(e, fn, ctx) {
        this.events[e] = (this.events[e] || []).filter(l => l.fn !== fn || l.ctx !== ctx);
    }
    once(e, fn, ctx) {
        const wrap = (...args) => { this.off(e, wrap); fn.apply(ctx, args); };
        this.on(e, wrap);
    }
    emit(e, ...args) {
        (this.events[e] || []).forEach(l => l.fn.apply(l.ctx, args));
    }
}
const emitter = new Emitter();

class Ticker {
    constructor() { this.running = false; this.delta = 16; }
    init() {
        if (this.running) return;
        this.running = true;
        let last = performance.now();
        const loop = (now) => {
            this.delta = now - last; last = now;
            emitter.emit('tick', now);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    nextTick(fn, ctx) { requestAnimationFrame(() => fn.call(ctx)); }
}
const ticker = new Ticker();

// Perlin Noise
class Noise {
    constructor(seed) {
        this.grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
        this.p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
        this.perm = new Array(512);
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
    }
    dot(g, x, y) { return g[0] * x + g[1] * y; }
    perlin2(x, y) {
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        x -= Math.floor(x); y -= Math.floor(y);
        const u = x * x * x * (x * (x * 6 - 15) + 10), v = y * y * y * (y * (y * 6 - 15) + 10);
        const A = this.perm[X] + Y, B = this.perm[X + 1] + Y;
        return this.mix(
            this.mix(this.dot(this.grad3[this.perm[A] % 12], x, y), this.dot(this.grad3[this.perm[B] % 12], x - 1, y), u),
            this.mix(this.dot(this.grad3[this.perm[A + 1] % 12], x, y - 1), this.dot(this.grad3[this.perm[B + 1] % 12], x - 1, y - 1), u), v);
    }
    mix(a, b, t) { return (1 - t) * a + t * b; }
}

// ===== SITE CLASS =====
class Site {
    constructor() {
        this.windowWidth = 0; this.windowHeight = 0;
        this.bindEvents();
    }
    init() {
        this.initLenis();
        ticker.init();
        this.onResize();
        ticker.nextTick(this.intro, this);
    }
    bindEvents() {
        window.addEventListener('resize', () => {
            clearTimeout(this._rt);
            this._rt = setTimeout(() => this.onResize(), 200);
        });
        window.addEventListener('scroll', () => {
            window.scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            emitter.emit('scroll', window.scrollY);
        }, { passive: true });
        window.addEventListener('mousemove', e => emitter.emit('mousemove', e.clientX, e.clientY), { passive: true });

        // Intersection observer
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                entry.target.dispatchEvent(new CustomEvent('intersect', { detail: { isIntersecting: entry.isIntersecting } }));
                entry.target.classList.toggle('is-in-view', entry.isIntersecting);
            });
        }, { threshold: 0 });
        document.querySelectorAll('[data-intersect]').forEach(el => obs.observe(el));

        if (document.readyState === 'complete') this.siteLoaded();
        else window.addEventListener('load', () => this.siteLoaded(), { once: true });
    }
    initLenis() {
        if (typeof Lenis === 'undefined') return;
        const lenis = new Lenis();
        lenis.on('scroll', () => { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update(); });
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
        window.lenis = lenis;
    }
    siteLoaded() {
        document.documentElement.classList.add('is-loaded');
        emitter.emit('siteLoaded');
    }
    onResize() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        window.safeWidth = this.windowWidth;
        window.safeHeight = this.windowHeight;
        window.maxScrollTop = document.body.scrollHeight - window.safeHeight;
        emitter.emit('resize', true, true);
    }
    intro() {
        const wrapper = document.querySelector('.js-site-wrapper');
        const intro = document.querySelector('.js-intro');
        const mount = document.querySelector('.js-mount');
        if (!intro) return;
        const linesV = intro.querySelectorAll('.js-logo-line-v');
        const linesH = intro.querySelectorAll('.js-logo-line-h');
        const borderTop = intro.querySelector('.js-border-top');
        const borderLeft = intro.querySelector('.js-border-left');
        const borderRight = intro.querySelector('.js-border-right');
        const tl = gsap.timeline();
        tl.set(wrapper, { opacity: '' });
        tl.set(intro, { background: 'transparent' });
        tl.fromTo(linesV, { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'power4.inOut', stagger: 0.15 }, 0);
        tl.fromTo(linesH, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power4.inOut' }, 1);
        tl.set(linesV, { transformOrigin: '50% 0' });
        tl.fromTo(linesV, { scaleY: 1 }, { scaleY: 0, duration: 1, ease: 'power4.in', immediateRender: false, stagger: 0.1 }, 2);
        tl.fromTo(linesH, { scaleY: 1 }, { scaleY: 0, duration: 0.5, ease: 'power4.in', immediateRender: false }, 2.1);
        tl.from(borderTop, { scaleY: 0, duration: 3, ease: 'power3.inOut' }, 1);
        tl.from([borderLeft, borderRight], { scaleX: 0, duration: 3, ease: 'power3.inOut' }, 1);
        tl.call(() => document.dispatchEvent(new CustomEvent('intro')), null, '-=1.85');
        tl.call(() => {
            if (mount) mount.style.opacity = '1';
            intro.remove();
            document.documentElement.classList.remove('is-scroll-blocked');
            ticker.nextTick(() => emitter.emit('resize', true, true));
        }, null, 5);
    }
}

// ===== WAVES =====
class WavesSection {
    constructor() {
        this.el = document.querySelector('.a-waves');
        if (!this.el) return;
        this.svg = this.el.querySelector('.js-waves-svg');
        this.noise = new Noise(Math.random());
        this.lines = []; this.paths = [];
        this.mouse = { x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false };
        this.isInteractive = false; this.isPaused = true;
        this.setSize(); this.setLines(); this.bindEvents();
    }
    bindEvents() {
        emitter.on('mousemove', this.onMouseMove, this);
        emitter.on('resize', () => { this.setSize(); this.setLines(); }, this);
        this.el.addEventListener('intersect', e => {
            this.isPaused = !e.detail.isIntersecting;
            if (this.isPaused) emitter.off('tick', this.tick, this);
            else emitter.on('tick', this.tick, this);
        }, { passive: true });
        document.addEventListener('intro', () => { this.isInteractive = true; }, { once: true });
    }
    onMouseMove(x, y) {
        this.mouse.x = x - (this.bounding?.left || 0);
        this.mouse.y = y - (this.bounding?.top || 0) + window.scrollY;
        if (!this.mouse.set) { this.mouse.sx = this.mouse.x; this.mouse.sy = this.mouse.y; this.mouse.lx = this.mouse.x; this.mouse.ly = this.mouse.y; this.mouse.set = true; }
    }
    setSize() {
        const b = this.el.getBoundingClientRect();
        this.bounding = { left: b.left, top: b.top + window.scrollY, width: this.el.clientWidth, height: this.el.clientHeight };
        this.svg.style.width = this.bounding.width + 'px';
        this.svg.style.height = this.bounding.height + 'px';
    }
    setLines() {
        const { width, height } = this.bounding;
        this.lines = []; this.paths.forEach(p => p.remove()); this.paths = [];
        const xGap = 10, yGap = 32;
        const oW = width + 200, oH = height + 30;
        const totalL = Math.ceil(oW / xGap), totalP = Math.ceil(oH / yGap);
        const xS = (width - xGap * totalL) / 2, yS = (height - yGap * totalP) / 2;
        for (let i = 0; i <= totalL; i++) {
            const pts = [];
            for (let j = 0; j <= totalP; j++) pts.push({ x: xS + xGap * i, y: yS + yGap * j, wave: { x: 0, y: 0 }, cursor: { x: 0, y: 0, vx: 0, vy: 0 } });
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.classList.add('a__line');
            this.svg.appendChild(path);
            this.paths.push(path);
            this.lines.push(pts);
        }
        if (this.isPaused) this.drawLines();
    }
    tick(time) {
        const m = this.mouse;
        m.sx += (m.x - m.sx) * 0.1; m.sy += (m.y - m.sy) * 0.1;
        m.v = Math.hypot(m.x - m.lx, m.y - m.ly);
        m.vs += (m.v - m.vs) * 0.1; m.vs = Math.min(100, m.vs);
        m.a = Math.atan2(m.y - m.ly, m.x - m.lx);
        m.lx = m.x; m.ly = m.y;
        this.el.style.setProperty('--x', m.sx + 'px');
        this.el.style.setProperty('--y', m.sy + 'px');
        this.movePoints(time); this.drawLines();
    }
    movePoints(time) {
        this.lines.forEach(pts => {
            pts.forEach(p => {
                const mv = this.noise.perlin2((p.x + time * 0.0125) * 0.002, (p.y + time * 0.005) * 0.0015) * 12;
                p.wave.x = Math.cos(mv) * 32; p.wave.y = Math.sin(mv) * 16;
                if (this.isInteractive) {
                    const dx = p.x - this.mouse.sx, dy = p.y - this.mouse.sy;
                    const d = Math.hypot(dx, dy), l = Math.max(175, this.mouse.vs);
                    if (d < l) { const s = 1 - d / l, f = Math.cos(d * 0.001) * s; p.cursor.vx += Math.cos(this.mouse.a) * f * l * this.mouse.vs * 0.00065; p.cursor.vy += Math.sin(this.mouse.a) * f * l * this.mouse.vs * 0.00065; }
                    p.cursor.vx += (0 - p.cursor.x) * 0.005; p.cursor.vy += (0 - p.cursor.y) * 0.005;
                    p.cursor.vx *= 0.925; p.cursor.vy *= 0.925;
                    p.cursor.x += p.cursor.vx * 2; p.cursor.y += p.cursor.vy * 2;
                    p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x)); p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y));
                }
            });
        });
    }
    moved(p, cur = true) {
        return { x: Math.round((p.x + p.wave.x + (cur ? p.cursor.x : 0)) * 10) / 10, y: Math.round((p.y + p.wave.y + (cur ? p.cursor.y : 0)) * 10) / 10 };
    }
    drawLines() {
        this.lines.forEach((pts, i) => {
            let d = `M ${this.moved(pts[0], false).x} ${this.moved(pts[0], false).y}`;
            pts.forEach((p, j) => { const m = this.moved(p, j !== pts.length - 1); d += ` L ${m.x} ${m.y}`; });
            this.paths[i].setAttribute('d', d);
        });
    }
}

// ===== HERO =====
class HeroSection {
    constructor() {
        this.el = document.querySelector('.s-hero');
        if (!this.el) return;
        this.words = this.el.querySelectorAll('.js-word');
        this.chars = []; this.isPaused = true; this.isWaiting = true;
        if (document.readyState === 'complete') ticker.nextTick(this.init, this);
        else emitter.once('siteLoaded', this.init, this);
    }
    init() { this.splitWords(); this.bindEvents(); }
    bindEvents() {
        emitter.on('resize', () => this.splitWords(), this);
        document.addEventListener('intro', () => this.intro(), { once: true });
        this.el.addEventListener('intersect', e => {
            this.isPaused = !e.detail.isIntersecting;
            if (!this.isPaused) emitter.on('tick', this.tick, this);
            else emitter.off('tick', this.tick, this);
        }, { passive: true });
    }
    splitWords() {
        this.chars = [];
        this.words.forEach(w => {
            w.innerHTML = w.textContent.split('').map(c => {
                const cls = 'char char--' + c.toLowerCase();
                return `<span class="${cls}"><span class="char__inner" data-letter="${c.toUpperCase()}">${c}</span></span>`;
            }).join('');
            w.querySelectorAll('.char').forEach(c => this.chars.push(c));
        });
    }
    intro() {
        const content = this.el.querySelector('.js-hero-content');
        const border = this.el.querySelector('.js-hero-border');
        const chars = this.el.querySelectorAll('.char__inner');
        const seps = this.el.querySelectorAll('.js-separator');
        const star = this.el.querySelector('.js-star');
        const waves = this.el.querySelector('.a-waves');
        const tl = gsap.timeline();
        tl.set(this.el, { opacity: 1 }, 0);
        tl.to(border, { scaleY: 0.025, y: -(content?.clientHeight || 300), duration: 1, ease: 'expo.inOut' }, 0);
        if (waves) tl.from(waves, { y: '100%', duration: 1.35, ease: 'expo.out' }, 0);
        tl.fromTo(content, { clipPath: 'polygon(0 0,100% 0,100% 0,0 0)' }, { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', duration: 1, ease: 'expo.inOut' }, 1);
        tl.to(border, { scaleY: 1, y: 0, duration: 1, ease: 'expo.inOut' }, 1);
        if (star) tl.from(star, { rotate: 90, duration: 2, ease: 'expo.out' }, 1.5);
        tl.fromTo(chars, { y: '-200%' }, { y: '-100%', duration: 2, ease: 'expo.inOut', stagger: 0.02 }, 0.45);
        tl.from(seps, { y: (i) => i % 2 === 0 ? '-100%' : '100%', duration: 1.5, ease: 'expo.inOut' }, 0.75);
        tl.call(() => { this.isWaiting = false; });
    }
    tick() {
        if (this.isWaiting || Math.random() > 0.01 || !this.chars.length) return;
        const c = this.chars[Math.floor(Math.random() * this.chars.length)];
        if (c.classList.contains('to-top') || c.classList.contains('to-bottom')) return;
        const dir = ['bottom', 'left', 'top', 'right'][Math.floor(Math.random() * 4)];
        c.classList.add('to-' + dir);
        setTimeout(() => c.classList.remove('to-' + dir), 2000);
    }
}

// ===== ABOUT =====
class AboutSection {
    constructor() {
        this.el = document.querySelector('.s-about');
        if (!this.el) return;
        this.inner = this.el.querySelector('.js-about-inner');
        this.svg = this.el.querySelector('.js-about-grid');
        this.path = this.el.querySelector('.js-about-grid-path');
        this.skills = this.el.querySelectorAll('.js-skill');
        this.scroll = { start: 0, end: 0, p: 0, sp: 0 };
        this.isPaused = true;
        if (document.readyState === 'complete') ticker.nextTick(this.init, this);
        else emitter.once('siteLoaded', this.init, this);
    }
    init() {
        this.setSize(); this.setScroll(); this.bindEvents();
        if (this.el.classList.contains('is-in-view')) { this.isPaused = false; emitter.on('tick', this.tick, this); }
    }
    bindEvents() {
        emitter.on('resize', () => { this.setSize(); this.setScroll(); }, this);
        emitter.on('scroll', s => {
            const t = s + window.safeHeight;
            if (t < this.scroll.start) this.scroll.p = 0;
            else if (t > this.scroll.end) this.scroll.p = 1;
            else this.scroll.p = (t - this.scroll.start) / (this.scroll.end - this.scroll.start);
        }, this);
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-revealed'); obs.unobserve(e.target); } });
        }, { threshold: 0.5 });
        this.skills.forEach(s => {
            obs.observe(s);
            const handler = () => { s.classList.add('is-active'); setTimeout(() => s.classList.remove('is-active'), 100); };
            s.addEventListener('mouseenter', handler, { passive: true });
        });
        this.el.addEventListener('intersect', e => {
            this.isPaused = !e.detail.isIntersecting;
            if (this.isPaused) emitter.off('tick', this.tick, this);
            else emitter.on('tick', this.tick, this);
        }, { passive: true });
    }
    setSize() {
        const b = this.el.getBoundingClientRect();
        this.bounding = { width: this.el.clientWidth, height: this.el.clientHeight, innerWidth: this.inner?.clientWidth || 0, innerHeight: this.inner?.clientHeight || 0, offsetY: 0 };
        if (this.svg) { this.svg.style.width = this.bounding.width + 'px'; this.svg.style.height = this.bounding.height + 'px'; }
    }
    setScroll() {
        const b = this.el.getBoundingClientRect();
        this.scroll.start = b.top + window.scrollY;
        this.scroll.end = b.top + window.scrollY + this.bounding.height + window.safeHeight;
    }
    setLines() {
        const { bounding } = this;
        const innerX = (bounding.width - bounding.innerWidth) / 2;
        const innerY = (bounding.height - bounding.innerHeight) / 2 + bounding.offsetY;
        const vL = window.safeWidth > 767 ? 12 : 8;
        const oGX = bounding.width / vL, iGX = bounding.innerWidth / vL;
        let d = '';
        for (let i = 1; i < vL; i++) {
            d += `M ${oGX * i} 0 L ${innerX + iGX * i} ${innerY} `;
            d += `M ${oGX * i} ${bounding.height} L ${innerX + iGX * i} ${innerY + bounding.innerHeight} `;
        }
        const oGY = bounding.height / vL, iGY = bounding.innerHeight / vL;
        for (let i = 0; i <= vL; i++) {
            d += `M 0 ${oGY * i} L ${innerX} ${innerY + iGY * i} `;
            d += `M ${bounding.width} ${oGY * i} L ${innerX + bounding.innerWidth} ${innerY + iGY * i} `;
        }
        if (this.path) this.path.setAttribute('d', d);
    }
    tick() {
        this.scroll.sp += (this.scroll.p - this.scroll.sp) * 0.2;
        this.bounding.offsetY = (window.safeWidth > 767 ? 400 : 200) * (this.scroll.sp * 2 - 1);
        this.el.style.setProperty('--offset-y', this.bounding.offsetY + 'px');
        this.setLines();
    }
}

// ===== WORK =====
class WorkSection {
    constructor() {
        this.el = document.querySelector('.s-work');
        if (!this.el) return;
        this.container = this.el.querySelector('.js-work-container');
        this.scene = this.el.querySelector('.js-work-scene');
        this.projects = this.el.querySelectorAll('.js-project');
        this.isPaused = true;
        if (document.readyState === 'complete') ticker.nextTick(this.init, this);
        else emitter.once('siteLoaded', this.init, this);
    }
    init() {
        this.setSize(); this.setProjects(); this.setTimeline(); this.bindEvents();
    }
    bindEvents() {
        emitter.on('resize', () => { this.setSize(); this.setProjects(); }, this);
        this.el.addEventListener('intersect', e => {
            this.isPaused = !e.detail.isIntersecting;
            this.projects.forEach(p => p.classList.toggle('is-visible', !this.isPaused));
        }, { passive: true });
    }
    setSize() {
        this.el.style.setProperty('--height', Math.max(this.projects.length * 50, 200) + 'lvh');
    }
    setProjects() {
        const w = window.safeWidth || window.innerWidth, h = window.safeHeight || window.innerHeight;
        this.projects.forEach((p, i) => {
            const angle = (i / this.projects.length) * Math.PI * 2;
            const radius = Math.min(w, h) * 0.25;
            p.style.left = (w / 2 - 160 + Math.cos(angle) * radius) + 'px';
            p.style.top = (h / 2 - 100 + Math.sin(angle) * radius * 0.6) + 'px';
        });
    }
    setTimeline() {
        if (this.tl) this.tl.kill();
        this.tl = gsap.timeline({
            scrollTrigger: { trigger: this.el, start: 'top 25%', end: 'bottom 75%', scrub: 1 }
        });
        this.projects.forEach((p, i) => {
            this.tl.fromTo(p, { y: 200, rotation: -5 + Math.random() * 10 }, { y: -200, rotation: 5 - Math.random() * 10, ease: 'none' }, i * 0.1);
        });
    }
}

// ===== MY WAY / PROCESS =====
class MyWaySection {
    constructor() {
        this.el = document.querySelector('.s-my-way');
        if (!this.el) return;
        this.svg = this.el.querySelector('.js-myway-svg');
        this.objectsWrapper = this.el.querySelector('.js-objects');
        this.smiley = { el: this.el.querySelector('.js-smiley'), rel: { x: 0, y: 0 } };
        this.linesPath = this.el.querySelector('.js-myway-lines-path');
        this.objects = [];
        this.thrownObjects = [];
        this.isPaused = true;
        this.mouse = { x: 0, y: 0, oy: 0, sx: 0, sy: 0, set: false };
        Array.from(this.objectsWrapper?.children || []).forEach(el => {
            if (el.classList.contains('s__ruler')) return;
            this.objects.push(new FloatingObject(el, this));
        });
        if (document.readyState === 'complete') ticker.nextTick(this.init, this);
        else emitter.once('siteLoaded', this.init, this);
    }
    init() {
        this.setSize(); this.setLines(); this.bindEvents(); this.firstObjects();
    }
    bindEvents() {
        emitter.on('resize', () => { this.setSize(); this.setLines(); }, this);
        emitter.on('tick', this.tick, this);
        this.el.addEventListener('intersect', e => {
            this.isPaused = !e.detail.isIntersecting;
        }, { passive: true });
    }
    setSize() {
        const b = this.el.getBoundingClientRect();
        this.bounding = { left: b.left, top: b.top, width: b.width, height: b.height };
        if (this.svg) { this.svg.style.width = b.width + 'px'; this.svg.style.height = b.height + 'px'; }
        if (this.smiley.el) {
            const sb = this.smiley.el.getBoundingClientRect();
            this.smiley.rel.x = sb.left - b.left + sb.width / 2;
            this.smiley.rel.y = sb.top - b.top + sb.height / 2;
        }
        this.mouse.oy = b.top + window.scrollY;
    }
    setLines() {
        if (!this.linesPath || !this.bounding) return;
        const { width, height } = this.bounding;
        const cx = this.smiley.rel.x, cy = this.smiley.rel.y;
        const vL = window.safeWidth > 767 ? 12 : 8;
        const gX = width / vL;
        let d = `M 0 ${height} L ${width} ${height}`;
        for (let i = 0; i <= vL; i++) {
            d += ` M ${gX * i} 0 L ${cx} ${cy}`;
            d += ` M ${gX * i} ${height} L ${cx} ${cy}`;
        }
        this.linesPath.setAttribute('d', d);
    }
    firstObjects() {
        const total = Math.max(Math.min(Math.round((window.safeWidth || 1200) * 0.025), 5), 2);
        for (let i = 0; i < total && this.objects.length > 0; i++) {
            const obj = this.objects.splice(Math.floor(Math.random() * this.objects.length), 1)[0];
            obj.set(false); this.thrownObjects.push(obj);
        }
    }
    tick(time) {
        if (this.isPaused) return;
        this.thrownObjects.forEach(o => o.move(time));
    }
}

class FloatingObject {
    constructor(el, parent) {
        this.el = el; this.parent = parent;
        this.x = 0; this.y = 0; this.z = -20000;
        this.rx = 0; this.ry = 0; this.rz = 0; this.s = 0;
        this.vx = 0; this.vy = 0; this.vz = 0; this.vrx = 0; this.vry = 0;
        this.isWaiting = true; this.isDragging = false;
    }
    set(fromScratch = true) {
        this.el.style.setProperty('--size', String(0.5 + Math.random() * 0.5));
        this.s = 0; this.x = 0; this.y = 0; this.z = -20000;
        this.rx = 90; this.ry = Math.random() * 2 - 1; this.rz = 0;
        this.vz = 40 + Math.random() * 10;
        this.vx = Math.random() * (window.safeWidth || 1200) * 0.0025 * (Math.random() > 0.5 ? -1 : 1);
        this.vy = Math.random() * (window.safeHeight || 800) * 0.0025 * (Math.random() > 0.5 ? -1 : 1);
        this.vrx = 0.25 + Math.random(); this.vry = 0.25 + Math.random();
        this.isWaiting = false; this.isDragging = false;
        this.el.classList.remove('is-waiting', 'is-dragging');
        if (!fromScratch) {
            this.s = 1; this.x = this.vx * Math.random() * 200; this.y = this.vy * Math.random() * 200;
            this.rx = Math.random() * 360; this.ry = Math.random() * 360; this.z = Math.random() * -20000;
        }
        this.el.style.setProperty('--s', String(this.s));
    }
    move() {
        if (this.isWaiting) return;
        if (this.z > 1000) { this.isWaiting = true; this.el.classList.add('is-waiting'); this.parent.objects.push(this); this.parent.thrownObjects.splice(this.parent.thrownObjects.indexOf(this), 1); return; }
        this.s += 0.005; this.s = Math.min(this.s, 1);
        this.z += this.vz; this.x += this.vx; this.y += this.vy;
        this.rx += this.vrx; this.ry += this.vry;
        this.el.style.setProperty('--x', this.x + 'px');
        this.el.style.setProperty('--y', this.y + 'px');
        this.el.style.setProperty('--z', this.z + 'px');
        this.el.style.setProperty('--rx', String(this.rx));
        this.el.style.setProperty('--ry', String(this.ry));
        this.el.style.setProperty('--rz', String(this.rz));
        this.el.style.setProperty('--s', String(this.s));
    }
}

// ===== CTA =====
class CTASection {
    constructor() {
        this.el = document.querySelector('.s-cta');
        if (!this.el) return;
        this.container = this.el.querySelector('.js-cta-container');
        this.hover = this.el.querySelector('.js-cta-hover');
        this.button = this.el.querySelector('.js-cta-button');
        this.cta = this.el.querySelector('.js-cta-circle');
        this.gridEl = this.el.querySelector('.js-cta-grid');
        this.gridSvg = this.el.querySelector('.js-cta-grid-svg');
        this.gridPath = this.el.querySelector('.js-cta-grid-path');
        this.buttonIsHovered = false; this.isPaused = true;
        this.wave = { progress: 0, op: 0, speed: 15, strength: 1, state: 'paused' };
        this.grid = { points: [], vLines: 0, hLines: 0, gapX: 0, gapY: 0, width: 0, height: 0 };
        if (document.readyState === 'complete') ticker.nextTick(this.init, this);
        else emitter.once('siteLoaded', this.init, this);
    }
    init() { this.setSize(); this.setGrid(); this.createPulse(); this.bindEvents(); }
    bindEvents() {
        emitter.on('resize', () => { this.setSize(); this.setGrid(); }, this);
        if (this.hover) {
            this.hover.addEventListener('mouseenter', e => { this.onHover(e); });
            this.hover.addEventListener('mouseleave', e => { this.onOut(e); });
            this.hover.addEventListener('touchstart', e => { this.onHover(e); });
        }
        this.el.addEventListener('intersect', e => {
            this.isPaused = !e.detail.isIntersecting;
            if (this.isPaused) emitter.off('tick', this.tick, this);
            else emitter.on('tick', this.tick, this);
        }, { passive: true });
    }
    setSize() {
        if (!this.gridEl || !this.container) return;
        const gb = this.gridEl.getBoundingClientRect();
        const cb = this.container.getBoundingClientRect();
        this.grid.width = gb.width; this.grid.height = gb.height;
        if (this.gridSvg) { this.gridSvg.style.width = gb.width + 'px'; this.gridSvg.style.height = gb.height + 'px'; }
        const maxSize = Math.min(cb.width, cb.height) - 32;
        if (this.cta) this.cta.style.setProperty('--size', maxSize + 'px');
    }
    setGrid() {
        const { grid } = this;
        grid.points = [];
        grid.vLines = window.safeWidth > 767 ? 12 : 8;
        grid.gapX = grid.width / grid.vLines;
        grid.gapY = (this.container?.getBoundingClientRect().height || 600) / 8;
        grid.hLines = Math.floor(grid.height / grid.gapY);
        for (let i = 0; i <= grid.vLines; i++) {
            const row = [];
            for (let j = 0; j <= grid.hLines; j++) row.push({ x: grid.gapX * i, y: grid.gapY * j, vx: 0, vy: 0, wx: 0, wy: 0 });
            grid.points.push(row);
        }
        this.drawGrid();
    }
    createPulse() {
        const text = this.el.querySelector('.js-cta-button-text');
        if (!text) return;
        this.tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
        this.tl.call(() => { this.wave.state = 'pulse'; });
        this.tl.fromTo(text, { scale: 0.85 }, { scale: 1.05, duration: 2.7, ease: 'power2.in' });
        this.tl.call(() => { this.wavePulse(); });
        this.tl.to(text, { scale: 0.85, duration: 0.15, ease: 'power4.out' });
    }
    onHover(e) {
        if (this.buttonIsHovered) return;
        this.buttonIsHovered = true;
        this.hover.classList.add('is-active');
        if (this.tl) this.tl.pause();
        gsap.to(this.wave, { op: 1, delay: 0.3, duration: 1.2, ease: 'expo.inOut', overwrite: true });
        e.stopPropagation();
    }
    onOut(e) {
        if (!this.buttonIsHovered) return;
        this.buttonIsHovered = false;
        this.hover.classList.remove('is-active');
        if (this.tl) this.tl.play(0);
        gsap.to(this.wave, { op: 0, duration: 0.7, ease: 'expo.inOut', overwrite: true });
    }
    wavePulse() {
        if (this.buttonIsHovered) return;
        this.wave.progress = 0; this.wave.state = 'pulse';
        this.wave.speed = window.safeWidth > 767 ? 15 : 10;
        this.wave.strength = window.safeWidth > 767 ? 1 : 0.35;
    }
    drawGrid() {
        const { grid } = this;
        if (!this.gridPath) return;
        let d = '';
        grid.points.forEach(col => { col.forEach((p, i) => { d += (i === 0 ? `M ${p.x + p.wx} ${p.y + p.wy} ` : `L ${p.x + p.wx} ${p.y + p.wy} `); }); });
        for (let y = 0; y <= grid.hLines; y++) { grid.points.forEach((col, x) => { const p = col[y]; if (!p) return; d += (x === 0 ? `M ${p.x + p.wx} ${p.y + p.wy} ` : `L ${p.x + p.wx} ${p.y + p.wy} `); }); }
        this.gridPath.setAttribute('d', d);
    }
    tick() {
        if (this.wave.progress < this.grid.height && this.wave.state !== 'paused') this.wave.progress += this.wave.speed;
        this.grid.points.forEach(col => {
            col.forEach(p => {
                p.vx += (0 - p.wx) * 0.001; p.vy += (0 - p.wy) * 0.001;
                p.vx *= 0.9; p.vy *= 0.9;
                p.wx += p.vx * 3; p.wy += p.vy * 3;
                p.wx *= 0.9; p.wy *= 0.9;
            });
        });
        this.drawGrid();
    }
}

// ===== HEADER =====
class HeaderSection {
    constructor() {
        this.el = document.querySelector('.site-head');
        if (!this.el) return;
        this.console = document.querySelector('.js-console');
        this.contrastButton = document.querySelector('.js-contrast');
        this.contrastMask = document.querySelector('.js-contrast-mask');
        this.links = this.el.querySelectorAll('.js-menu-link');
        this.messages = ['Preparing debugging session', 'Compiling designer dreams', 'Optimizing creativity', 'Loading animations', 'Calibrating pixels', 'Running protocols', 'Crafting magic', 'Aligning elements', 'Integrating code', 'Almost ready'];
        this.message = ''; this.lastMessage = ''; this.lastTypeTime = 0;
        this.writeDelay = 0; this.canWrite = false;
        this.bindEvents();
    }
    bindEvents() {
        if (this.contrastButton) this.contrastButton.addEventListener('click', () => this.toggleContrast(), { passive: true });
        this.links.forEach(l => l.addEventListener('click', e => {
            e.preventDefault();
            const id = l.getAttribute('href');
            if (window.lenis) window.lenis.scrollTo(id, { duration: 1.5 });
            else document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
        }));
        document.addEventListener('intro', () => this.intro(), { once: true });
        emitter.on('tick', this.updateConsole, this);
    }
    intro() {
        const logo = this.el.querySelector('.js-logo');
        const items = this.el.querySelectorAll('.js-menu-item');
        const tl = gsap.timeline();
        tl.set(this.el, { opacity: 1 });
        tl.from(this.el, { y: '-100%', duration: 1.5, ease: 'expo.inOut' }, 1);
        tl.from([logo, ...items], { y: '-100%', duration: 1.5, ease: 'expo.out', stagger: 0.1 }, 1.5);
        tl.call(() => { this.canWrite = true; }, null, 1.5);
    }
    toggleContrast() {
        const isContrasted = document.documentElement.classList.contains('theme-contrasted');
        gsap.fromTo(this.contrastMask, { x: isContrasted ? '-100%' : '0' }, {
            x: isContrasted ? '0' : '-100%', duration: 1, ease: 'expo.inOut',
            onComplete: () => {
                this.contrastMask.style.transform = '';
                document.documentElement.classList.toggle('theme-contrasted');
            }
        });
        if (!isContrasted) document.documentElement.classList.add('theme-contrasted');
    }
    updateConsole(time) {
        if (!this.canWrite || !this.console || time - this.lastTypeTime < this.writeDelay) return;
        if (!this.message) { this.message = this.messages[Math.floor(Math.random() * this.messages.length)]; this.writeDelay = 2000; }
        else {
            if (this.message === this.lastMessage) this.console.textContent += '\n';
            this.console.textContent += this.message.charAt(0);
            this.message = this.message.substring(1);
            this.writeDelay = this.message.charAt(0) === '…' ? 400 : 20;
        }
        this.console.textContent = this.console.textContent.split('\n').slice(-5).join('\n');
        this.lastTypeTime = time; this.lastMessage = this.message || this.lastMessage;
    }
}

// ===== SCROLLBAR =====
class CustomScrollbar {
    constructor() {
        this.thumb = document.querySelector('.js-scrollbar-thumb');
        if (!this.thumb) return;
        emitter.on('scroll', () => {
            const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            this.thumb.style.transform = `translateY(${p * (window.innerHeight - this.thumb.clientHeight)}px)`;
        });
    }
}

// ===== CONTACT MODAL =====
function initContactModal() {
    const link = document.querySelector('.s__cta__link');
    const modal = document.getElementById('contact-modal');
    const closeBtn = document.getElementById('modal-close');
    const backdrop = document.querySelector('.modal-backdrop');
    if (!modal) return;
    const open = () => { modal.classList.add('active'); };
    const close = () => { modal.classList.remove('active'); };
    if (link) link.addEventListener('click', e => { e.preventDefault(); open(); });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) close(); });
}

// ===== INIT =====
gsap.registerPlugin(ScrollTrigger);
const site = new Site();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => site.init(), { once: true });
} else { site.init(); }

new WavesSection();
new HeroSection();
new AboutSection();
new WorkSection();
new MyWaySection();
new CTASection();
new HeaderSection();
new CustomScrollbar();
initContactModal();

console.log('%c✨ Portfolio by Joel Lalrinhlua', 'color: #160000; background: #f40c3f; padding: 10px 20px; font-size: 14px;');
