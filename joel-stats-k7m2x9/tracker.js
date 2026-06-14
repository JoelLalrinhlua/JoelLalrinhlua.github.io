/**
 * joelalrinhlua.me — Site Tracker
 * Embed this on every page: <script src="/tracker.js"></script>
 * It auto-detects page, device, browser, and sends events to Supabase.
 */
(function () {
    const SUPA = 'https://ztkzofjklpzrzskxacll.supabase.co/rest/v1/site_analytics';
    const KEY = 'sb_publishable_uunVH0MPwzPTKBek4kK5NQ_LULAfOyB';

    // ── Parse device / browser from UA ──────────────────────────────────────────
    function parseUA(ua) {
        const u = ua || navigator.userAgent;

        // Device type
        let device_type = 'desktop';
        if (/tablet|ipad|playbook|silk/i.test(u)) device_type = 'tablet';
        else if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(u)) device_type = 'mobile';

        // OS
        let os = 'Unknown';
        if (/windows nt 10/i.test(u)) os = 'Windows 10/11';
        else if (/windows nt/i.test(u)) os = 'Windows';
        else if (/iphone os (\d+)/i.test(u)) os = 'iOS ' + u.match(/iphone os (\d+)/i)[1];
        else if (/ipad.*os (\d+)/i.test(u)) os = 'iPadOS ' + u.match(/ipad.*os (\d+)/i)[1];
        else if (/android (\d+)/i.test(u)) os = 'Android ' + u.match(/android (\d+)/i)[1];
        else if (/mac os x (\d+[_\.]\d+)/i.test(u)) os = 'macOS ' + u.match(/mac os x (\d+[_\.]\d+)/i)[1].replace('_', '.');
        else if (/linux/i.test(u)) os = 'Linux';

        // Device model (best effort)
        let device_model = null;
        const iphone = u.match(/iphone/i);
        const ipad = u.match(/ipad/i);
        const android = u.match(/android[\s\/][\d.]+;\s*([^;)]+)/i);
        if (iphone) device_model = 'iPhone';
        else if (ipad) device_model = 'iPad';
        else if (android) device_model = android[1].trim();

        // Browser
        let browser = 'Unknown';
        if (/edg\//i.test(u)) browser = 'Edge';
        else if (/opr\//i.test(u)) browser = 'Opera';
        else if (/chrome\/[\d]+/i.test(u) && !/chromium/i.test(u)) browser = 'Chrome';
        else if (/firefox\/[\d]+/i.test(u)) browser = 'Firefox';
        else if (/safari\/[\d]+/i.test(u) && !/chrome/i.test(u)) browser = 'Safari';
        else if (/msie|trident/i.test(u)) browser = 'IE';

        // Browser version
        let browser_version = null;
        const chromev = u.match(/chrome\/([\d.]+)/i);
        const ffv = u.match(/firefox\/([\d.]+)/i);
        const safv = u.match(/version\/([\d.]+)/i);
        const edgv = u.match(/edg\/([\d.]+)/i);
        if (edgv) browser_version = edgv[1];
        else if (chromev) browser_version = chromev[1].split('.').slice(0, 2).join('.');
        else if (ffv) browser_version = ffv[1];
        else if (safv) browser_version = safv[1];

        return { device_type, os, device_model, browser, browser_version };
    }

    // ── Screen / viewport info ───────────────────────────────────────────────────
    function getScreen() {
        return {
            screen_width: window.screen.width,
            screen_height: window.screen.height,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
        };
    }

    // ── Send event ───────────────────────────────────────────────────────────────
    async function send(event_type, extra) {
        const ua = parseUA();
        const screen = getScreen();
        const payload = {
            event_type,
            page: window.location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            language: navigator.language || null,
            ...ua,
            ...screen,
            ...extra,
        };
        try {
            await fetch(SUPA, {
                method: 'POST',
                headers: {
                    'apikey': KEY,
                    'Authorization': 'Bearer ' + KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify(payload),
            });
        } catch (e) {
            // Silent fail — never break the user experience
        }
    }

    // ── Page view ─────────────────────────────────────────────────────────────────
    send('page_view');

    // ── Download tracking (for /download-chhehchhawl) ────────────────────────────
    function trackDownloads() {
        document.querySelectorAll('a[href], button').forEach(function (el) {
            const href = el.getAttribute('href') || '';
            const isDownload = el.hasAttribute('download')
                || /\.(apk|ipa|exe|zip|dmg|pkg|msi|deb|rpm)(\?|$)/i.test(href)
                || el.dataset.track === 'download';

            if (!isDownload) return;

            // Remove any existing listeners to avoid double-firing
            if (el._trackerBound) return;
            el._trackerBound = true;

            el.addEventListener('click', function () {
                send('download_click', { download_url: href || null });

                // Also fire download_complete after a short delay (best-effort)
                // Real completion tracking requires a backend or service worker
                if (href) {
                    const timer = setTimeout(function () {
                        send('download_complete', { download_url: href });
                    }, 4000);
                    // Cancel if user navigates away quickly (likely didn't complete)
                    window.addEventListener('beforeunload', function () {
                        clearTimeout(timer);
                    }, { once: true });
                }
            });
        });
    }

    // Run now and re-check after any DOM changes (SPAs / dynamically inserted links)
    trackDownloads();
    if (window.MutationObserver) {
        new MutationObserver(trackDownloads).observe(document.body, { childList: true, subtree: true });
    }
})();