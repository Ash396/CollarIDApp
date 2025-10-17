import { BleManager, Device, State } from "react-native-ble-plx";
import { Buffer } from "buffer";
import * as PB from "../proto/message_pb.js";

export const manager = new BleManager();

export const COLLAR_SERVICE_UUID = "1a17b2cd-7314-493d-a4b5-32a2d53e6fd7";
export const UPDATE_CHAR_UUID = "c4dd1054-f3f3-456b-8ad5-44aaa7ba4fd2"; // read/write
export const STATUS_CHAR_UUID = "9eaf9ebe-c3e9-4bd6-956e-5ca63d222fbb";  // read/notify

// What decode() may return
export type DecodedPacket =
  | { system_state_packet: any }
  | { schedule_config_packet: any }
  | null;

/* ---------------------------------- Utils ---------------------------------- */

function safeDecode(bytes: Uint8Array): DecodedPacket {
  try {
    const pkt = PB.decodePacket(bytes);
    if (pkt?.system_state_packet || pkt?.schedule_config_packet) return pkt;
  } catch (_) {}
  try {
    const sys = PB.decodeSystemStatePacket(bytes);
    return { system_state_packet: sys };
  } catch (err) {
    console.warn("safeDecode fallback failed:", err);
  }
  return null;
}

export async function ensureBluetoothOn(): Promise<void> {
  const state = await manager.state();
  if (state === State.PoweredOn) return;

  console.log(`Bluetooth state = ${state}. Waiting to power on...`);
  await new Promise<void>((resolve) => {
    const sub = manager.onStateChange((newState) => {
      if (newState === State.PoweredOn) {
        sub.remove();
        resolve();
      }
    }, true);
  });
}

/* ------------------------------ Connect / Read ----------------------------- */

// Connect to a specific device (you pass the discovered `Device`)
export async function connectToCollar(device: Device): Promise<Device | null> {
  if (!device) {
    console.warn("connectToCollar: no device provided");
    return null;
  }
  await ensureBluetoothOn();

  try {
    console.log(`Connecting to ${device.name ?? device.id}...`);
    const connected = await device.connect();
    await connected.discoverAllServicesAndCharacteristics();
    console.log(`Connected to ${connected.name ?? connected.id}`);
    return connected;
  } catch (err) {
    console.error("connectToCollar failed:", err);
    return null;
  }
}

// Read once from UPDATE characteristic (after connected)
export async function readInitialState(device: Device): Promise<DecodedPacket> {
  try {
    const ch = await device.readCharacteristicForService(
      COLLAR_SERVICE_UUID,
      UPDATE_CHAR_UUID
    );
    if (!ch?.value) return null;
    const bytes = Buffer.from(ch.value, "base64");
    return safeDecode(bytes);
  } catch (err) {
    console.warn("readInitialState failed:", err);
    return null;
  }
}

// Subscribe to STATUS notifications
export function subscribeToStatus(
  device: Device,
  callback: (data: DecodedPacket) => void
) {
  return device.monitorCharacteristicForService(
    COLLAR_SERVICE_UUID,
    STATUS_CHAR_UUID,
    (error, characteristic) => {
      if (error) {
        console.error("STATUS notify error:", error);
        return;
      }
      if (!characteristic?.value) return;
      const bytes = Buffer.from(characteristic.value, "base64");
      const decoded = safeDecode(bytes);
      if (decoded) callback(decoded);
    }
  );
}

/* ----------------------------- Build & Send Config ----------------------------- */

