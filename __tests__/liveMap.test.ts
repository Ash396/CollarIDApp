/**
 * The Map tab's rules (src/utils/liveMap.ts): the session message the app
 * posts to the collarid.org page (auth.js?v=3), the fallback script that
 * signs older site versions in, where the WebView may go, which messages
 * count. The injected script is run for real in a sandbox with a fake
 * window.
 */
import {
  LIVE_MAP_URL,
  SESSION_ADOPTED_EVENT,
  SESSION_EXPIRED_EVENT,
  SESSION_MESSAGE_TYPE,
  buildSessionInjection,
  buildSessionMessage,
  decideNavigation,
  hasApiOverride,
  isCollaridUrl,
  jsStringLiteral,
  parseMapMessage,
} from '../src/utils/liveMap';

// Node's vm (no @types/node in this project, hence the local type).
const vm: { runInNewContext(code: string, context?: object): any } =
  require('vm');

const FAKE_TOKEN = 'fake-token-for-tests';

function makeStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => {
      m.set(k, String(v));
    },
    removeItem: (k: string) => {
      m.delete(k);
    },
    map: m,
  };
}

/** Run the injected script in a page at `origin`. */
function runInPage(
  script: string,
  origin: string,
  page?: {
    sessionStorage?: ReturnType<typeof makeStorage>;
    bareDocument?: boolean;
  },
) {
  const localStorage = makeStorage();
  const sessionStorage = page?.sessionStorage ?? makeStorage();
  const listeners: Record<string, (() => void)[]> = {};
  const posted: string[] = [];
  const window: any = {
    location: { origin },
    localStorage,
    sessionStorage,
    ReactNativeWebView: { postMessage: (m: string) => posted.push(m) },
  };
  const appended: { id: string; textContent: string }[] = [];
  const document: any = page?.bareDocument
    ? {
        addEventListener: (type: string, fn: () => void) => {
          (listeners[type] ??= []).push(fn);
        },
      }
    : {
        addEventListener: (type: string, fn: () => void) => {
          (listeners[type] ??= []).push(fn);
        },
        getElementById: (id: string) => appended.find(e => e.id === id) ?? null,
        createElement: () => ({ id: '', textContent: '' }),
        head: null, // document-start: <head> not parsed yet
        documentElement: { appendChild: (e: any) => appended.push(e) },
      };
  const result = vm.runInNewContext(script, { window, document, JSON });
  return {
    result,
    localStorage,
    sessionStorage,
    fire: (type: string) => (listeners[type] ?? []).forEach(fn => fn()),
    posted,
    appended,
    document,
  };
}

describe('buildSessionInjection', () => {
  it('signs the collarid.org page in with the website’s own keys', () => {
    const s = buildSessionInjection({ token: FAKE_TOKEN, role: 'admin' });
    const page = runInPage(s, 'https://collarid.org');
    expect(page.localStorage.getItem('collarid_token')).toBe(FAKE_TOKEN);
    expect(page.localStorage.getItem('collarid_role')).toBe('admin');
    expect(page.result).toBe(true); // WKWebView wants a serialisable result
  });

  it('defaults the role to "user"', () => {
    const s = buildSessionInjection({ token: FAKE_TOKEN, role: null });
    expect(runInPage(s, 'https://collarid.org').localStorage.getItem('collarid_role')).toBe('user');
  });

  it.each([
    'https://www.collarid.org',
    'http://collarid.org',
    'https://collarid.org.evil.example',
    'https://evil.example',
    'null',
    'https://api.collarid.org',
  ])('writes nothing on any other origin: %s', origin => {
    const s = buildSessionInjection({ token: FAKE_TOKEN, role: 'admin' });
    const page = runInPage(s, origin);
    expect(page.localStorage.map.size).toBe(0);
    expect(page.sessionStorage.map.size).toBe(0);
  });

  it('checks the origin inside the script itself', () => {
    const s = buildSessionInjection({ token: FAKE_TOKEN });
    expect(s).toContain('window.location.origin !== "https://collarid.org"');
  });

  it('signed out: a script that does nothing at all', () => {
    for (const session of [null, { token: null }, { token: '' }]) {
      const s = buildSessionInjection(session as any);
      expect(s).not.toContain('localStorage');
      const page = runInPage(s, 'https://collarid.org');
      expect(page.localStorage.map.size).toBe(0);
    }
  });

  it('escapes the token: quotes, backslashes, </script>, separators all round-trip', () => {
    const nasty =
      'a"b\'c\\d</script><script>alert(1)</script>\u2028\u2029&x${y}`z\n';
    const s = buildSessionInjection({ token: nasty, role: '"admin"' });
    expect(s).not.toContain('</script>');
    expect(s).not.toMatch(/[\u2028\u2029]/);
    const page = runInPage(s, 'https://collarid.org');
    expect(page.localStorage.getItem('collarid_token')).toBe(nasty);
    expect(page.localStorage.getItem('collarid_role')).toBe('"admin"');
  });

  it('only once per WebView: a reload after the page signs out stays signed out', () => {
    const s = buildSessionInjection({ token: FAKE_TOKEN });
    const tab = makeStorage(); // sessionStorage survives reloads of one tab
    runInPage(s, 'https://collarid.org', { sessionStorage: tab });
    const reloaded = runInPage(s, 'https://collarid.org', { sessionStorage: tab });
    expect(reloaded.localStorage.getItem('collarid_token')).toBeNull();
  });

  it("forwards the website's session-expired event to the app", () => {
    const s = buildSessionInjection({ token: FAKE_TOKEN });
    const page = runInPage(s, 'https://collarid.org');
    expect(page.posted).toEqual([]);
    page.fire('collarid:session-expired');
    expect(page.posted).toEqual([
      JSON.stringify({ type: 'collarid:session-expired' }),
    ]);
    expect(page.posted[0]).not.toContain(FAKE_TOKEN);
  });
});

