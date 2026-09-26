/* Jest mocks for native-backed modules (no native runtime under Jest). */
/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-ble-plx', () => {
  const listeners = { remove: jest.fn() };
  class BleManager {
    state = jest.fn(async () => 'PoweredOn');
    onStateChange = jest.fn(() => listeners);
    startDeviceScan = jest.fn();
    stopDeviceScan = jest.fn();
    onDeviceDisconnected = jest.fn(() => listeners);
    connectToDevice = jest.fn();
    destroy = jest.fn();
  }
  return {
    BleManager,
    State: { PoweredOn: 'PoweredOn', PoweredOff: 'PoweredOff' },
  };
});

jest.mock('lottie-react-native', () => 'LottieView');

// async-storage v3 ships no jest mock file — in-memory stand-in.
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async k => (k in store ? store[k] : null)),
      setItem: jest.fn(async (k, v) => {
        store[k] = String(v);
      }),
      removeItem: jest.fn(async k => {
        delete store[k];
      }),
      clear: jest.fn(async () => {
        store = {};
      }),
      getAllKeys: jest.fn(async () => Object.keys(store)),
    },
  };
});

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// iOS Keychain stand-in: one generic-password item per service, in memory.
// __setFailure('set' | 'get' | 'reset', true) makes that call throw, to test
// the "Keychain unavailable" paths; __reset() empties it.
jest.mock('react-native-keychain', () => {
  let items = {};
  const failing = {};
  const svc = opts => (opts && opts.service) || 'default';
  return {
    __esModule: true,
    ACCESSIBLE: {
      WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
      AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
      WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
      AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY:
        'AccessibleAfterFirstUnlockThisDeviceOnly',
    },
    setGenericPassword: jest.fn(async (username, password, opts) => {
      if (failing.set) throw new Error('keychain set failed (test)');
      items[svc(opts)] = { username, password, options: opts };
      return { service: svc(opts), storage: 'keychain' };
    }),
    getGenericPassword: jest.fn(async opts => {
      if (failing.get) throw new Error('keychain get failed (test)');
      const it = items[svc(opts)];
      return it
        ? {
            service: svc(opts),
            username: it.username,
            password: it.password,
            storage: 'keychain',
          }
        : false;
    }),
    resetGenericPassword: jest.fn(async opts => {
      if (failing.reset) throw new Error('keychain reset failed (test)');
      delete items[svc(opts)];
      return true;
    }),
    hasGenericPassword: jest.fn(async opts => svc(opts) in items),
    __items: () => items,
    __setFailure: (op, on) => {
      failing[op] = on;
    },
    __reset: () => {
      items = {};
      Object.keys(failing).forEach(k => delete failing[k]);
    },
  };
});

// WebView stand-in: a host element carrying every prop, so tests can read
// the source, the injected script and the navigation/message handlers.
// __mounts() counts fresh WebViews (a remount = a new page load);
// __posted() lists every postMessage() the app made through a WebView ref,
// newest last (and __resetPosted() clears it).
jest.mock('react-native-webview', () => {
  const React = require('react');
  let mounts = 0;
  const posted = [];
  const WebView = React.forwardRef((props, ref) => {
    React.useEffect(() => {
      mounts++;
    }, []);
    React.useImperativeHandle(ref, () => ({
      postMessage: msg => {
        posted.push(msg);
      },
      injectJavaScript: () => {},
    }));
    return React.createElement('RNCWebView', props);
  });
  WebView.__mounts = () => mounts;
  WebView.__posted = () => posted.slice();
  WebView.__resetPosted = () => {
    posted.length = 0;
  };
  return { __esModule: true, default: WebView, WebView };
});
