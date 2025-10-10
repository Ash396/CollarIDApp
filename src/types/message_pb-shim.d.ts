declare module '../proto/message_pb.js' {
  export function encodePacket(message: any): Uint8Array;
  export function decodePacket(binary: Uint8Array): any;
}
