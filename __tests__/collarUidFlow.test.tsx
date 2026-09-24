/**
 * Which collar "Load from CollarID server" asks about. The UID comes from
 * the connected collar's own status packet (header.system_uid), read by
 * HomeScreen on connect and on every live status update, and it must never
 * carry over from one collar to the next: collar A's LoRaWAN keys loaded
 * into collar B's form would, after SAVE + SEND, give B A's identity.
 * The UIDs here are made up.
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { ReactTestRenderer as Renderer } from 'react-test-renderer';
import { Buffer } from 'buffer';

import * as PB from '../src/proto/collar_pb.js';
import { DeviceProvider, useDevice } from '../src/context/DeviceContext';
import HomeScreen from '../src/screens/HomeScreen';
import CollarCard from '../src/components/CollarCard';

const UID_A = 0x0a0b0c0d;
const UID_B = 0x01020304;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));
jest.mock('../src/context/SchedulesContext', () => ({
  useSchedules: () => ({ clearSchedulesState: jest.fn() }),
}));
jest.mock('../src/context/RadioConfigContext', () => ({
  useRadioConfig: () => ({ clearRadioState: jest.fn() }),
}));

// Only the BLE manager is faked; everything HomeScreen does with the packets
// is the real code. Built inside the factory (jest.mock runs before this
// file's own top-level code) and fetched back below.
jest.mock('../src/ble/bleManager', () => {
  const fake: any = {
    scanCallback: null,
    state: jest.fn(async () => 'PoweredOn'),
    onStateChange: jest.fn((cb: (s: string) => void) => {
      cb('PoweredOn');
      return { remove: jest.fn() };
    }),
    startDeviceScan: jest.fn((_u: any, _o: any, cb: any) => {
      fake.scanCallback = cb;
    }),
    stopDeviceScan: jest.fn(),
    disconnectCallback: null,
    onDeviceDisconnected: jest.fn((_id: string, cb: any) => {
      fake.disconnectCallback = cb;
      return { remove: jest.fn() };
    }),
    connectToDevice: jest.fn(),
  };
  return {
    ...jest.requireActual('../src/ble/bleManager'),
    manager: fake,
    readCollarCaps: jest.fn(async () => 0),
  };
});
const mockManager: any = require('../src/ble/bleManager').manager;

/** A STATUS characteristic value as the collar sends it (base64 BlePacket). */
function statusValue(systemUid: number): string {
  const packet = PB.BlePacket.create({
    header: { systemUid },
    systemStatePacket: { firmwareVersion: 'b391 c78c766' },
  });
  return Buffer.from(PB.BlePacket.encode(packet).finish()).toString('base64');
}

/** A connected collar whose STATUS read returns `readUid`, with the live
 *  STATUS monitor callback captured so a test can push an update. */
function fakeCollar(id: string, readUid: number) {
  const collar: any = {
    id,
    discoverAllServicesAndCharacteristics: jest.fn(async () => collar),
    monitorCharacteristicForService: jest.fn((_s: string, _c: string, cb: any) => {
      collar.pushStatus = (uid: number) => cb(null, { value: statusValue(uid) });
      return { remove: jest.fn() };
    }),
    services: jest.fn(async () => []),
    characteristicsForService: jest.fn(async () => []),
    readCharacteristicForService: jest.fn(async () => ({ value: statusValue(readUid) })),
  };
  return collar;
}

let seen: ReturnType<typeof useDevice> | null = null;
function Probe() {
  seen = useDevice();
  return null;
}

async function renderHome(): Promise<Renderer> {
  let r!: Renderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <DeviceProvider>
        <HomeScreen />
        <Probe />
      </DeviceProvider>,
    );
  });
  return r;
}

async function advertiseAndConnect(r: Renderer, collar: any, name: string) {
  mockManager.connectToDevice.mockResolvedValueOnce(collar);
  await act(async () => {
    mockManager.scanCallback?.(null, { id: collar.id, name });
  });
  const card = r.root
    .findAllByType(CollarCard)
    .find(c => c.props.name === name);
  if (!card) throw new Error(`no card for ${name}`);
  await act(async () => {
    await card.props.onConnect();
  });
}

let renderers: Renderer[] = [];

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  (globalThis as any).fetch = jest.fn(async () => ({ ok: false, status: 401, json: async () => ({}) }));
  mockManager.scanCallback = null;
  seen = null;
});

afterEach(async () => {
  for (const r of renderers) {
    await act(async () => r.unmount());
  }
  renderers = [];
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('DeviceContext', () => {
  it('a new collar starts with no UID, and 0 means none', async () => {
    const r = await renderHome();
    renderers.push(r);
    await act(async () => seen!.setSystemUid(UID_A));
    expect(seen!.systemUid).toBe(UID_A);

    await act(async () => seen!.setDevice({ id: 'collar-b' } as any));
    expect(seen!.systemUid).toBeNull();

    await act(async () => seen!.setSystemUid(0));
    expect(seen!.systemUid).toBeNull();
  });
});

describe('HomeScreen reads the UID from the collar', () => {
  it('from the STATUS read on connect', async () => {
    const r = await renderHome();
    renderers.push(r);
    await advertiseAndConnect(r, fakeCollar('ble-a', UID_A), 'CollarID A');
    expect(seen!.systemUid).toBe(UID_A);
  });

  it('from a live STATUS update', async () => {
    const r = await renderHome();
    renderers.push(r);
    const collar = fakeCollar('ble-a', 0); // connect-time read has no UID
    await advertiseAndConnect(r, collar, 'CollarID A');
    expect(seen!.systemUid).toBeNull();

    await act(async () => collar.pushStatus(UID_A));
    expect(seen!.systemUid).toBe(UID_A);
  });

  it('never keeps collar A\'s UID after switching to collar B', async () => {
    const r = await renderHome();
    renderers.push(r);
    const a = fakeCollar('ble-a', UID_A);
    await advertiseAndConnect(r, a, 'CollarID A');
    expect(seen!.systemUid).toBe(UID_A);

    // Collar A drops off (HomeScreen's own disconnect handler runs), then
    // collar B connects, but its connect-time read carries no UID yet.
    await act(async () => mockManager.disconnectCallback(null, a));
    expect(seen!.systemUid).toBeNull();
    const b = fakeCollar('ble-b', 0);
    await advertiseAndConnect(r, b, 'CollarID B');
    expect(seen!.systemUid).toBeNull();

    await act(async () => b.pushStatus(UID_B));
    expect(seen!.systemUid).toBe(UID_B);
  });
});
