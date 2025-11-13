import { BleManager, Device, State } from "react-native-ble-plx";
import { Buffer } from "buffer";
import * as PB from "../proto/message_pb.js";

export const manager = new BleManager();

export const COLLAR_SERVICE_UUID = "1a17b2cd-7314-493d-a4b5-32a2d53e6fd7";
export const UPDATE_CHAR_UUID = "c4dd1054-f3f3-456b-8ad5-44aaa7ba4fd2"; // read/write
export const STATUS_CHAR_UUID = "9eaf9ebe-c3e9-4bd6-956e-5ca63d222fbb"; // read/notify

/* -------------------------------------------------------------------------- */
/*                               Type Definitions                             */
/* -------------------------------------------------------------------------- */

export type DecodedPacket = Partial<{
  systemStatePacket: PB.SystemStatePacket;
  scheduleConfigPacket: PB.ScheduleConfigPacket;
  radioConfigPacket: PB.RadioConfigPacket;
}> | null;

/* -------------------------------------------------------------------------- */
/*                              Decode Utilities                              */
/* -------------------------------------------------------------------------- */

function safeDecode(bytes: Uint8Array): DecodedPacket {
  try {
    const pkt = PB.Packet.decode(bytes);

    if (
      pkt.systemStatePacket ||
      pkt.scheduleConfigPacket ||
      pkt.radioConfigPacket
    ) {
      return {
        systemStatePacket: pkt.systemStatePacket ?? undefined,
        scheduleConfigPacket: pkt.scheduleConfigPacket ?? undefined,
        radioConfigPacket: pkt.radioConfigPacket ?? undefined,
      };
    }
  } catch (_) {}

  // Fallback: device ACK (SystemStatePacket-only)
  try {
    const sys = PB.SystemStatePacket.decode(bytes);
    return { systemStatePacket: sys };
  } catch (err) {
    console.warn("⚠️ [safeDecode] Fallback decode failed:", err);
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                            Bluetooth State Helpers                         */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                            Connect / Read / Notify                         */
/* -------------------------------------------------------------------------- */

export async function connectToCollar(device: Device): Promise<Device | null> {
  if (!device) {
    console.warn("connectToCollar: no device provided");
    return null;
  }

  await ensureBluetoothOn();

  try {
    console.log(`🔗 Connecting to ${device.name ?? device.id}...`);
    const connected = await device.connect();
    await connected.discoverAllServicesAndCharacteristics();
    console.log(`✅ Connected to ${connected.name ?? connected.id}`);
    return connected;
  } catch (err) {
    console.error("❌ connectToCollar failed:", err);
    return null;
  }
}

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
    console.warn("⚠️ readInitialState failed:", err);
    return null;
  }
}

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

/* -------------------------------------------------------------------------- */
/*                         Build Schedule Configuration                       */
/* -------------------------------------------------------------------------- */