// Build a full, proto-valid Packet from your app schedules (name + time window injected)
export function buildSchedulePacketFromAppState(
  appSchedules: Array<{
    window?: { start_hour?: number; end_hour?: number };
    light?: { enabled?: boolean; sample_interval_min?: number };
    environmental?: { enabled?: boolean; sample_interval_min?: number };
    particulate?: { enabled?: boolean; sample_interval_min?: number };
    gps?: { enabled?: boolean; sample_interval_min?: number; accuracy?: number };
    radio?: { enabled?: boolean; transmit_interval_min?: number; tx_power_dbm?: number };
    microphone?: { enabled?: boolean; continuous_mode?: boolean; sample_length_min?: number; sample_window_min?: number };
    accelerometer?: { enabled?: boolean; sample_rate?: number; sensitivity?: number };
  }>
): any {
  return {
    header: {
      system_uid: 1,
      ms_from_start: 0,
      epoch: Math.floor(Date.now() / 1000),
      packet_index: 0,
    },
    schedule_config_packet: {
      schedules: appSchedules.map((s) => ({
        window: {
          start_hour: Math.max(0, Math.min(23, Number(s.window?.start_hour ?? 0))),
          end_hour: Math.max(0, Math.min(23, Number(s.window?.end_hour ?? 0))),
        },
        light: {
          enabled: Boolean(s.light?.enabled ?? true),
          sample_interval_min: Number(s.light?.sample_interval_min ?? 10),
        },
        environmental: {
          enabled: Boolean(s.environmental?.enabled ?? true),
          sample_interval_min: Number(s.environmental?.sample_interval_min ?? 5),
        },
        particulate: {
          enabled: Boolean(s.particulate?.enabled ?? true),
          sample_interval_min: Number(s.particulate?.sample_interval_min ?? 15),
        },
        gps: {
          enabled: Boolean(s.gps?.enabled ?? true),
          sample_interval_min: Number(s.gps?.sample_interval_min ?? 20),
          accuracy: Math.min(Math.max(1, Number(s.gps?.accuracy ?? 5)), 10),
        },
        radio: {
          enabled: Boolean(s.radio?.enabled ?? false),
          region: 0, // REGION_US915
          auth: 0,   // AUTH_OTAA
          transmit_interval_min: Number(s.radio?.transmit_interval_min ?? 60),
          tx_only_on_new_gps_fix: false,
          tx_power_dbm: Number(s.radio?.tx_power_dbm ?? 0),
        },
        microphone: {
          enabled: Boolean(s.microphone?.enabled ?? false),
          continuous_mode: Boolean(s.microphone?.continuous_mode ?? false),
          sample_length_min: Number(s.microphone?.sample_length_min ?? 1),
          sample_window_min: Number(s.microphone?.sample_window_min ?? 1),
        },
        accelerometer: {
          enabled: Boolean(s.accelerometer?.enabled ?? false),
          sample_rate: Number(s.accelerometer?.sample_rate ?? 0), // ACCEL_25HZ
          sensitivity: Number(s.accelerometer?.sensitivity ?? 0), // ACCEL_2G
        },
        firmware: { version: "1.0.0" },
      })),
    },
  };
}






// Encode + write the packet to UPDATE characteristic
export async function sendConfig(device: Device, pbPacket: any) {
  try {
    console.log("📦 [sendConfig] Preparing to send packet...");

    const isConnected = await device.isConnected();
    if (!isConnected) {
      console.log("🟡 Device not connected, reconnecting...");
      await device.connect();
    }

    await device.discoverAllServicesAndCharacteristics();

    // 🔍 1️⃣ Encode using protobuf
    console.log("🔧 Encoding packet...");
    const encoded: Uint8Array = PB.encodePacket(pbPacket);

    // 🔍 2️⃣ Validate (decode round-trip)
    try {
      const roundTrip = PB.decodePacket(encoded);
      console.log("✅ [Validation] Roundtrip decode successful:");
      console.log(JSON.stringify(roundTrip, null, 2));
    } catch (decodeErr) {
      console.error("❌ [Validation] Failed to decode encoded bytes:", decodeErr);
      throw new Error("Packet encoding validation failed!");
    }

    // 🔍 3️⃣ Convert to base64 for BLE
    const base64data = Buffer.from(encoded).toString("base64");
    console.log("📤 [sendConfig] Base64 length:", base64data.length);

    // 📝 4️⃣ Write with response (for confirmation)
    console.log("📡 [BLE] Writing with response...");
    const written = await device.writeCharacteristicWithResponseForService(
      COLLAR_SERVICE_UUID,
      UPDATE_CHAR_UUID,
      base64data
    );

    console.log("✅ [BLE] Write complete. Characteristic response:");
    console.log(JSON.stringify(written, null, 2));

    // 🔔 5️⃣ Wait for ACK on STATUS characteristic
    console.log("⏳ Waiting for ACK from device (via STATUS_CHAR_UUID)...");

    const ackPromise = new Promise<boolean>((resolve) => {
      let ackReceived = false;

      const subscription = subscribeToStatus(device, (pkt) => {
        if (pkt && "system_state_packet" in pkt) {
            ackReceived = true;
            console.log("📩 [ACK] System state received (ACK confirmed):", pkt);
            subscription.remove();
            resolve(true);
        }

      });

      // Timeout safety (6 seconds)
      setTimeout(() => {
        if (!ackReceived) {
          console.warn("⚠️ [ACK Timeout] No ACK within 6s");
          subscription.remove();
          resolve(false);
        }
      }, 6000);
    });

    const ack = await ackPromise;
    if (ack) console.log("✅ [sendConfig] ACK received successfully!");
    else console.warn("⚠️ [sendConfig] No ACK received (may still have worked).");

    return ack;
  } catch (err) {
    console.error("❌ [sendConfig] BLE write failed:", err);
    throw err;
  }
}

/* -------------------------------- Disconnect -------------------------------- */

export async function disconnectFromCollar(device: Device) {
  try {
    await device.cancelConnection();
    console.log("Disconnected");
  } catch (error) {
    console.error("Failed to disconnect:", error);
  }
}
