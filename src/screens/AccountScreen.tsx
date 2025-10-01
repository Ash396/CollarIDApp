import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Account</Text>

      <View style={styles.card}>
        <Text>Profile (Name / Email)</Text>
        <Button title="Log In / Log Out" onPress={() => {}} />
      </View>

      <View style={styles.card}>
        <Text>App Info - About Project</Text>
      </View>

      <View style={styles.card}>
        <Text>Help & Support</Text>
        <Text>Quick Start Guide / FAQs</Text>
      </View>

      <View style={styles.card}>
        <Text>Legal</Text>
      </View>
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
