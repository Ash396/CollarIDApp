import React, { useEffect, useState, useRef } from "react";
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
  const [connectedDevice, setConnectedDevice] = useState<Collar | null>(null);
  const navigation = useNavigation<any>();
  const lastSeenRef = useRef<Record<string, number>>({});

  /* ---------------- Ensure Bluetooth Ready ---------------- */
  async function ensureBluetoothReady() {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }

    const state = await manager.state();
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

  /* ---------------- Continuous Scan (only when not connected) ---------------- */
  useEffect(() => {
    if (connectedDevice) {
      console.log("🔇 Connected — skipping scan");
      manager.stopDeviceScan();
      setScanning(false);
      return;
    }

    let isCancelled = false;
    const lastSeen = lastSeenRef.current;

    const startScan = async () => {
      await ensureBluetoothReady();
      console.log("🔍 Starting BLE scan...");
      setScanning(true);

      manager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
        if (isCancelled) return;
        if (error) {
          console.error("❌ Scan error:", error);
          setScanning(false);
          return;
        }

      //   // ✅ Log every device we see
      //   if (device) {
      //     console.log(
      //       "📡 Device:",
      //       device.name ?? "(no name)",
      //       "| ID:",
      //       device.id,
      //       "| RSSI:",
      //       device.rssi
      //     );
      // }

        if (!device?.name?.startsWith("CollarID")) return;
        const now = Date.now();
        lastSeen[device.id] = now;

        setCollars((prev) => {
          const existing = prev.find((c) => c.id === device.id);
          if (existing) {
            if (existing.name !== device.name) {
              return prev.map((c) =>
                c.id === device.id ? { ...c, name: device.name! } : c
              );
            }
            return prev;
          } else {
            return [
              ...prev,
              { id: device.id, name: device.name ?? "Unknown Collar", connected: false },
            ];
          }
        });
      });

      // Remove stale devices
      const interval = setInterval(() => {
        const now = Date.now();
        setCollars((prev) =>
          prev.filter((c) => c.connected || now - (lastSeen[c.id] ?? 0) < 5000)
        );
      }, 2000);

      return () => {
        console.log("🛑 Stopping scan...");
        isCancelled = true;
        clearInterval(interval);
        manager.stopDeviceScan();
        setScanning(false);
      };
    };

    startScan();

    return () => {
      isCancelled = true;
      manager.stopDeviceScan();
      setScanning(false);
    };
  }, [connectedDevice]); // 👈 scan only when not connected

  /* ---------------- Connect ---------------- */
  const handleConnect = async (collar: Collar) => {
    try {
      console.log("🔗 Connecting to", collar.name);
      manager.stopDeviceScan();
      setScanning(false);

      // Correct way: get real connected instance
      const connected = await manager.connectToDevice(collar.id, {
        autoConnect: false,
      });

      await connected.discoverAllServicesAndCharacteristics();
      console.log("✅ Connected to", connected.name);

      /* ------------------------------------------------------------------
      * READ STATUS METADATA (battery, sdRemaining, sdTotal)
      * ------------------------------------------------------------------ */
      /* ---------- READ STATUS METADATA ---------- */
      try {
        const ch = await connected.readCharacteristicForService(
          COLLAR_SERVICE_UUID,
          STATUS_CHAR_UUID
        );

        if (ch?.value) {
          const bytes = Buffer.from(ch.value, "base64");
          const decoded = PB.Packet.decode(bytes);

          console.log("🧩 Decoded system state:", JSON.stringify(decoded, null, 2));

          const sys = decoded.systemStatePacket;

          // Battery
          const batteryPct = sys?.battery?.percentage ?? null;

          // SD card — fields come through as strings!
          const spaceRemaining = Number(sys?.sdcard?.spaceRemaining ?? 0);
          const totalSpace = Number(sys?.sdcard?.totalSpace ?? 0);

          const updated = {
            ...collar,
            connected: true,
            device: connected,
            battery: batteryPct,
            sdRemaining: spaceRemaining,
            sdTotal: totalSpace,
            lastUpdate: new Date().toLocaleTimeString(),
          };

          setConnectedDevice(updated);
          setCollars([updated]);
        }
      } catch (err) {
        console.error("⚠️ Failed to read metadata:", err);
      }


      /* ------------------------------------------------------------------
      * Navigate with correct device instance
      * ------------------------------------------------------------------ */
      navigation.navigate("SchedulesTab", {
        screen: "Schedules",
        params: { device: connected },
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
      setConnectedDevice(null);
      setCollars([]); // reset list before resuming scan
      console.log("🔌 Disconnected — resuming scan...");
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  /* ---------------- UI ---------------- */
  const displayList = connectedDevice
    ? [connectedDevice] // show only connected device
    : collars.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {connectedDevice ? "CONNECTED COLLAR" : "NEARBY COLLARS"}
        </Text>
      </View>

      {scanning && !connectedDevice && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f8b26a" />
          <Text style={styles.subtext}>Scanning for CollarID devices...</Text>
        </View>
      )}

      {displayList.map((collar) => (
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

      {!scanning && !connectedDevice && displayList.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.subtext}>No CollarID devices detected.</Text>
        </View>
      )}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFFFFF" },
  header: { marginBottom: 15 },
  title: { fontSize: 28, fontWeight: "700", color: "#111", letterSpacing: 0.5 },
  center: { alignItems: "center", marginVertical: 24 },
  subtext: { marginTop: 10, fontSize: 16, color: "#444", fontWeight: "400" },
});
