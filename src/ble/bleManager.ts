import { BleManager, Device, State } from "react-native-ble-plx";
import { Buffer } from "buffer";
import * as PB from "../proto/message_pb.js";

export const manager = new BleManager();

// BLE UUIDs for CollarID service + characteristics
export const COLLAR_SERVICE_UUID = "1a17b2cd-7314-493d-a4b5-32a2d53e6fd7";
export const UPDATE_CHAR_UUID = "c4dd1054-f3f3-456b-8ad5-44aaa7ba4fd2";
export const STATUS_CHAR_UUID = "9eaf9ebe-c3e9-4bd6-956e-5ca63d222fbb";

/**
 * Connects to a CollarID BLE device.
 * Scans for nearby devices with names like "CollarID_xxxxxx".
 */
export async function connectToCollar(): Promise<Device | null> {
  console.log("🔄 Initializing BLE manager...");

  // --- 1️⃣ Ensure Bluetooth is ON ---
  let state = await manager.state();
  if (state !== State.PoweredOn) {
    console.log(`⚙️ Bluetooth state = ${state}. Waiting to power on...`);
    await new Promise<void>((resolve) => {
      const sub = manager.onStateChange((newState) => {
        if (newState === State.PoweredOn) {
          console.log("✅ Bluetooth powered on.");
          sub.remove();
          resolve();
        }
      }, true);
    });
  } else {
    console.log("✅ Bluetooth already ON");
  }

  // --- 2️⃣ Start scanning for devices ---
  return new Promise((resolve, reject) => {
    console.log("📡 Scanning for CollarID_xxxxxx devices...");

    let found = false;

    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        console.error("❌ BLE scan error:", error);
        reject(error);
        return;
      }

      // Log every device (for debugging visibility)
      if (device?.name) {
        console.log(`🛰️ Found device: ${device.name}`);
      } else if (device?.id) {
        console.log(`🛰️ Found unnamed device: ${device.id}`);
      }

      // Check for CollarID_xxxxxx name pattern
      if (device?.name?.startsWith("CollarID")) {
        found = true;
        console.log(`📶 Found target: ${device.name} (id: ${device.id})`);
        manager.stopDeviceScan();

        try {
          console.log("🔗 Connecting...");
          const connectedDevice = await device.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();
          console.log("✅ Connected to", connectedDevice.name);
          resolve(connectedDevice);
        } catch (e) {
          console.error("❌ Connection failed:", e);
          reject(e);
        }
      }
    });

    // --- 3️⃣ Stop scan after 10 seconds ---
    setTimeout(() => {
      manager.stopDeviceScan();
      if (!found) {
        console.warn("⏰ Timeout: no CollarID_xxxxxx device found.");
        reject(new Error("Timeout: CollarID device not found"));
      }
    }, 10000);
  });
}

/**
 * Sends a protobuf-encoded configuration packet to the collar.
 */
export async function sendConfig(device: Device, packet: any) {
  console.log("📤 Encoding and sending config to collar...");
  const encoded = PB.encodePacket(packet);
  const base64data = Buffer.from(encoded).toString("base64");

  await device.writeCharacteristicWithResponseForService(
    COLLAR_SERVICE_UUID,
    UPDATE_CHAR_UUID,
    base64data
  );

  console.log("✅ Config written to collar successfully.");
}

/**
 * Subscribes to the collar's status updates characteristic.
 * Decodes protobuf messages and passes them to a callback.
 */
export function subscribeToStatus(
  device: Device,
  callback: (data: any) => void
) {
  console.log("📡 Subscribing to collar status updates...");
  return device.monitorCharacteristicForService(
    COLLAR_SERVICE_UUID,
    STATUS_CHAR_UUID,
    (error, characteristic) => {
      if (error) {
        console.error("❌ BLE notify error:", error);
        return;
      }

      if (characteristic?.value) {
        try {
          const bytes = Buffer.from(characteristic.value, "base64");
          const decoded = PB.decodePacket(bytes);
          callback(decoded);
        } catch (err) {
          console.error("⚠️ Failed to decode protobuf:", err);
        }
      }
    }
  );
}

/**
 * Optionally, disconnect from the current collar safely.
 */
export async function disconnectFromCollar(device: Device) {
  try {
    console.log(`🔌 Disconnecting from ${device.name ?? "collar"}...`);
    await device.cancelConnection();
    console.log("🔴 Disconnected successfully.");
  } catch (error) {
    console.error("⚠️ Failed to disconnect:", error);
  }
}