describe('the session message (auth.js?v=3 hand-off)', () => {
  it('the type strings are the site’s', () => {
    expect(SESSION_MESSAGE_TYPE).toBe('collarid:session');
    expect(SESSION_ADOPTED_EVENT).toBe('collarid:session-adopted');
    expect(SESSION_EXPIRED_EVENT).toBe('collarid:session-expired');
  });

  it('carries the token and the role, as JSON the page parses', () => {
    const m = buildSessionMessage({ token: FAKE_TOKEN, role: 'admin' });
    expect(JSON.parse(m!)).toEqual({ type: 'collarid:session', token: FAKE_TOKEN, role: 'admin' });
  });

  it('defaults the role to "user"; signed out is nothing to post', () => {
    expect(JSON.parse(buildSessionMessage({ token: FAKE_TOKEN, role: null })!).role).toBe('user');
    expect(JSON.parse(buildSessionMessage({ token: FAKE_TOKEN })!).role).toBe('user');
    for (const session of [null, { token: null }, { token: '' }]) {
      expect(buildSessionMessage(session as any)).toBeNull();
    }
  });

  it('a nasty token survives the JSON round trip untouched', () => {
    const nasty = 'a"b\'c\\d</script>\u2028\u2029&x${y}`z\n';
    expect(JSON.parse(buildSessionMessage({ token: nasty })!).token).toBe(nasty);
  });

  it('parseMapMessage takes the adopted reply and the expiry, from collarid.org only', () => {
    const url = 'https://collarid.org/live-map';
    expect(parseMapMessage(JSON.stringify({ type: 'collarid:session-adopted' }), url)).toBe('session-adopted');
    expect(parseMapMessage(JSON.stringify({ type: 'collarid:session-expired' }), url)).toBe('session-expired');
    expect(parseMapMessage(JSON.stringify({ type: 'collarid:session-adopted' }), 'https://evil.example/')).toBeNull();
    expect(parseMapMessage(JSON.stringify({ type: 'collarid:session', token: 'x' }), url)).toBeNull();
    expect(parseMapMessage('"collarid:session-adopted"', url)).toBeNull();
    expect(parseMapMessage('not json', url)).toBeNull();
    expect(parseMapMessage(null, url)).toBeNull();
  });
});

describe('the fallback script no longer styles the page', () => {
  // The site styles html.in-app on its own now (auth.js?v=3); the app used
  // to inject a <style> trimming the nav bar.
  it('appends nothing to the document', () => {
    const s = buildSessionInjection({ token: FAKE_TOKEN });
    const page = runInPage(s, 'https://collarid.org');
    expect(page.appended).toHaveLength(0);
    expect(s).not.toMatch(/createElement\('style'\)|nav-bar/);
  });

  it('a page without createElement still gets signed in', () => {
    const s = buildSessionInjection({ token: FAKE_TOKEN });
    const page = runInPage(s, 'https://collarid.org', { bareDocument: true });
    expect(page.localStorage.getItem('collarid_token')).toBe(FAKE_TOKEN);
  });
});

