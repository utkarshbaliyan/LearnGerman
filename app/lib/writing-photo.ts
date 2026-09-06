export const MAX_PHOTO_BYTES = 2_500_000;
export type PhotoReading = {
  id: string; imageHash: string; createdAt: string; status: "pending" | "complete" | "failed";
  text?: string; uncertain?: boolean; confirmedText?: string; confirmedAt?: string;
};

// Validate bytes and dimensions before sending an upload to the vision provider.
export function photoDimensions(bytes: Uint8Array): { mime: "image/jpeg" | "image/png"; width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length >= 24 && [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b) && String.fromCharCode(...bytes.slice(12, 16)) === "IHDR") {
    return { mime: "image/png", width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let position = 2;
  while (position + 3 < bytes.length) {
    if (bytes[position++] !== 0xff) return null;
    while (bytes[position] === 0xff) position++;
    const marker = bytes[position++];
    if (marker === 0xda || marker === 0xd9) return null;
    if (marker === 0x01 || marker >= 0xd0 && marker <= 0xd7) continue;
    if (position + 2 > bytes.length) return null;
    const size = view.getUint16(position);
    if (size < 2 || position + size > bytes.length) return null;
    if ([0xc0, 0xc1, 0xc2].includes(marker) && size >= 8) return { mime: "image/jpeg", height: view.getUint16(position + 3), width: view.getUint16(position + 5) };
    position += size;
  }
  return null;
}

export function photoProblem(bytes: Uint8Array, claimedType: string): string | null {
  if (!bytes.length || bytes.length > MAX_PHOTO_BYTES) return "Choose an image smaller than 2.5 MB after preparation.";
  const dimensions = photoDimensions(bytes);
  if (!dimensions || dimensions.mime !== claimedType) return "This file is not a supported JPEG or PNG image. Choose a different photo.";
  if (!dimensions.width || !dimensions.height || dimensions.width * dimensions.height > 16_000_000 || Math.max(dimensions.width, dimensions.height) > 8000) return "The photo dimensions are too large. Choose a smaller image.";
  return null;
}
