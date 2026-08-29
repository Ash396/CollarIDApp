/* Jest mocks for native-backed modules (no native runtime under Jest). */
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
