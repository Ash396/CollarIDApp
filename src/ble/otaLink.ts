// Main-processor firmware update: the link ota.ts runs on. The DFU relay
// writes raw frames to the update characteristic and reads the radio's
// special_mode answers back from it (or has them pushed, on a radio that
// can notify). ota.ts holds the protocol; this is the plain read / write /
// subscribe surface over react-native-ble-plx, plus the radio capability
// probe and a simulated radio for the mock collar.
import type { Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

import { CAPS_CHAR_UUID, COLLAR_SERVICE_UUID, UPDATE_CHAR_UUID, isMockDevice } from './bleManager';
import { DFU_ENTER, DFU_READY, MTU_PUBLISH_TAG, radioCapsFrom } from './ota';
import type { OtaLink, RadioCaps } from './ota';


/** The update characteristic's properties, from the GATT table. */
async function updateCharProps(
  device: Device,
): Promise<{ canNotify: boolean; canWriteNoResp: boolean }> {
  try {
    const chars = await device.characteristicsForService(COLLAR_SERVICE_UUID);
    const c = chars.find(x => x.uuid.toLowerCase() === UPDATE_CHAR_UUID);
    return {
      canNotify: !!c?.isNotifiable,
      canWriteNoResp: !!c?.isWritableWithoutResponse,
    };
  } catch (_) {
    return { canNotify: false, canWriteNoResp: false };
  }
}

/** The radio's raw caps bytes, or null when the characteristic is absent
 *  (the frozen first-generation radio). */
async function readCapsBytes(device: Device): Promise<Uint8Array | null> {
  try {
    const ch = await device.readCharacteristicForService(COLLAR_SERVICE_UUID, CAPS_CHAR_UUID);
    if (!ch?.value) return null;
    return new Uint8Array(Buffer.from(ch.value, 'base64'));
  } catch (_) {
    return null;
  }
}

/** Decide whether this radio may be given firmware, and which kind — run
 *  BEFORE any transfer (ota.ts updatePolicy reads the answer). */
export async function probeRadioCaps(device: Device): Promise<RadioCaps> {
  if (isMockDevice(device)) {
    return radioCapsFrom(new Uint8Array([0x43, 0x50, 2, 0x07]), { canNotify: true, canWriteNoResp: true });
  }
  const [caps, props] = await Promise.all([readCapsBytes(device), updateCharProps(device)]);
  return radioCapsFrom(caps, props);
}

/* How long to let a fresh notification subscription settle before the
   DFU_ENTER write: ble-plx returns the monitor before the native side has
   enabled it, and the radio publishes its MTU milliseconds after the enter. */
const OTA_SUBSCRIBE_SETTLE_MS = 300;

/** The transport for sendU5Image, over this device's update
 *  characteristic. */
export async function otaLinkForDevice(device: Device): Promise<OtaLink> {
  if (isMockDevice(device)) return mockOtaLink();
  const props = await updateCharProps(device);
  return {
    canNotify: props.canNotify,
    canWriteNoResp: props.canWriteNoResp,
    write: async (bytes, withResponse) => {
      const b64 = Buffer.from(bytes).toString('base64');
      if (withResponse) {
        await device.writeCharacteristicWithResponseForService(COLLAR_SERVICE_UUID, UPDATE_CHAR_UUID, b64);
      } else {
        await device.writeCharacteristicWithoutResponseForService(COLLAR_SERVICE_UUID, UPDATE_CHAR_UUID, b64);
      }
    },
    read: async () => {
      const ch = await device.readCharacteristicForService(COLLAR_SERVICE_UUID, UPDATE_CHAR_UUID);
      return ch?.value ? new Uint8Array(Buffer.from(ch.value, 'base64')) : new Uint8Array(0);
    },
    subscribe: async onValue => {
      const sub = device.monitorCharacteristicForService(
        COLLAR_SERVICE_UUID,
        UPDATE_CHAR_UUID,
        (error, characteristic) => {
          if (error || !characteristic?.value) return; // a dropped link ends the run elsewhere
          onValue(new Uint8Array(Buffer.from(characteristic.value, 'base64')));
        },
      );
      await new Promise<void>(r => setTimeout(r, OTA_SUBSCRIBE_SETTLE_MS));
      return async () => {
        sub.remove();
      };
    },
    isConnected: async () => {
      try {
        return await device.isConnected();
      } catch (_) {
        return false;
      }
    },
  };
}

/* A simulated MkII Mesh radio for the simulator: notifies its MTU on
   DFU_ENTER, acknowledges every tenth DATA frame and the END, then "reboots"
   (reports disconnected) a moment after the END ack. */
export function mockOtaLink(): OtaLink {
  let listener: ((b: Uint8Array) => void) | null = null;
  let dataCount = 0;
  let connected = true;
  const encode = (code: number) => {
    const varint: number[] = [];
    let x = code >>> 0;
    while (x >= 0x80) {
      varint.push((x & 0x7f) | 0x80);
      x >>>= 7;
    }
    varint.push(x);
    return new Uint8Array([0x12, varint.length + 1, 0x18, ...varint]);
  };
  const push = (code: number, delayMs: number) =>
    setTimeout(() => listener?.(encode(code)), delayMs);
  return {
    canNotify: true,
    canWriteNoResp: true,
    write: async bytes => {
      if (!connected) throw new Error('Device is not connected');
      if (bytes.length === 4 && bytes[0] === 0x12 && bytes[3] === DFU_ENTER) {
        dataCount = 0;
        push((MTU_PUBLISH_TAG << 16) | 185, 5);
        return;
      }
      if (bytes[0] === 0x11) {
        if (++dataCount % 10 === 0) push(DFU_READY, 8);
        return;
      }
      if (bytes.length === 1 && bytes[0] === 0x12) {
        push(DFU_READY, 20);
        setTimeout(() => {
          connected = false;
        }, 1500);
      }
    },
    read: async () => encode(0),
    subscribe: async onValue => {
      listener = onValue;
      return async () => {
        listener = null;
      };
    },
    isConnected: async () => connected,
  };
}