describe('jsStringLiteral', () => {
  it('is valid JS that evaluates back to the input', () => {
    for (const v of ['', 'plain', '"quoted"', 'back\\slash', '<>&', '\u2028']) {
      expect(vm.runInNewContext(jsStringLiteral(v))).toBe(v);
    }
  });
});

describe('isCollaridUrl / decideNavigation', () => {
  it('the live map is on the public site, extensionless', () => {
    expect(LIVE_MAP_URL).toBe('https://collarid.org/live-map');
  });

  it.each([
    'https://collarid.org',
    'https://collarid.org/',
    'https://collarid.org/live-map',
    'https://collarid.org/live-map.html?x=1#y',
    'https://collarid.org:443/export',
    'HTTPS://COLLARID.ORG/configure',
  ])('stays inside the site: %s', url => {
    expect(isCollaridUrl(url)).toBe(true);
    expect(decideNavigation({ url, isTopFrame: true })).toEqual({
      allow: true,
      openExternally: false,
    });
  });

  it.each([
    'https://www.collarid.org/live-map',
    'http://collarid.org/live-map',
    'https://collarid.org.evil.example/',
    'https://collarid.org@evil.example/',
    'https://evil.example/?https://collarid.org',
    'https://api.collarid.org/devices',
  ])('opens anything else in Safari: %s', url => {
    expect(isCollaridUrl(url)).toBe(false);
    expect(decideNavigation({ url, isTopFrame: true })).toEqual({
      allow: false,
      openExternally: true,
    });
  });

  it('never pops Safari for a sub-frame', () => {
    expect(
      decideNavigation({ url: 'https://ads.example/frame', isTopFrame: false }),
    ).toEqual({ allow: false, openExternally: false });
  });

  it('about:blank is fine; javascript:/data:/file: go nowhere', () => {
    expect(decideNavigation({ url: 'about:blank', isTopFrame: true }).allow).toBe(true);
    // eslint-disable-next-line no-script-url
    for (const url of ['javascript:alert(1)', 'data:text/html,hi', 'file:///etc/hosts']) {
      expect(decideNavigation({ url, isTopFrame: true })).toEqual({
        allow: false,
        openExternally: false,
      });
    }
  });

  it.each([
    'https://collarid.org/live-map?api=https://evil.example',
    'https://collarid.org/live-map?x=1&api=https://evil.example#y',
    'https://collarid.org/live-map?%61pi=https://evil.example',
    'https://collarid.org/?api',
    'https://collarid.org/live-map?%E0%A4%A=1',
  ])('never loads a collarid.org page that switches the API host: %s', url => {
    expect(hasApiOverride(url)).toBe(true);
    expect(decideNavigation({ url, isTopFrame: true })).toEqual({
      allow: false,
      openExternally: false,
    });
  });

  it.each([
    'https://collarid.org/live-map?apikey=1',
    'https://collarid.org/live-map?x=api',
    'https://collarid.org/live-map#?api=https://evil.example',
    'https://collarid.org/live-map?rapi=1',
  ])('other parameters are fine: %s', url => {
    expect(hasApiOverride(url)).toBe(false);
    expect(decideNavigation({ url, isTopFrame: true }).allow).toBe(true);
  });

  it('mailto:/tel: go to the OS', () => {
    expect(decideNavigation({ url: 'mailto:support@example.org', isTopFrame: true }).openExternally).toBe(true);
  });
});

describe('parseMapMessage', () => {
  const expired = JSON.stringify({ type: 'collarid:session-expired' });
  it('recognises the expiry message from a collarid.org page', () => {
    expect(parseMapMessage(expired, 'https://collarid.org/live-map')).toBe(
      'session-expired',
    );
  });
  it('ignores it from anywhere else, and ignores junk', () => {
    expect(parseMapMessage(expired, 'https://evil.example/')).toBeNull();
    expect(parseMapMessage('not json', 'https://collarid.org/live-map')).toBeNull();
    expect(parseMapMessage('{"type":"other"}', 'https://collarid.org/')).toBeNull();
    expect(parseMapMessage(undefined, undefined)).toBeNull();
  });
});
