# CollarID App

React Native companion app for the CollarID wildlife tracking collar (Mk II). Connects over BLE to configure sampling schedules, radio settings, and view power estimates.

## Screens

- **Schedules**: Create/edit/delete sampling schedules. Each schedule has a time window (inclusive hours), per-sensor settings, and shows a real-time solar-hours estimate. Swipe left to delete. "Send to Device" writes config over BLE with readback verification.
- **Power & Solar Budget**: Full power breakdown across all schedules — total required solar exposure, per-schedule contribution, and component breakdown (baseline, GPS, microphone, LoRaWAN) with bar chart. Toggle between draft and on-collar schedules.
- **Radio Config**: LoRaWAN (OTAA/ABP credentials, region, GPS-fix-only TX) and LoRa P2P (SF, BW, coding rate, sync word, frequency) settings. TX power is fixed at 22 dBm in firmware; Lost Mode TX interval is configurable.
- **Device**: BLE scan and connection management.

## Power Model

Empirical duty-cycle model (`src/utils/powerEstimator.ts`) based on Mk II hardware characterization (Table 5.1):

```
P_total = P_always-on(sensors) × (window_hours/24)
        + P_mic_delta  × (T_rec / T_mic_period)  × (window_hours/24)
        + P_gps_delta  × (T_acq / T_gps_period)  × (window_hours/24)
        + P_LoRa       × (T_event / T_LoRa_period) × (window_hours/24)
```

Solar-hours conversion: `sh/day = P_mW × 24 / (215 mW × 0.80)`

Schedule windows use inclusive hours: 0 → 23 = 24 hours, 0 → 4 = 5 hours.

## BLE Communication

Config is encoded as protobuf and written via BLE (`src/ble/bleManager.ts`). After each write the app reads back from the device and compares to verify the write succeeded.

## Development

Requires React Native environment setup. Targets iOS and Android.

```sh
# Install dependencies
npm install
bundle exec pod install   # iOS only, after first clone or native dep update

# Start Metro
npm start

# Run on device/simulator
npm run ios
npm run android
```

## Key Dependencies

- `react-native-ble-plx` — BLE communication
- `react-native-gesture-handler` — swipeable list items
- `@react-navigation/native` — navigation
- `protobufjs` — BLE payload encoding
