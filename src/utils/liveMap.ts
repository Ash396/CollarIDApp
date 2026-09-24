// The Map tab: collarid.org's live map in a WebView, signed in with the
// app's session.
//
// The website keeps its session in localStorage (auth.js: TOKEN_KEY
// 'collarid_token', ROLE_KEY 'collarid_role'; requireAuth() skips the login
// box when a token is there). The app hands its token over by writing those
// two keys before the page's own scripts run — inside the page, and only
// after the page has checked that it really is https://collarid.org.
//
// Session expiry: auth.js drops the token on any 401 from the API and fires
// 'collarid:session-expired' on document; live-map then reloads into its own
// login box. The injected script forwards that event to the app, which checks
// the token itself (GET /auth/me) and, if the server really retired it, ends
// the app session too — the Map tab then asks for a sign-in on Home, and the
// next sign-in builds a fresh WebView with the fresh token.

export const COLLARID_ORIGIN = 'https://collarid.org';
// The site serves extensionless pages (live-map.html 308-redirects here).
export const LIVE_MAP_URL = `${COLLARID_ORIGIN}/live-map`;

// auth.js
export const WEB_TOKEN_KEY = 'collarid_token';
export const WEB_ROLE_KEY = 'collarid_role';

export const SESSION_EXPIRED_EVENT = 'collarid:session-expired';
// Inside the app the site's nav bar is redundant: the app has its own tabs
// and sign-out, and the site's other pages (Web Bluetooth ones included)
// don't belong in the Map tab. At phone width that nav wraps to three rows,
// so the app keeps only the live-status group (dot, "LIVE", refresh
// interval) on one slim row. Keyed on collarid.css's nav class names; if the
// site renames them, the full nav simply shows again.
const IN_APP_STYLE_ID = 'collarid-app-style';
export const IN_APP_CSS = [
  '.nav-bar{padding:6px 14px!important;gap:0!important;flex-wrap:nowrap!important}',
  '.nav-bar .nav-logo,.nav-bar .nav-pill,.nav-bar .nav-dropdown,' +
    '.nav-bar .nav-theme-btn,.nav-bar .nav-signout{display:none!important}',
  '.nav-bar .nav-links{width:auto!important;order:0!important;' +
    'overflow:visible!important;padding-bottom:0!important;flex-wrap:nowrap!important}',
].join('');

// sessionStorage flag: this WebView has had the app's session written once.
// A later reload (the page's own Sign out, or its 401 handler) must NOT
// quietly sign it back in with a token the page just threw away.
const INJECTED_FLAG = 'collarid_app_session_injected';

/** A JSON string literal that is also safe inside any JS source: no raw
 *  line/paragraph separators, and no "<", ">" or "&" (so it can never close
 *  a <script> or open a comment if the source ever ends up in HTML). */
export function jsStringLiteral(value: string): string {
  return JSON.stringify(String(value))
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * The script given to injectedJavaScriptBeforeContentLoaded (main frame
 * only). Signed out -> a script that does nothing at all.
 *
 * Inside the page it:
 *  - does nothing unless window.location.origin is exactly
 *    https://collarid.org (a redirect or a stray navigation elsewhere never
 *    receives the token);
 *  - trims the site's nav bar to its live-status row (IN_APP_CSS), on every
 *    page load;
 *  - writes the token and role into the website's own localStorage keys the
 *    first time only (see INJECTED_FLAG);
 *  - forwards the website's session-expired event to the app.
 */
export function buildSessionInjection(
  session: { token: string | null; role?: string | null } | null,
): string {
  if (!session || !session.token) return 'true;';
  return `(function () {
  try {
    if (window.location.origin !== ${jsStringLiteral(COLLARID_ORIGIN)}) return;
    try {
      if (!document.getElementById(${jsStringLiteral(IN_APP_STYLE_ID)})) {
        var style = document.createElement('style');
        style.id = ${jsStringLiteral(IN_APP_STYLE_ID)};
        style.textContent = ${jsStringLiteral(IN_APP_CSS)};
        (document.head || document.documentElement).appendChild(style);
      }
    } catch (e) {}
    var first = true;
    try { first = !window.sessionStorage.getItem(${jsStringLiteral(INJECTED_FLAG)}); } catch (e) {}
    if (first) {
      window.localStorage.setItem(${jsStringLiteral(WEB_TOKEN_KEY)}, ${jsStringLiteral(session.token)});
      window.localStorage.setItem(${jsStringLiteral(WEB_ROLE_KEY)}, ${jsStringLiteral(session.role || 'user')});
      try { window.sessionStorage.setItem(${jsStringLiteral(INJECTED_FLAG)}, '1'); } catch (e) {}
    }
    document.addEventListener(${jsStringLiteral(SESSION_EXPIRED_EVENT)}, function () {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: ${jsStringLiteral(SESSION_EXPIRED_EVENT)} }));
      }
    });
  } catch (e) {}
})();
true;`;
}

/** True only for https://collarid.org itself (any path). Not www., not http,
 *  not "collarid.org.example.com", not "collarid.org@example.com". Written
 *  without URL(): React Native's URL does not implement .origin/.host. */
export function isCollaridUrl(url: string | null | undefined): boolean {
  return /^https:\/\/collarid\.org(?::443)?(?:[/?#]|$)/i.test(url ?? '');
}

/** True when the URL's query carries an `api` parameter, decoded the way
 *  the site's auth.js reads it (URLSearchParams: "+" is a space, %-escapes
 *  decoded). auth.js takes ?api=<host> as the API base and remembers it, so
 *  every later request would carry the app's token to that host. A query
 *  that cannot be decoded counts as carrying one. */
export function hasApiOverride(url: string | null | undefined): boolean {
  const q = (url ?? '').split('#')[0];
  const at = q.indexOf('?');
  if (at < 0) return false;
  return q
    .slice(at + 1)
    .split('&')
    .some(pair => {
      const key = pair.split('=')[0].replace(/\+/g, ' ');
      try {
        return decodeURIComponent(key) === 'api';
      } catch (_) {
        return true;
      }
    });
}

/**
 * onShouldStartLoadWithRequest policy: stay on collarid.org. A top-level
 * link anywhere else opens in Safari; a sub-frame to another site is simply
 * not loaded (never pops Safari on its own). A collarid.org page asked to
 * switch API host (?api=) is not loaded at all, here or in Safari.
 */
export function decideNavigation(req: {
  url: string;
  isTopFrame?: boolean;
}): { allow: boolean; openExternally: boolean } {
  const url = req.url ?? '';
  if (isCollaridUrl(url)) {
    return hasApiOverride(url)
      ? { allow: false, openExternally: false }
      : { allow: true, openExternally: false };
  }
  if (/^about:(blank|srcdoc)$/i.test(url)) {
    return { allow: true, openExternally: false };
  }
  if (req.isTopFrame === false) return { allow: false, openExternally: false };
  // Only hand Safari/Mail/Phone links the OS knows what to do with.
  const external = /^(https?:|mailto:|tel:)/i.test(url);
  return { allow: false, openExternally: external };
}

/** A message from the page that the app acts on, or null. Only trusted when
 *  it came from a collarid.org page. */
export function parseMapMessage(
  data: string | null | undefined,
  pageUrl: string | null | undefined,
): 'session-expired' | null {
  if (!isCollaridUrl(pageUrl)) return null;
  try {
    const msg = JSON.parse(data ?? '');
    return msg && msg.type === SESSION_EXPIRED_EVENT ? 'session-expired' : null;
  } catch (_) {
    return null;
  }
}
