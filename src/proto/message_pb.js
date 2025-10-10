export const encodeRadioRegion = {
  REGION_US915: 0,
  REGION_AU915: 1,
  REGION_EU868: 2,
};

export const decodeRadioRegion = {
  0: "REGION_US915",
  1: "REGION_AU915",
  2: "REGION_EU868",
};

export const encodeRadioAuth = {
  AUTH_OTAA: 0,
  AUTH_ABP: 1,
};

export const decodeRadioAuth = {
  0: "AUTH_OTAA",
  1: "AUTH_ABP",
};

export const encodeAccelSampleRate = {
  ACCEL_25HZ: 0,
  ACCEL_50HZ: 1,
};

export const decodeAccelSampleRate = {
  0: "ACCEL_25HZ",
  1: "ACCEL_50HZ",
};

export const encodeAccelSensitivity = {
  ACCEL_2G: 0,
  ACCEL_4G: 1,
  ACCEL_8G: 2,
};

export const decodeAccelSensitivity = {
  0: "ACCEL_2G",
  1: "ACCEL_4G",
  2: "ACCEL_8G",
};

export const encodeActivity = {
  STILL: 0,
  WALK: 1,
  RUN: 2,
};

export const decodeActivity = {
  0: "STILL",
  1: "WALK",
  2: "RUN",
};

export function encodePacketHeader(message) {
  let bb = popByteBuffer();
  _encodePacketHeader(message, bb);
  return toUint8Array(bb);
}

function _encodePacketHeader(message, bb) {
  // optional uint32 system_uid = 1;
  let $system_uid = message.system_uid;
  if ($system_uid !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $system_uid);
  }

  // optional uint32 ms_from_start = 2;
  let $ms_from_start = message.ms_from_start;
  if ($ms_from_start !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $ms_from_start);
  }

  // optional uint64 epoch = 3;
  let $epoch = message.epoch;
  if ($epoch !== undefined) {
    writeVarint32(bb, 24);
    writeVarint64(bb, $epoch);
  }

  // optional uint32 packet_index = 4;
  let $packet_index = message.packet_index;
  if ($packet_index !== undefined) {
    writeVarint32(bb, 32);
    writeVarint32(bb, $packet_index);
  }
}

export function decodePacketHeader(binary) {
  return _decodePacketHeader(wrapByteBuffer(binary));
}

