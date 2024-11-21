// src/utils/replyid.ts
export function generateId(channelId: number, counter: number): string {
  // Ensure channelId and counter are within 12-bit limits
  if (channelId < 0 || channelId > 0xFFF) {
      throw new Error("channelId must be between 0 and 4095");
  }
  if (counter < 0 || counter > 0xFFF) {
      throw new Error("counter must be between 0 and 4095");
  }

  const originDate = new Date('2024-01-01T00:00:00Z').getTime();
  const currentDate = Date.now();
  const millisecondsSinceOrigin = BigInt(currentDate - originDate);

  const channelIdBigInt = BigInt(channelId & 0xFFF); // Mask to 12 bits
  const counterBigInt = BigInt(counter & 0xFFF);     // Mask to 12 bits

  // Shift and combine the values into a single BigInt
  const totalId = (millisecondsSinceOrigin << 24n) | (channelIdBigInt << 12n) | counterBigInt;

  // Convert totalId to a 9-byte array (big-endian)
  const bytes = bigIntToByteArray(totalId, 9);

  // Base64 encode the byte array
  const base64Id = Buffer.from(bytes).toString('base64');

  return base64Id;
}

function bigIntToByteArray(bigIntValue: bigint, byteLength: number): Uint8Array {
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
      const shiftAmount = BigInt((byteLength - 1 - i) * 8);
      bytes[i] = Number((bigIntValue >> shiftAmount) & 0xFFn);
  }
  return bytes;
}