export function buildSchedulePacketFromAppState(
  appSchedules: Array<{
    window?: { startHour?: number; endHour?: number };
    light?: { enabled?: boolean; sampleIntervalMin?: number };
    environmental?: { enabled?: boolean; sampleIntervalMin?: number };
    particulate?: { enabled?: boolean; sampleIntervalMin?: number };
    gps?: { enabled?: boolean; sampleIntervalMin?: number; accuracy?: number };
    radio?: { enabled?: boolean; transmitIntervalMin?: number; txPowerDbm?: number };
    microphone?: {
      enabled?: boolean;
      continuousMode?: boolean;
      sampleLengthMin?: number;
      sampleWindowMin?: number;
    };
    accelerometer?: {
      enabled?: boolean;
      sampleRate?: number;
      sensitivity?: number;
    };
  }>
): PB.Packet {
  const schedules = appSchedules.map((s) =>
    PB.ScheduledConfig.create({
      window: PB.TimeWindow.create({
        startHour: Math.max(0, Math.min(23, Number(s.window?.startHour ?? 0))),
        endHour: Math.max(0, Math.min(23, Number(s.window?.endHour ?? 0))),
      }),
      light: PB.SamplingConfig.create({
        enabled: Boolean(s.light?.enabled ?? true),
        sampleIntervalMin: Number(s.light?.sampleIntervalMin ?? 10),
      }),
      environmental: PB.SamplingConfig.create({
        enabled: Boolean(s.environmental?.enabled ?? true),
        sampleIntervalMin: Number(s.environmental?.sampleIntervalMin ?? 5),
      }),
      particulate: PB.SamplingConfig.create({
        enabled: Boolean(s.particulate?.enabled ?? true),
        sampleIntervalMin: Number(s.particulate?.sampleIntervalMin ?? 15),
      }),
      gps: PB.GPSConfig.create({
        enabled: Boolean(s.gps?.enabled ?? true),
        sampleIntervalMin: Number(s.gps?.sampleIntervalMin ?? 20),
        accuracy: Math.min(Math.max(1, Number(s.gps?.accuracy ?? 5)), 10),
      }),
      radio: PB.RadioConfigPacket.create({
        enabled: Boolean(s.radio?.enabled ?? false),
        region: 0, // REGION_US915
        auth: 0, // AUTH_OTAA
        transmitIntervalMin: Number(s.radio?.transmitIntervalMin ?? 60),
        txOnlyOnNewGpsFix: false,
        txPowerDbm: Number(s.radio?.txPowerDbm ?? 0),
      }),
      microphone: PB.MicrophoneConfig.create({
        enabled: Boolean(s.microphone?.enabled ?? false),
        continuousMode: Boolean(s.microphone?.continuousMode ?? false),
        sampleLengthMin: Number(s.microphone?.sampleLengthMin ?? 1),
        sampleWindowMin: Number(s.microphone?.sampleWindowMin ?? 1),
      }),
      accelerometer: PB.AccelerometerConfig.create({
        enabled: Boolean(s.accelerometer?.enabled ?? false),
        sampleRate: Number(s.accelerometer?.sampleRate ?? 0),
        sensitivity: Number(s.accelerometer?.sensitivity ?? 0),
      }),
    })
  );

  const packet = PB.Packet.create({
    header: PB.PacketHeader.create({
      systemUid: 1,
      msFromStart: 0,
      epoch: Math.floor(Date.now() / 1000),
      packetIndex: 0,
    }),
    scheduleConfigPacket: PB.ScheduleConfigPacket.create({ schedules }),
  });

  return packet;
}

/* -------------------------------------------------------------------------- */
/*                            Send Configuration Packet                       */
/* -------------------------------------------------------------------------- */

export async function sendConfig(device: Device, packet: PB.Packet) {
  try {
    console.log("📦 [sendConfig] Preparing to send packet...");

    const isConnected = await device.isConnected();
    if (!isConnected) {
      console.log("🟡 Device not connected, reconnecting...");
      await device.connect();
    }

    await device.discoverAllServicesAndCharacteristics();

    // Encode
    const encoded = PB.Packet.encode(packet).finish();

    // Validate roundtrip decode
    try {
      const roundTrip = PB.Packet.decode(encoded);
      console.log("✅ [Validation] Roundtrip decode OK:", roundTrip);
    } catch (decodeErr) {
      console.error("❌ [Validation] Decode failed:", decodeErr);
      throw new Error("Packet encoding validation failed!");
    }

    // Convert to Base64 for BLE write
    const base64data = Buffer.from(encoded).toString("base64");
    console.log("📤 Sending Base64 (length):", base64data.length);

    // Write
    const written = await device.writeCharacteristicWithResponseForService(
      COLLAR_SERVICE_UUID,
      UPDATE_CHAR_UUID,
      base64data
    );
    console.log("✅ [BLE] Write complete:", written);

    // Wait for ACK
    console.log("⏳ Waiting for ACK...");
    const ackPromise = new Promise<boolean>((resolve) => {
      let ackReceived = false;

      const subscription = subscribeToStatus(device, (pkt) => {
        if (pkt && pkt.systemStatePacket) {
          ackReceived = true;
          console.log("📩 [ACK] System state received:", pkt.systemStatePacket);
          subscription.remove();
          resolve(true);
        }
      });

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
    else console.warn("⚠️ [sendConfig] No ACK (might still have applied).");

    return ack;
  } catch (err) {
    console.error("❌ [sendConfig] BLE write failed:", err);
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Disconnect                                 */
/* -------------------------------------------------------------------------- */

export async function disconnectFromCollar(device: Device) {
  try {
    await device.cancelConnection();
    console.log("🔌 Disconnected");
  } catch (error) {
    console.error("❌ Failed to disconnect:", error);
  }
}
