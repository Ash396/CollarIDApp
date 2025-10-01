import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Devices</Text>

      <View style={styles.card}>
        <Text>Collar 1</Text>
        <Text>Status: engaged</Text>
        <Text>Last sync: 5 min</Text>
        <Button title="Disconnect" onPress={() => {}} />
      </View>

      <View style={styles.card}>
        <Text>Collar 2</Text>
        <Text>Status: disengaged</Text>
        <Text>Last sync: 1 mo</Text>
        <Button title="Connect" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
  },
});