function _decodePacketHeader(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 system_uid = 1;
      case 1: {
        message.system_uid = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 ms_from_start = 2;
      case 2: {
        message.ms_from_start = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint64 epoch = 3;
      case 3: {
        message.epoch = readVarint64(bb, /* unsigned */ true);
        break;
      }

      // optional uint32 packet_index = 4;
      case 4: {
        message.packet_index = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeTimeWindow(message) {
  let bb = popByteBuffer();
  _encodeTimeWindow(message, bb);
  return toUint8Array(bb);
}

function _encodeTimeWindow(message, bb) {
  // optional uint32 start_hour = 1;
  let $start_hour = message.start_hour;
  if ($start_hour !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $start_hour);
  }

  // optional uint32 end_hour = 2;
  let $end_hour = message.end_hour;
  if ($end_hour !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $end_hour);
  }
}

export function decodeTimeWindow(binary) {
  return _decodeTimeWindow(wrapByteBuffer(binary));
}

function _decodeTimeWindow(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 start_hour = 1;
      case 1: {
        message.start_hour = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 end_hour = 2;
      case 2: {
        message.end_hour = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeSamplingConfig(message) {
  let bb = popByteBuffer();
  _encodeSamplingConfig(message, bb);
  return toUint8Array(bb);
}

function _encodeSamplingConfig(message, bb) {
  // optional bool enabled = 1;
  let $enabled = message.enabled;
  if ($enabled !== undefined) {
    writeVarint32(bb, 8);
    writeByte(bb, $enabled ? 1 : 0);
  }

  // optional uint32 sample_interval_min = 2;
  let $sample_interval_min = message.sample_interval_min;
  if ($sample_interval_min !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $sample_interval_min);
  }
}

export function decodeSamplingConfig(binary) {
  return _decodeSamplingConfig(wrapByteBuffer(binary));
}

function _decodeSamplingConfig(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bool enabled = 1;
      case 1: {
        message.enabled = !!readByte(bb);
        break;
      }

      // optional uint32 sample_interval_min = 2;
      case 2: {
        message.sample_interval_min = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeGPSConfig(message) {
  let bb = popByteBuffer();
  _encodeGPSConfig(message, bb);
  return toUint8Array(bb);
}

function _encodeGPSConfig(message, bb) {
  // optional bool enabled = 1;
  let $enabled = message.enabled;
  if ($enabled !== undefined) {
    writeVarint32(bb, 8);
    writeByte(bb, $enabled ? 1 : 0);
  }

  // optional uint32 sample_interval_min = 2;
  let $sample_interval_min = message.sample_interval_min;
  if ($sample_interval_min !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $sample_interval_min);
  }

  // optional uint32 accuracy = 3;
  let $accuracy = message.accuracy;
  if ($accuracy !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, $accuracy);
  }
}

export function decodeGPSConfig(binary) {
  return _decodeGPSConfig(wrapByteBuffer(binary));
}

function _decodeGPSConfig(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bool enabled = 1;
      case 1: {
        message.enabled = !!readByte(bb);
        break;
      }

      // optional uint32 sample_interval_min = 2;
      case 2: {
        message.sample_interval_min = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 accuracy = 3;
      case 3: {
        message.accuracy = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeRadioOTAA(message) {
  let bb = popByteBuffer();
  _encodeRadioOTAA(message, bb);
  return toUint8Array(bb);
}

function _encodeRadioOTAA(message, bb) {
  // optional bytes dev_eui = 1;
  let $dev_eui = message.dev_eui;
  if ($dev_eui !== undefined) {
    writeVarint32(bb, 10);
    writeVarint32(bb, $dev_eui.length), writeBytes(bb, $dev_eui);
  }

  // optional bytes join_eui = 2;
  let $join_eui = message.join_eui;
  if ($join_eui !== undefined) {
    writeVarint32(bb, 18);
    writeVarint32(bb, $join_eui.length), writeBytes(bb, $join_eui);
  }

  // optional bytes app_key = 3;
  let $app_key = message.app_key;
  if ($app_key !== undefined) {
    writeVarint32(bb, 26);
    writeVarint32(bb, $app_key.length), writeBytes(bb, $app_key);
  }
}

export function decodeRadioOTAA(binary) {
  return _decodeRadioOTAA(wrapByteBuffer(binary));
}

function _decodeRadioOTAA(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bytes dev_eui = 1;
      case 1: {
        message.dev_eui = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional bytes join_eui = 2;
      case 2: {
        message.join_eui = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional bytes app_key = 3;
      case 3: {
        message.app_key = readBytes(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeRadioABP(message) {
  let bb = popByteBuffer();
  _encodeRadioABP(message, bb);
  return toUint8Array(bb);
}

function _encodeRadioABP(message, bb) {
  // optional bytes dev_addr = 1;
  let $dev_addr = message.dev_addr;
  if ($dev_addr !== undefined) {
    writeVarint32(bb, 10);
    writeVarint32(bb, $dev_addr.length), writeBytes(bb, $dev_addr);
  }

  // optional bytes nwk_s_key = 2;
  let $nwk_s_key = message.nwk_s_key;
  if ($nwk_s_key !== undefined) {
    writeVarint32(bb, 18);
    writeVarint32(bb, $nwk_s_key.length), writeBytes(bb, $nwk_s_key);
  }

  // optional bytes app_s_key = 3;
  let $app_s_key = message.app_s_key;
  if ($app_s_key !== undefined) {
    writeVarint32(bb, 26);
    writeVarint32(bb, $app_s_key.length), writeBytes(bb, $app_s_key);
  }

  // optional bytes f_nwk_s_int_key = 4;
  let $f_nwk_s_int_key = message.f_nwk_s_int_key;
  if ($f_nwk_s_int_key !== undefined) {
    writeVarint32(bb, 34);
    writeVarint32(bb, $f_nwk_s_int_key.length), writeBytes(bb, $f_nwk_s_int_key);
  }

  // optional bytes s_nwk_s_int_key = 5;
  let $s_nwk_s_int_key = message.s_nwk_s_int_key;
  if ($s_nwk_s_int_key !== undefined) {
    writeVarint32(bb, 42);
    writeVarint32(bb, $s_nwk_s_int_key.length), writeBytes(bb, $s_nwk_s_int_key);
  }
}

export function decodeRadioABP(binary) {
  return _decodeRadioABP(wrapByteBuffer(binary));
}

function _decodeRadioABP(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bytes dev_addr = 1;
      case 1: {
        message.dev_addr = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional bytes nwk_s_key = 2;
      case 2: {
        message.nwk_s_key = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional bytes app_s_key = 3;
      case 3: {
        message.app_s_key = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional bytes f_nwk_s_int_key = 4;
      case 4: {
        message.f_nwk_s_int_key = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional bytes s_nwk_s_int_key = 5;
      case 5: {
        message.s_nwk_s_int_key = readBytes(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeRadioConfig(message) {
  let bb = popByteBuffer();
  _encodeRadioConfig(message, bb);
  return toUint8Array(bb);
}

function _encodeRadioConfig(message, bb) {
  // optional bool enabled = 1;
  let $enabled = message.enabled;
  if ($enabled !== undefined) {
    writeVarint32(bb, 8);
    writeByte(bb, $enabled ? 1 : 0);
  }

  // optional RadioRegion region = 2;
  let $region = message.region;
  if ($region !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, encodeRadioRegion[$region]);
  }

  // optional RadioAuth auth = 3;
  let $auth = message.auth;
  if ($auth !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, encodeRadioAuth[$auth]);
  }

  // optional RadioOTAA otaa = 4;
  let $otaa = message.otaa;
  if ($otaa !== undefined) {
    writeVarint32(bb, 34);
    let nested = popByteBuffer();
    _encodeRadioOTAA($otaa, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional RadioABP abp = 5;
  let $abp = message.abp;
  if ($abp !== undefined) {
    writeVarint32(bb, 42);
    let nested = popByteBuffer();
    _encodeRadioABP($abp, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional uint32 transmit_interval_min = 6;
  let $transmit_interval_min = message.transmit_interval_min;
  if ($transmit_interval_min !== undefined) {
    writeVarint32(bb, 48);
    writeVarint32(bb, $transmit_interval_min);
  }

  // optional bool tx_only_on_new_gps_fix = 7;
  let $tx_only_on_new_gps_fix = message.tx_only_on_new_gps_fix;
  if ($tx_only_on_new_gps_fix !== undefined) {
    writeVarint32(bb, 56);
    writeByte(bb, $tx_only_on_new_gps_fix ? 1 : 0);
  }

  // optional int32 tx_power_dbm = 8;
  let $tx_power_dbm = message.tx_power_dbm;
  if ($tx_power_dbm !== undefined) {
    writeVarint32(bb, 64);
    writeVarint64(bb, intToLong($tx_power_dbm));
  }
}

export function decodeRadioConfig(binary) {
  return _decodeRadioConfig(wrapByteBuffer(binary));
}

function _decodeRadioConfig(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bool enabled = 1;
      case 1: {
        message.enabled = !!readByte(bb);
        break;
      }

      // optional RadioRegion region = 2;
      case 2: {
        message.region = decodeRadioRegion[readVarint32(bb)];
        break;
      }

      // optional RadioAuth auth = 3;
      case 3: {
        message.auth = decodeRadioAuth[readVarint32(bb)];
        break;
      }

      // optional RadioOTAA otaa = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        message.otaa = _decodeRadioOTAA(bb);
        bb.limit = limit;
        break;
      }

      // optional RadioABP abp = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        message.abp = _decodeRadioABP(bb);
        bb.limit = limit;
        break;
      }

      // optional uint32 transmit_interval_min = 6;
      case 6: {
        message.transmit_interval_min = readVarint32(bb) >>> 0;
        break;
      }

      // optional bool tx_only_on_new_gps_fix = 7;
      case 7: {
        message.tx_only_on_new_gps_fix = !!readByte(bb);
        break;
      }

      // optional int32 tx_power_dbm = 8;
      case 8: {
        message.tx_power_dbm = readVarint32(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeMicrophoneConfig(message) {
  let bb = popByteBuffer();
  _encodeMicrophoneConfig(message, bb);
  return toUint8Array(bb);
}

function _encodeMicrophoneConfig(message, bb) {
  // optional bool enabled = 1;
  let $enabled = message.enabled;
  if ($enabled !== undefined) {
    writeVarint32(bb, 8);
    writeByte(bb, $enabled ? 1 : 0);
  }

  // optional bool continuous_mode = 2;
  let $continuous_mode = message.continuous_mode;
  if ($continuous_mode !== undefined) {
    writeVarint32(bb, 16);
    writeByte(bb, $continuous_mode ? 1 : 0);
  }

  // optional uint32 sample_length_min = 3;
  let $sample_length_min = message.sample_length_min;
  if ($sample_length_min !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, $sample_length_min);
  }

  // optional uint32 sample_window_min = 4;
  let $sample_window_min = message.sample_window_min;
  if ($sample_window_min !== undefined) {
    writeVarint32(bb, 32);
    writeVarint32(bb, $sample_window_min);
  }
}

export function decodeMicrophoneConfig(binary) {
  return _decodeMicrophoneConfig(wrapByteBuffer(binary));
}

function _decodeMicrophoneConfig(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bool enabled = 1;
      case 1: {
        message.enabled = !!readByte(bb);
        break;
      }

      // optional bool continuous_mode = 2;
      case 2: {
        message.continuous_mode = !!readByte(bb);
        break;
      }

      // optional uint32 sample_length_min = 3;
      case 3: {
        message.sample_length_min = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 sample_window_min = 4;
      case 4: {
        message.sample_window_min = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeAccelerometerConfig(message) {
  let bb = popByteBuffer();
  _encodeAccelerometerConfig(message, bb);
  return toUint8Array(bb);
}

function _encodeAccelerometerConfig(message, bb) {
  // optional bool enabled = 1;
  let $enabled = message.enabled;
  if ($enabled !== undefined) {
    writeVarint32(bb, 8);
    writeByte(bb, $enabled ? 1 : 0);
  }

  // optional AccelSampleRate sample_rate = 2;
  let $sample_rate = message.sample_rate;
  if ($sample_rate !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, encodeAccelSampleRate[$sample_rate]);
  }

  // optional AccelSensitivity sensitivity = 3;
  let $sensitivity = message.sensitivity;
  if ($sensitivity !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, encodeAccelSensitivity[$sensitivity]);
  }
}

export function decodeAccelerometerConfig(binary) {
  return _decodeAccelerometerConfig(wrapByteBuffer(binary));
}

function _decodeAccelerometerConfig(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bool enabled = 1;
      case 1: {
        message.enabled = !!readByte(bb);
        break;
      }

      // optional AccelSampleRate sample_rate = 2;
      case 2: {
        message.sample_rate = decodeAccelSampleRate[readVarint32(bb)];
        break;
      }

      // optional AccelSensitivity sensitivity = 3;
      case 3: {
        message.sensitivity = decodeAccelSensitivity[readVarint32(bb)];
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeFirmwareInfo(message) {
  let bb = popByteBuffer();
  _encodeFirmwareInfo(message, bb);
  return toUint8Array(bb);
}

function _encodeFirmwareInfo(message, bb) {
  // optional string version = 1;
  let $version = message.version;
  if ($version !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $version);
  }
}

export function decodeFirmwareInfo(binary) {
  return _decodeFirmwareInfo(wrapByteBuffer(binary));
}

function _decodeFirmwareInfo(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string version = 1;
      case 1: {
        message.version = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeScheduledConfig(message) {
  let bb = popByteBuffer();
  _encodeScheduledConfig(message, bb);
  return toUint8Array(bb);
}

function _encodeScheduledConfig(message, bb) {
  // optional TimeWindow window = 1;
  let $window = message.window;
  if ($window !== undefined) {
    writeVarint32(bb, 10);
    let nested = popByteBuffer();
    _encodeTimeWindow($window, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional SamplingConfig light = 2;
  let $light = message.light;
  if ($light !== undefined) {
    writeVarint32(bb, 18);
    let nested = popByteBuffer();
    _encodeSamplingConfig($light, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional SamplingConfig environmental = 3;
  let $environmental = message.environmental;
  if ($environmental !== undefined) {
    writeVarint32(bb, 26);
    let nested = popByteBuffer();
    _encodeSamplingConfig($environmental, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional SamplingConfig particulate = 4;
  let $particulate = message.particulate;
  if ($particulate !== undefined) {
    writeVarint32(bb, 34);
    let nested = popByteBuffer();
    _encodeSamplingConfig($particulate, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional GPSConfig gps = 5;
  let $gps = message.gps;
  if ($gps !== undefined) {
    writeVarint32(bb, 42);
    let nested = popByteBuffer();
    _encodeGPSConfig($gps, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional RadioConfig radio = 6;
  let $radio = message.radio;
  if ($radio !== undefined) {
    writeVarint32(bb, 50);
    let nested = popByteBuffer();
    _encodeRadioConfig($radio, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional MicrophoneConfig microphone = 7;
  let $microphone = message.microphone;
  if ($microphone !== undefined) {
    writeVarint32(bb, 58);
    let nested = popByteBuffer();
    _encodeMicrophoneConfig($microphone, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional AccelerometerConfig accelerometer = 8;
  let $accelerometer = message.accelerometer;
  if ($accelerometer !== undefined) {
    writeVarint32(bb, 66);
    let nested = popByteBuffer();
    _encodeAccelerometerConfig($accelerometer, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional FirmwareInfo firmware = 9;
  let $firmware = message.firmware;
  if ($firmware !== undefined) {
    writeVarint32(bb, 74);
    let nested = popByteBuffer();
    _encodeFirmwareInfo($firmware, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }
}

export function decodeScheduledConfig(binary) {
  return _decodeScheduledConfig(wrapByteBuffer(binary));
}

function _decodeScheduledConfig(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional TimeWindow window = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        message.window = _decodeTimeWindow(bb);
        bb.limit = limit;
        break;
      }

      // optional SamplingConfig light = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        message.light = _decodeSamplingConfig(bb);
        bb.limit = limit;
        break;
      }

      // optional SamplingConfig environmental = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        message.environmental = _decodeSamplingConfig(bb);
        bb.limit = limit;
        break;
      }

      // optional SamplingConfig particulate = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        message.particulate = _decodeSamplingConfig(bb);
        bb.limit = limit;
        break;
      }

      // optional GPSConfig gps = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        message.gps = _decodeGPSConfig(bb);
        bb.limit = limit;
        break;
      }

      // optional RadioConfig radio = 6;
      case 6: {
        let limit = pushTemporaryLength(bb);
        message.radio = _decodeRadioConfig(bb);
        bb.limit = limit;
        break;
      }

      // optional MicrophoneConfig microphone = 7;
      case 7: {
        let limit = pushTemporaryLength(bb);
        message.microphone = _decodeMicrophoneConfig(bb);
        bb.limit = limit;
        break;
      }

      // optional AccelerometerConfig accelerometer = 8;
      case 8: {
        let limit = pushTemporaryLength(bb);
        message.accelerometer = _decodeAccelerometerConfig(bb);
        bb.limit = limit;
        break;
      }

      // optional FirmwareInfo firmware = 9;
      case 9: {
        let limit = pushTemporaryLength(bb);
        message.firmware = _decodeFirmwareInfo(bb);
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeScheduleConfigPacket(message) {
  let bb = popByteBuffer();
  _encodeScheduleConfigPacket(message, bb);
  return toUint8Array(bb);
}

function _encodeScheduleConfigPacket(message, bb) {
  // repeated ScheduledConfig schedules = 1;
  let array$schedules = message.schedules;
  if (array$schedules !== undefined) {
    for (let value of array$schedules) {
      writeVarint32(bb, 10);
      let nested = popByteBuffer();
      _encodeScheduledConfig(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeScheduleConfigPacket(binary) {
  return _decodeScheduleConfigPacket(wrapByteBuffer(binary));
}

function _decodeScheduleConfigPacket(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // repeated ScheduledConfig schedules = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        let values = message.schedules || (message.schedules = []);
        values.push(_decodeScheduledConfig(bb));
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeSimpleSensorReading(message) {
  let bb = popByteBuffer();
  _encodeSimpleSensorReading(message, bb);
  return toUint8Array(bb);
}

function _encodeSimpleSensorReading(message, bb) {
  // optional uint32 index = 1;
  let $index = message.index;
  if ($index !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $index);
  }

  // optional uint32 epoch = 2;
  let $epoch = message.epoch;
  if ($epoch !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $epoch);
  }

  // optional float temperature = 3;
  let $temperature = message.temperature;
  if ($temperature !== undefined) {
    writeVarint32(bb, 29);
    writeFloat(bb, $temperature);
  }

  // optional float humidity = 4;
  let $humidity = message.humidity;
  if ($humidity !== undefined) {
    writeVarint32(bb, 37);
    writeFloat(bb, $humidity);
  }

  // optional float pressure = 5;
  let $pressure = message.pressure;
  if ($pressure !== undefined) {
    writeVarint32(bb, 45);
    writeFloat(bb, $pressure);
  }

  // optional float gas = 6;
  let $gas = message.gas;
  if ($gas !== undefined) {
    writeVarint32(bb, 53);
    writeFloat(bb, $gas);
  }

  // optional float pm2_5 = 7;
  let $pm2_5 = message.pm2_5;
  if ($pm2_5 !== undefined) {
    writeVarint32(bb, 61);
    writeFloat(bb, $pm2_5);
  }

  // optional uint32 light = 8;
  let $light = message.light;
  if ($light !== undefined) {
    writeVarint32(bb, 64);
    writeVarint32(bb, $light);
  }

  // optional Activity activity = 9;
  let $activity = message.activity;
  if ($activity !== undefined) {
    writeVarint32(bb, 72);
    writeVarint32(bb, encodeActivity[$activity]);
  }

  // optional uint32 steps = 10;
  let $steps = message.steps;
  if ($steps !== undefined) {
    writeVarint32(bb, 80);
    writeVarint32(bb, $steps);
  }

  // optional bool particulate_static_obstructed = 11;
  let $particulate_static_obstructed = message.particulate_static_obstructed;
  if ($particulate_static_obstructed !== undefined) {
    writeVarint32(bb, 88);
    writeByte(bb, $particulate_static_obstructed ? 1 : 0);
  }

  // optional bool particulate_dynamic_obstructed = 12;
  let $particulate_dynamic_obstructed = message.particulate_dynamic_obstructed;
  if ($particulate_dynamic_obstructed !== undefined) {
    writeVarint32(bb, 96);
    writeByte(bb, $particulate_dynamic_obstructed ? 1 : 0);
  }

  // optional bool particulate_outside_detection_limits = 13;
  let $particulate_outside_detection_limits = message.particulate_outside_detection_limits;
  if ($particulate_outside_detection_limits !== undefined) {
    writeVarint32(bb, 104);
    writeByte(bb, $particulate_outside_detection_limits ? 1 : 0);
  }
}

export function decodeSimpleSensorReading(binary) {
  return _decodeSimpleSensorReading(wrapByteBuffer(binary));
}

function _decodeSimpleSensorReading(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 index = 1;
      case 1: {
        message.index = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 epoch = 2;
      case 2: {
        message.epoch = readVarint32(bb) >>> 0;
        break;
      }

      // optional float temperature = 3;
      case 3: {
        message.temperature = readFloat(bb);
        break;
      }

      // optional float humidity = 4;
      case 4: {
        message.humidity = readFloat(bb);
        break;
      }

      // optional float pressure = 5;
      case 5: {
        message.pressure = readFloat(bb);
        break;
      }

      // optional float gas = 6;
      case 6: {
        message.gas = readFloat(bb);
        break;
      }

      // optional float pm2_5 = 7;
      case 7: {
        message.pm2_5 = readFloat(bb);
        break;
      }

      // optional uint32 light = 8;
      case 8: {
        message.light = readVarint32(bb) >>> 0;
        break;
      }

      // optional Activity activity = 9;
      case 9: {
        message.activity = decodeActivity[readVarint32(bb)];
        break;
      }

      // optional uint32 steps = 10;
      case 10: {
        message.steps = readVarint32(bb) >>> 0;
        break;
      }

      // optional bool particulate_static_obstructed = 11;
      case 11: {
        message.particulate_static_obstructed = !!readByte(bb);
        break;
      }

      // optional bool particulate_dynamic_obstructed = 12;
      case 12: {
        message.particulate_dynamic_obstructed = !!readByte(bb);
        break;
      }

      // optional bool particulate_outside_detection_limits = 13;
      case 13: {
        message.particulate_outside_detection_limits = !!readByte(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeBatteryState(message) {
  let bb = popByteBuffer();
  _encodeBatteryState(message, bb);
  return toUint8Array(bb);
}

function _encodeBatteryState(message, bb) {
  // optional bool charging = 1;
  let $charging = message.charging;
  if ($charging !== undefined) {
    writeVarint32(bb, 8);
    writeByte(bb, $charging ? 1 : 0);
  }

  // optional float voltage = 2;
  let $voltage = message.voltage;
  if ($voltage !== undefined) {
    writeVarint32(bb, 21);
    writeFloat(bb, $voltage);
  }

  // optional float percentage = 3;
  let $percentage = message.percentage;
  if ($percentage !== undefined) {
    writeVarint32(bb, 29);
    writeFloat(bb, $percentage);
  }
}

export function decodeBatteryState(binary) {
  return _decodeBatteryState(wrapByteBuffer(binary));
}

function _decodeBatteryState(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bool charging = 1;
      case 1: {
        message.charging = !!readByte(bb);
        break;
      }

      // optional float voltage = 2;
      case 2: {
        message.voltage = readFloat(bb);
        break;
      }

      // optional float percentage = 3;
      case 3: {
        message.percentage = readFloat(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeSDCardState(message) {
  let bb = popByteBuffer();
  _encodeSDCardState(message, bb);
  return toUint8Array(bb);
}

function _encodeSDCardState(message, bb) {
  // optional bool detected = 1;
  let $detected = message.detected;
  if ($detected !== undefined) {
    writeVarint32(bb, 8);
    writeByte(bb, $detected ? 1 : 0);
  }

  // optional uint64 space_remaining = 2;
  let $space_remaining = message.space_remaining;
  if ($space_remaining !== undefined) {
    writeVarint32(bb, 16);
    writeVarint64(bb, $space_remaining);
  }

  // optional uint64 total_space = 3;
  let $total_space = message.total_space;
  if ($total_space !== undefined) {
    writeVarint32(bb, 24);
    writeVarint64(bb, $total_space);
  }
}

export function decodeSDCardState(binary) {
  return _decodeSDCardState(wrapByteBuffer(binary));
}

function _decodeSDCardState(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bool detected = 1;
      case 1: {
        message.detected = !!readByte(bb);
        break;
      }

      // optional uint64 space_remaining = 2;
      case 2: {
        message.space_remaining = readVarint64(bb, /* unsigned */ true);
        break;
      }

      // optional uint64 total_space = 3;
      case 3: {
        message.total_space = readVarint64(bb, /* unsigned */ true);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeGPSData(message) {
  let bb = popByteBuffer();
  _encodeGPSData(message, bb);
  return toUint8Array(bb);
}

function _encodeGPSData(message, bb) {
  // optional float latitude = 1;
  let $latitude = message.latitude;
  if ($latitude !== undefined) {
    writeVarint32(bb, 13);
    writeFloat(bb, $latitude);
  }

  // optional float longitude = 2;
  let $longitude = message.longitude;
  if ($longitude !== undefined) {
    writeVarint32(bb, 21);
    writeFloat(bb, $longitude);
  }

  // optional float altitude = 3;
  let $altitude = message.altitude;
  if ($altitude !== undefined) {
    writeVarint32(bb, 29);
    writeFloat(bb, $altitude);
  }

  // optional float speed = 4;
  let $speed = message.speed;
  if ($speed !== undefined) {
    writeVarint32(bb, 37);
    writeFloat(bb, $speed);
  }

  // optional float heading = 5;
  let $heading = message.heading;
  if ($heading !== undefined) {
    writeVarint32(bb, 45);
    writeFloat(bb, $heading);
  }
}

export function decodeGPSData(binary) {
  return _decodeGPSData(wrapByteBuffer(binary));
}

function _decodeGPSData(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional float latitude = 1;
      case 1: {
        message.latitude = readFloat(bb);
        break;
      }

      // optional float longitude = 2;
      case 2: {
        message.longitude = readFloat(bb);
        break;
      }

      // optional float altitude = 3;
      case 3: {
        message.altitude = readFloat(bb);
        break;
      }

      // optional float speed = 4;
      case 4: {
        message.speed = readFloat(bb);
        break;
      }

      // optional float heading = 5;
      case 5: {
        message.heading = readFloat(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeSystemStatePacket(message) {
  let bb = popByteBuffer();
  _encodeSystemStatePacket(message, bb);
  return toUint8Array(bb);
}

function _encodeSystemStatePacket(message, bb) {
  // optional bool engage_state = 1;
  let $engage_state = message.engage_state;
  if ($engage_state !== undefined) {
    writeVarint32(bb, 8);
    writeByte(bb, $engage_state ? 1 : 0);
  }

  // optional BatteryState battery_state = 2;
  let $battery_state = message.battery_state;
  if ($battery_state !== undefined) {
    writeVarint32(bb, 18);
    let nested = popByteBuffer();
    _encodeBatteryState($battery_state, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional SDCardState sdcard_state = 3;
  let $sdcard_state = message.sdcard_state;
  if ($sdcard_state !== undefined) {
    writeVarint32(bb, 26);
    let nested = popByteBuffer();
    _encodeSDCardState($sdcard_state, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional GPSData gps_data = 4;
  let $gps_data = message.gps_data;
  if ($gps_data !== undefined) {
    writeVarint32(bb, 34);
    let nested = popByteBuffer();
    _encodeGPSData($gps_data, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional SimpleSensorReading simple_sensor_reading = 5;
  let $simple_sensor_reading = message.simple_sensor_reading;
  if ($simple_sensor_reading !== undefined) {
    writeVarint32(bb, 42);
    let nested = popByteBuffer();
    _encodeSimpleSensorReading($simple_sensor_reading, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }
}

export function decodeSystemStatePacket(binary) {
  return _decodeSystemStatePacket(wrapByteBuffer(binary));
}

function _decodeSystemStatePacket(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bool engage_state = 1;
      case 1: {
        message.engage_state = !!readByte(bb);
        break;
      }

      // optional BatteryState battery_state = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        message.battery_state = _decodeBatteryState(bb);
        bb.limit = limit;
        break;
      }

      // optional SDCardState sdcard_state = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        message.sdcard_state = _decodeSDCardState(bb);
        bb.limit = limit;
        break;
      }

      // optional GPSData gps_data = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        message.gps_data = _decodeGPSData(bb);
        bb.limit = limit;
        break;
      }

      // optional SimpleSensorReading simple_sensor_reading = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        message.simple_sensor_reading = _decodeSimpleSensorReading(bb);
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodePacket(message) {
  let bb = popByteBuffer();
  _encodePacket(message, bb);
  return toUint8Array(bb);
}

function _encodePacket(message, bb) {
  // optional PacketHeader header = 1;
  let $header = message.header;
  if ($header !== undefined) {
    writeVarint32(bb, 10);
    let nested = popByteBuffer();
    _encodePacketHeader($header, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional ScheduleConfigPacket schedule_config_packet = 2;
  let $schedule_config_packet = message.schedule_config_packet;
  if ($schedule_config_packet !== undefined) {
    writeVarint32(bb, 18);
    let nested = popByteBuffer();
    _encodeScheduleConfigPacket($schedule_config_packet, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional SystemStatePacket system_state_packet = 3;
  let $system_state_packet = message.system_state_packet;
  if ($system_state_packet !== undefined) {
    writeVarint32(bb, 26);
    let nested = popByteBuffer();
    _encodeSystemStatePacket($system_state_packet, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }
}

export function decodePacket(binary) {
  return _decodePacket(wrapByteBuffer(binary));
}

function _decodePacket(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional PacketHeader header = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        message.header = _decodePacketHeader(bb);
        bb.limit = limit;
        break;
      }

      // optional ScheduleConfigPacket schedule_config_packet = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        message.schedule_config_packet = _decodeScheduleConfigPacket(bb);
        bb.limit = limit;
        break;
      }

      // optional SystemStatePacket system_state_packet = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        message.system_state_packet = _decodeSystemStatePacket(bb);
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

function pushTemporaryLength(bb) {
  let length = readVarint32(bb);
  let limit = bb.limit;
  bb.limit = bb.offset + length;
  return limit;
}

function skipUnknownField(bb, type) {
  switch (type) {
    case 0: while (readByte(bb) & 0x80) { } break;
    case 2: skip(bb, readVarint32(bb)); break;
    case 5: skip(bb, 4); break;
    case 1: skip(bb, 8); break;
    default: throw new Error("Unimplemented type: " + type);
  }
}

function stringToLong(value) {
  return {
    low: value.charCodeAt(0) | (value.charCodeAt(1) << 16),
    high: value.charCodeAt(2) | (value.charCodeAt(3) << 16),
    unsigned: false,
  };
}

function longToString(value) {
  let low = value.low;
  let high = value.high;
  return String.fromCharCode(
    low & 0xFFFF,
    low >>> 16,
    high & 0xFFFF,
    high >>> 16);
}

// The code below was modified from https://github.com/protobufjs/bytebuffer.js
// which is under the Apache License 2.0.

let f32 = new Float32Array(1);
let f32_u8 = new Uint8Array(f32.buffer);

let f64 = new Float64Array(1);
let f64_u8 = new Uint8Array(f64.buffer);

function intToLong(value) {
  value |= 0;
  return {
    low: value,
    high: value >> 31,
    unsigned: value >= 0,
  };
}

let bbStack = [];

function popByteBuffer() {
  const bb = bbStack.pop();
  if (!bb) return { bytes: new Uint8Array(64), offset: 0, limit: 0 };
  bb.offset = bb.limit = 0;
  return bb;
}

function pushByteBuffer(bb) {
  bbStack.push(bb);
}

function wrapByteBuffer(bytes) {
  return { bytes, offset: 0, limit: bytes.length };
}

function toUint8Array(bb) {
  let bytes = bb.bytes;
  let limit = bb.limit;
  return bytes.length === limit ? bytes : bytes.subarray(0, limit);
}

function skip(bb, offset) {
  if (bb.offset + offset > bb.limit) {
    throw new Error('Skip past limit');
  }
  bb.offset += offset;
}

function isAtEnd(bb) {
  return bb.offset >= bb.limit;
}

function grow(bb, count) {
  let bytes = bb.bytes;
  let offset = bb.offset;
  let limit = bb.limit;
  let finalOffset = offset + count;
  if (finalOffset > bytes.length) {
    let newBytes = new Uint8Array(finalOffset * 2);
    newBytes.set(bytes);
    bb.bytes = newBytes;
  }
  bb.offset = finalOffset;
  if (finalOffset > limit) {
    bb.limit = finalOffset;
  }
  return offset;
}

function advance(bb, count) {
  let offset = bb.offset;
  if (offset + count > bb.limit) {
    throw new Error('Read past limit');
  }
  bb.offset += count;
  return offset;
}

function readBytes(bb, count) {
  let offset = advance(bb, count);
  return bb.bytes.subarray(offset, offset + count);
}

function writeBytes(bb, buffer) {
  let offset = grow(bb, buffer.length);
  bb.bytes.set(buffer, offset);
}

function readString(bb, count) {
  // Sadly a hand-coded UTF8 decoder is much faster than subarray+TextDecoder in V8
  let offset = advance(bb, count);
  let fromCharCode = String.fromCharCode;
  let bytes = bb.bytes;
  let invalid = '\uFFFD';
  let text = '';

  for (let i = 0; i < count; i++) {
    let c1 = bytes[i + offset], c2, c3, c4, c;

    // 1 byte
    if ((c1 & 0x80) === 0) {
      text += fromCharCode(c1);
    }

    // 2 bytes
    else if ((c1 & 0xE0) === 0xC0) {
      if (i + 1 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        if ((c2 & 0xC0) !== 0x80) text += invalid;
        else {
          c = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
          if (c < 0x80) text += invalid;
          else {
            text += fromCharCode(c);
            i++;
          }
        }
      }
    }

    // 3 bytes
    else if ((c1 & 0xF0) == 0xE0) {
      if (i + 2 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        if (((c2 | (c3 << 8)) & 0xC0C0) !== 0x8080) text += invalid;
        else {
          c = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
          if (c < 0x0800 || (c >= 0xD800 && c <= 0xDFFF)) text += invalid;
          else {
            text += fromCharCode(c);
            i += 2;
          }
        }
      }
    }

    // 4 bytes
    else if ((c1 & 0xF8) == 0xF0) {
      if (i + 3 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        c4 = bytes[i + offset + 3];
        if (((c2 | (c3 << 8) | (c4 << 16)) & 0xC0C0C0) !== 0x808080) text += invalid;
        else {
          c = ((c1 & 0x07) << 0x12) | ((c2 & 0x3F) << 0x0C) | ((c3 & 0x3F) << 0x06) | (c4 & 0x3F);
          if (c < 0x10000 || c > 0x10FFFF) text += invalid;
          else {
            c -= 0x10000;
            text += fromCharCode((c >> 10) + 0xD800, (c & 0x3FF) + 0xDC00);
            i += 3;
          }
        }
      }
    }

    else text += invalid;
  }

  return text;
}

function writeString(bb, text) {
  // Sadly a hand-coded UTF8 encoder is much faster than TextEncoder+set in V8
  let n = text.length;
  let byteCount = 0;

  // Write the byte count first
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    byteCount += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }
  writeVarint32(bb, byteCount);

  let offset = grow(bb, byteCount);
  let bytes = bb.bytes;

  // Then write the bytes
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    if (c < 0x80) {
      bytes[offset++] = c;
    } else {
      if (c < 0x800) {
        bytes[offset++] = ((c >> 6) & 0x1F) | 0xC0;
      } else {
        if (c < 0x10000) {
          bytes[offset++] = ((c >> 12) & 0x0F) | 0xE0;
        } else {
          bytes[offset++] = ((c >> 18) & 0x07) | 0xF0;
          bytes[offset++] = ((c >> 12) & 0x3F) | 0x80;
        }
        bytes[offset++] = ((c >> 6) & 0x3F) | 0x80;
      }
      bytes[offset++] = (c & 0x3F) | 0x80;
    }
  }
}

function writeByteBuffer(bb, buffer) {
  let offset = grow(bb, buffer.limit);
  let from = bb.bytes;
  let to = buffer.bytes;

  // This for loop is much faster than subarray+set on V8
  for (let i = 0, n = buffer.limit; i < n; i++) {
    from[i + offset] = to[i];
  }
}

function readByte(bb) {
  return bb.bytes[advance(bb, 1)];
}

function writeByte(bb, value) {
  let offset = grow(bb, 1);
  bb.bytes[offset] = value;
}

function readFloat(bb) {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f32_u8[0] = bytes[offset++];
  f32_u8[1] = bytes[offset++];
  f32_u8[2] = bytes[offset++];
  f32_u8[3] = bytes[offset++];
  return f32[0];
}

function writeFloat(bb, value) {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  f32[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f32_u8[0];
  bytes[offset++] = f32_u8[1];
  bytes[offset++] = f32_u8[2];
  bytes[offset++] = f32_u8[3];
}

function readDouble(bb) {
  let offset = advance(bb, 8);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f64_u8[0] = bytes[offset++];
  f64_u8[1] = bytes[offset++];
  f64_u8[2] = bytes[offset++];
  f64_u8[3] = bytes[offset++];
  f64_u8[4] = bytes[offset++];
  f64_u8[5] = bytes[offset++];
  f64_u8[6] = bytes[offset++];
  f64_u8[7] = bytes[offset++];
  return f64[0];
}

function writeDouble(bb, value) {
  let offset = grow(bb, 8);
  let bytes = bb.bytes;
  f64[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f64_u8[0];
  bytes[offset++] = f64_u8[1];
  bytes[offset++] = f64_u8[2];
  bytes[offset++] = f64_u8[3];
  bytes[offset++] = f64_u8[4];
  bytes[offset++] = f64_u8[5];
  bytes[offset++] = f64_u8[6];
  bytes[offset++] = f64_u8[7];
}

function readInt32(bb) {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
}

function writeInt32(bb, value) {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  bytes[offset] = value;
  bytes[offset + 1] = value >> 8;
  bytes[offset + 2] = value >> 16;
  bytes[offset + 3] = value >> 24;
}

function readInt64(bb, unsigned) {
  return {
    low: readInt32(bb),
    high: readInt32(bb),
    unsigned,
  };
}

function writeInt64(bb, value) {
  writeInt32(bb, value.low);
  writeInt32(bb, value.high);
}

function readVarint32(bb) {
  let c = 0;
  let value = 0;
  let b;
  do {
    b = readByte(bb);
    if (c < 32) value |= (b & 0x7F) << c;
    c += 7;
  } while (b & 0x80);
  return value;
}

function writeVarint32(bb, value) {
  value >>>= 0;
  while (value >= 0x80) {
    writeByte(bb, (value & 0x7f) | 0x80);
    value >>>= 7;
  }
  writeByte(bb, value);
}

function readVarint64(bb, unsigned) {
  let part0 = 0;
  let part1 = 0;
  let part2 = 0;
  let b;

  b = readByte(bb); part0 = (b & 0x7F); if (b & 0x80) {
    b = readByte(bb); part0 |= (b & 0x7F) << 7; if (b & 0x80) {
      b = readByte(bb); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = readByte(bb); part0 |= (b & 0x7F) << 21; if (b & 0x80) {

          b = readByte(bb); part1 = (b & 0x7F); if (b & 0x80) {
            b = readByte(bb); part1 |= (b & 0x7F) << 7; if (b & 0x80) {
              b = readByte(bb); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
                b = readByte(bb); part1 |= (b & 0x7F) << 21; if (b & 0x80) {

                  b = readByte(bb); part2 = (b & 0x7F); if (b & 0x80) {
                    b = readByte(bb); part2 |= (b & 0x7F) << 7;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    low: part0 | (part1 << 28),
    high: (part1 >>> 4) | (part2 << 24),
    unsigned,
  };
}

function writeVarint64(bb, value) {
  let part0 = value.low >>> 0;
  let part1 = ((value.low >>> 28) | (value.high << 4)) >>> 0;
  let part2 = value.high >>> 24;

  // ref: src/google/protobuf/io/coded_stream.cc
  let size =
    part2 === 0 ?
      part1 === 0 ?
        part0 < 1 << 14 ?
          part0 < 1 << 7 ? 1 : 2 :
          part0 < 1 << 21 ? 3 : 4 :
        part1 < 1 << 14 ?
          part1 < 1 << 7 ? 5 : 6 :
          part1 < 1 << 21 ? 7 : 8 :
      part2 < 1 << 7 ? 9 : 10;

  let offset = grow(bb, size);
  let bytes = bb.bytes;

  switch (size) {
    case 10: bytes[offset + 9] = (part2 >>> 7) & 0x01;
    case 9: bytes[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
    case 8: bytes[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
    case 7: bytes[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
    case 6: bytes[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
    case 5: bytes[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
    case 4: bytes[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
    case 3: bytes[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
    case 2: bytes[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
    case 1: bytes[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
  }
}

function readVarint32ZigZag(bb) {
  let value = readVarint32(bb);

  // ref: src/google/protobuf/wire_format_lite.h
  return (value >>> 1) ^ -(value & 1);
}

function writeVarint32ZigZag(bb, value) {
  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint32(bb, (value << 1) ^ (value >> 31));
}

function readVarint64ZigZag(bb) {
  let value = readVarint64(bb, /* unsigned */ false);
  let low = value.low;
  let high = value.high;
  let flip = -(low & 1);

  // ref: src/google/protobuf/wire_format_lite.h
  return {
    low: ((low >>> 1) | (high << 31)) ^ flip,
    high: (high >>> 1) ^ flip,
    unsigned: false,
  };
}

function writeVarint64ZigZag(bb, value) {
  let low = value.low;
  let high = value.high;
  let flip = high >> 31;

  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint64(bb, {
    low: (low << 1) ^ flip,
    high: ((high << 1) | (low >>> 31)) ^ flip,
    unsigned: false,
  });
}
