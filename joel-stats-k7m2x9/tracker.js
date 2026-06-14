(function () {
    const SUPA = 'https://ztkzofjklpzrzskxacll.supabase.co/rest/v1/site_analytics';
    const KEY = 'sb_publishable_uunVH0MPwzPTKBek4kK5NQ_LULAfOyB';
    const HDRS = {
        'apikey': KEY,
        'Authorization': 'Bearer ' + KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
    };

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
        else if (/mac os x (\d+[_.]\d+)/i.test(u)) os = 'macOS ' + u.match(/mac os x (\d+[_.]\d+)/i)[1].replace('_', '.');
        else if (/linux/i.test(u)) os = 'Linux';

        // Device model (best effort)
        let device_model = null;
        const android = u.match(/android[\s\/][\d.]+;\s*([^;)]+)/i);
        if (/iphone/i.test(u)) device_model = 'iPhone';
        else if (/ipad/i.test(u)) device_model = 'iPad';
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
        const edgv = u.match(/edg\/([\d.]+)/i);
        const chromev = u.match(/chrome\/([\d.]+)/i);
        const ffv = u.match(/firefox\/([\d.]+)/i);
        const safv = u.match(/version\/([\d.]+)/i);
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

    // ── Send event to Supabase ───────────────────────────────────────────────────
    // `useBeacon` flag tells us to use fetch with keepalive (for unload events)
    function send(event_type, geo, extra, useBeacon) {
        var ua = parseUA();
        var screen = getScreen();
        var payload = {
            event_type: event_type,
            page: window.location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            language: navigator.language || null,
            // Geo fields (from ipapi.co)
            ip: (geo && geo.ip) || null,
            country: (geo && geo.country_name) || null,
            country_code: (geo && geo.country_code) || null,
            city: (geo && geo.city) || null,
            region: (geo && geo.region) || null,
            latitude: (geo && geo.latitude) || null,
            longitude: (geo && geo.longitude) || null,
            timezone: (geo && geo.timezone) || null,
        };
        // Merge UA, screen, and extra data
        var k;
        for (k in ua) { if (ua.hasOwnProperty(k)) payload[k] = ua[k]; }
        for (k in screen) { if (screen.hasOwnProperty(k)) payload[k] = screen[k]; }
        if (extra) { for (k in extra) { if (extra.hasOwnProperty(k)) payload[k] = extra[k]; } }

        try {
            if (useBeacon && navigator.sendBeacon) {
                // sendBeacon cannot send custom headers, so use the apikey query param
                // Supabase PostgREST accepts ?apikey= as authentication
                var url = SUPA + '?apikey=' + encodeURIComponent(KEY);
                var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
            } else {
                fetch(SUPA, {
                    method: 'POST',
                    headers: HDRS,
                    body: JSON.stringify(payload),
                    keepalive: !!useBeacon,
                });
            }
        } catch (_) {
            // Silent fail — never break the user experience
        }
    }

    // Expose send for other scripts on the same page
    window.__trackerSend = send;

    // ── Geo lookup, then fire page_view ─────────────────────────────────────────
    var geoCache = {};

    // Expose promise so other scripts on this page can piggyback the same request
    window.__trackerGeoPromise = window.__trackerGeoPromise ||
        fetch('https://ipapi.co/json/').then(function (r) { return r.json(); }).catch(function () { return {}; });

    window.__trackerGeoPromise.then(function (geo) {
        geoCache = geo || {};
        send('page_view', geoCache);
    });

    // Expose geoCache for other scripts
    window.__trackerGetGeo = function () { return geoCache; };

    // ── Download tracking ────────────────────────────────────────────────────────
    function trackDownloads() {
        document.querySelectorAll('a[href], button').forEach(function (el) {
            var href = el.getAttribute('href') || '';
            var isDownload =
                el.hasAttribute('download') ||
                /\.(apk|ipa|exe|zip|dmg|pkg|msi|deb|rpm)(\?|$)/i.test(href) ||
                el.dataset.track === 'download';

            if (!isDownload) return;
            if (el._trackerBound) return;
            el._trackerBound = true;

            el.addEventListener('click', function (e) {
                // Use sendBeacon for the click event to ensure it fires even if
                // the browser navigates away to start the download
                send('download_click', geoCache, { download_url: href || null }, true);

                // Fire download_complete after 4s delay as a best-effort signal
                // We use keepalive fetch so it survives page navigation
                if (href) {
                    setTimeout(function () {
                        send('download_complete', geoCache, { download_url: href }, true);
                    }, 4000);
                }
            });
        });
    }

    // Run now and re-check after any DOM mutations (SPAs / dynamically inserted links)
    trackDownloads();
    if (window.MutationObserver) {
        new MutationObserver(function () { trackDownloads(); })
            .observe(document.body, { childList: true, subtree: true });
    }
})();