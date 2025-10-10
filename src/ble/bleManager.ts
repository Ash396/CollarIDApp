import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";
import * as PB from "../proto/message_pb.js";

export const manager = new BleManager();

export const COLLAR_SERVICE_UUID = "1a17b2cd-7314-493d-a4b5-32a2d53e6fd7";
export const UPDATE_CHAR_UUID = "c4dd1054-f3f3-456b-8ad5-44aaa7ba4fd2";
export const STATUS_CHAR_UUID = "9eaf9ebe-c3e9-4bd6-956e-5ca63d222fbb";


export async function connectToCollar(): Promise<Device | null> {
  return new Promise((resolve, reject) => {
    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        reject(error);
        return;
      }

      if (device?.name?.includes("CollarID")) {
        manager.stopDeviceScan();
        try {
          const connectedDevice = await device.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();
          console.log("✅ Connected to", connectedDevice.name);
          resolve(connectedDevice);
        } catch (e) {
          reject(e);
        }
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      reject(new Error("Timeout: CollarID not found"));
    }, 10000);
  });
}

export async function sendConfig(device: Device, packet: any) {
  const encoded = PB.encodePacket(packet);
  const base64data = Buffer.from(encoded).toString("base64");

  await device.writeCharacteristicWithResponseForService(
    COLLAR_SERVICE_UUID,
    UPDATE_CHAR_UUID,
    base64data
  );

  console.log("✅ Config written to collar");
}

export function subscribeToStatus(
  device: Device,
  callback: (data: any) => void
) {
  return device.monitorCharacteristicForService(
    COLLAR_SERVICE_UUID,
    STATUS_CHAR_UUID,
    (error, characteristic) => {
      if (error) {
        console.error("BLE notify error:", error);
        return;
      }

      if (characteristic?.value) {
        const bytes = Buffer.from(characteristic.value, "base64");
        const decoded = PB.decodePacket(bytes);
        callback(decoded);
      }
    }
  );
}
