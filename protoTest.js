import {
  encodePacket,
  decodePacket,
  encodePacketHeader,
  decodePacketHeader,
  encodeSystemStatePacket,
  decodeSystemStatePacket,
} from './src/proto/message_pb.js';

// Example: create a PacketHeader
const header = {
  system_uid: 12345,
  ms_from_start: 1000,
  epoch: BigInt(Date.now()), // uint64
  packet_index: 1,
};

// Example: create a SystemStatePacket
const systemState = {
  engage_state: true,
  battery_state: { charging: false, voltage: 3.7, percentage: 85.5 },
};

// Create full packet object
const packet = {
  header,
  system_state_packet: systemState,
};

// Encode → Uint8Array
const encoded = encodePacket(packet);
console.log('✅ Encoded Packet Length:', encoded.length);

// Decode → Back to JS object
const decoded = decodePacket(encoded);
console.log('✅ Decoded Packet:', decoded);
