// mockPackets.ts — Simulates packets from a CollarID device

export function generateMockSystemStatePacket() {
  const now = Date.now();

  return {
    header: {
      system_uid: 1234,
      ms_from_start: Math.floor(Math.random() * 100000),
      epoch: now,
      packet_index: Math.floor(Math.random() * 1000),
    },
    system_state_packet: {
      engage_state: Math.random() > 0.5,
      battery_state: {
        charging: Math.random() > 0.7,
        voltage: 3.7 + Math.random() * 0.3,
        percentage: Math.floor(Math.random() * 100),
      },
      sdcard_state: {
        detected: true,
        space_remaining: 10_000_000 + Math.random() * 100_000_000,
        total_space: 128_000_000,
      },
      gps_data: {
        latitude: 42.36 + Math.random() * 0.01,
        longitude: -71.09 + Math.random() * 0.01,
        altitude: 30 + Math.random() * 5,
        speed: Math.random() * 3,
        heading: Math.random() * 360,
      },
      simple_sensor_reading: {
        temperature: 20 + Math.random() * 5,
        humidity: 40 + Math.random() * 10,
        pressure: 1010 + Math.random() * 10,
        gas: Math.random() * 500,
        pm2_5: Math.random() * 50,
        light: Math.floor(Math.random() * 1000),
        activity: Math.floor(Math.random() * 3), // 0=STILL, 1=WALK, 2=RUN
        steps: Math.floor(Math.random() * 1000),
      },
    },
  };
}
