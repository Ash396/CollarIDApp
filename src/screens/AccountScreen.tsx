import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Account</Text>
      <Text>Coming Soon</Text>
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
