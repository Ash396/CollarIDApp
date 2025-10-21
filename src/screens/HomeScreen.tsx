import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { State } from "react-native-ble-plx";
import { Buffer } from "buffer";
import * as PB from "../proto/message_pb.js";
import CollarCard from "../components/CollarCard";
import {
  manager,
  COLLAR_SERVICE_UUID,
  STATUS_CHAR_UUID,
  connectToCollar,
  disconnectFromCollar,
} from "../ble/bleManager";

interface Collar {
  id: string;
  name: string;
  battery?: number;
  sdRemaining?: number;
  sdTotal?: number;
  connected: boolean;
  device?: any;
  lastUpdate?: string;
}

export default function HomeScreen() {
  const [collars, setCollars] = useState<Collar[]>([]);
  const [scanning, setScanning] = useState(false);
  const navigation = useNavigation<any>();

  /* ---------------- Ensure Bluetooth Ready ---------------- */
  async function ensureBluetoothReady() {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }

    let state = await manager.state();
    if (state !== State.PoweredOn) {
      console.log(`Bluetooth state = ${state}. Waiting...`);
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
      console.log("✅ Bluetooth already ON.");
    }
  }

  /* ---------------- Continuous Scan ---------------- */
  useEffect(() => {
    let isCancelled = false;

    const initAndScan = async () => {
      try {
        await ensureBluetoothReady();
        console.log("🔍 Starting continuous BLE scan...");
        setScanning(true);

        manager.startDeviceScan(null, null, async (error, device) => {
          if (isCancelled) return;
          if (error) {
            console.error("❌ Scan error:", error);
            setScanning(false);
            return;
          }

          if (!device?.name?.startsWith("CollarID")) return;

          // Add new collars to list
          setCollars((prev) => {
            if (prev.some((c) => c.id === device.id)) return prev;
            return [
              ...prev,
              { id: device.id, name: device.name ?? "Unknown Collar", connected: false },
            ];
          });
        });
      } catch (err) {
        console.error("🚫 BLE init error:", err);
        setScanning(false);
      }
    };

    initAndScan();

    return () => {
      console.log("🛑 Stopping BLE scan...");
      isCancelled = true;
      manager.stopDeviceScan();
      setScanning(false);
    };
  }, []);

  /* ---------------- Connect & Fetch Metadata ---------------- */
  const handleConnect = async (collar: Collar) => {
    try {
      console.log("🔗 Connecting to", collar.name);

      const currentlyConnected = collars.find((c) => c.connected);
      if (currentlyConnected && currentlyConnected.id !== collar.id) {
        console.log("⚠️ Disconnecting from", currentlyConnected.name);
        await disconnectFromCollar(currentlyConnected.device);
        setCollars((prev) =>
          prev.map((c) =>
            c.id === currentlyConnected.id ? { ...c, connected: false, device: undefined } : c
          )
        );
      }

      const targetDevice = await manager.devices([collar.id]).then((d) => d[0]);
      if (!targetDevice) {
        console.warn("Device not found:", collar.id);
        return;
      }

      const connectedDevice = await connectToCollar(targetDevice);
      if (!connectedDevice) {
        console.warn("Connection failed");
        return;
      }

      console.log("✅ Connected to", connectedDevice.name);

      // 🔋 Fetch metadata now that we're connected
      try {
        const characteristic = await connectedDevice.readCharacteristicForService(
          COLLAR_SERVICE_UUID,
          STATUS_CHAR_UUID
        );
        console.log("📩 Connected read:", characteristic?.value);

        if (characteristic?.value) {
          const bytes = Buffer.from(characteristic.value, "base64");
          const decoded = PB.decodePacket(bytes);
          console.log("🧩 Decoded packet:", decoded);

          if (decoded?.system_state_packet) {
            const sys = decoded.system_state_packet;


            const toUint64 = (obj: any): number => {
              if (!obj) return 0;
              const low = typeof obj.low === "number" ? obj.low : 0;
              const high = typeof obj.high === "number" ? obj.high : 0;
              return low + high * 2 ** 32;
            };

            const spaceRemaining = toUint64(sys.sdcard_state?.space_remaining);
            const totalSpace = toUint64(sys.sdcard_state?.total_space);

            setCollars((prev) =>
              prev.map((c) =>
                c.id === collar.id
                  ? {
                      ...c,
                      connected: true,
                      device: connectedDevice,
                      battery: Math.round(sys.battery_state?.percentage ?? 0),
                      sdRemaining: spaceRemaining,
                      sdTotal: totalSpace,
                      lastUpdate: new Date().toLocaleTimeString(),
                    }
                  : c
              )
            );
          } else {
            console.warn("⚠️ No system_state_packet found in decoded data");
          }
        } else {
          console.warn("⚠️ No characteristic value found after connection");
        }
      } catch (readErr) {
        console.error("⚠️ Failed to read metadata after connect:", readErr);
      }

      // ✅ Navigate to Schedules screen
      navigation.navigate("SchedulesTab", {
        screen: "Schedules",
        params: { device: connectedDevice },
      });
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  /* ---------------- Disconnect ---------------- */
  const handleDisconnect = async (collar: Collar) => {
    if (!collar.device) return;
    try {
      await disconnectFromCollar(collar.device);
      setCollars((prev) =>
        prev.map((c) =>
          c.id === collar.id ? { ...c, connected: false, device: undefined } : c
        )
      );
      console.log("🔌 Disconnected from", collar.name);
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NEARBY COLLARS</Text>
      </View>

      {scanning ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f8b26a" />
          <Text style={styles.subtext}>Scanning for CollarID devices...</Text>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.subtext}>Stopped scanning</Text>
        </View>
      )}

      {collars.map((collar) => (
        <CollarCard
          key={collar.id}
          name={collar.name}
          battery={collar.battery}
          sdRemaining={collar.sdRemaining}
          sdTotal={collar.sdTotal}
          connected={collar.connected}
          lastUpdate={collar.lastUpdate}
          onConnect={() => handleConnect(collar)}
          onDisconnect={() => handleDisconnect(collar)}
        />
      ))}

      {collars.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.subtext}>No CollarID devices detected yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF", // clean neutral background
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111", // standardized dark text
    letterSpacing: 0.5,
  },
  center: {
    alignItems: "center",
    marginVertical: 24,
  },
  subtext: {
    marginTop: 10,
    fontSize: 16,
    color: "#444444",
    fontWeight: "400",
  },
});
