import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function SchedulesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Schedules - Collar 1</Text>

      <View style={styles.card}>
        <Text>Night Schedule: 8PM - 6AM</Text>
        <Text>GPS: 5 min</Text>
        <Text>MAC: continuous</Text>
      </View>

      <View style={styles.card}>
        <Text>Day Schedule: 6AM - 8PM</Text>
        <Text>Light: 30 min</Text>
        <Text>GPS: 30 min</Text>
      </View>

      <Button title="+ Add Schedule" onPress={() => {}} />
      <Button title="Send to Device" onPress={() => {}} />
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
