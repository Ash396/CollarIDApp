/**
 * The Map tab's rules (src/utils/liveMap.ts): the script that signs the
 * collarid.org page in, where the WebView may go, which messages count.
 * The injected script is run for real in a sandbox with a fake window.
 */
import {
  IN_APP_CSS,
  LIVE_MAP_URL,
  buildSessionInjection,
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

describe('the site header inside the app', () => {
  it('adds the slim-header style once, before <head> exists', () => {
    const s = buildSessionInjection({ token: FAKE_TOKEN });
    const page = runInPage(s, 'https://collarid.org');
    expect(page.appended).toHaveLength(1);
    expect(page.appended[0].id).toBe('collarid-app-style');
    expect(page.appended[0].textContent).toBe(IN_APP_CSS);
    // A second run in the same document (never happens, but) adds nothing.
    vm.runInNewContext(s, {
      window: { location: { origin: 'https://collarid.org' }, localStorage: makeStorage(), sessionStorage: makeStorage() },
      document: page.document,
      JSON,
    });
    expect(page.appended).toHaveLength(1);
  });

  it('on every page load, not just the first sign-in', () => {
    const s = buildSessionInjection({ token: FAKE_TOKEN });
    const tab = makeStorage();
    runInPage(s, 'https://collarid.org', { sessionStorage: tab });
    const reloaded = runInPage(s, 'https://collarid.org', { sessionStorage: tab });
    expect(reloaded.localStorage.getItem('collarid_token')).toBeNull();
    expect(reloaded.appended).toHaveLength(1);
  });

  it('hides the nav links, keeps the live-status row', () => {
    expect(IN_APP_CSS).toContain('.nav-bar .nav-pill');
    expect(IN_APP_CSS).toContain('.nav-bar .nav-signout');
    expect(IN_APP_CSS).not.toMatch(/#ws-dot|#ws-label|#refresh-interval|\.nav-links\{display:none/);
  });

  it('never on another origin', () => {
    const s = buildSessionInjection({ token: FAKE_TOKEN });
    expect(runInPage(s, 'https://evil.example').appended).toHaveLength(0);
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
