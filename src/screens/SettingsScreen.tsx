import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <Text>Coming Soon</Text>
      {/* <View style={styles.card}>
        <Text>Region: ---</Text>
        <Text>Auth: ---</Text>
        <Text>Transmit Power: ---</Text>
      </View>
      <View style={styles.card}>
        <Text>Firmware Version: ---</Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
  },
});
