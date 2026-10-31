// Format, dimensions et transparence d'une image, lus dans ses premiers octets (pas de dépendance native).
// Le type annoncé par le navigateur n'est pas fiable : c'est ce résultat qui décide du format enregistré.

export type ImageInfo = { format: "png" | "webp" | "jpeg"; width: number; height: number; hasAlpha: boolean };

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

export function imageInfo(bytes: Uint8Array): ImageInfo | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length >= 33 && PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) return pngInfo(bytes, view);
  if (bytes.length >= 30 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return webpInfo(bytes, view);
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) return jpegInfo(bytes, view);
  return null;
}

function pngInfo(bytes: Uint8Array, view: DataView): ImageInfo | null {
  if (ascii(bytes, 12, 4) !== "IHDR") return null;
  const colorType = bytes[25];
  // Types 4 et 6 : couche alpha ; sinon un bloc tRNS avant les données d'image rend une couleur transparente.
  let hasAlpha = colorType === 4 || colorType === 6;
  for (let offset = 33; !hasAlpha && offset + 8 <= bytes.length; ) {
    const length = view.getUint32(offset);
    const type = ascii(bytes, offset + 4, 4);
    if (type === "tRNS") hasAlpha = true;
    if (type === "IDAT" || type === "IEND") break;
    offset += 12 + length;
  }
  return { format: "png", width: view.getUint32(16), height: view.getUint32(20), hasAlpha };
}

function webpInfo(bytes: Uint8Array, view: DataView): ImageInfo | null {
  const chunk = ascii(bytes, 12, 4);
  if (chunk === "VP8X") {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { format: "webp", width, height, hasAlpha: (bytes[20] & 0x10) !== 0 };
  }
  if (chunk === "VP8L") {
    if (bytes[20] !== 0x2f) return null;
    const bits = view.getUint32(21, true);
    return { format: "webp", width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff), hasAlpha: ((bits >> 28) & 1) === 1 };
  }
  if (chunk === "VP8 ") {
    return { format: "webp", width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff, hasAlpha: false };
  }
  return null;
}

function jpegInfo(bytes: Uint8Array, view: DataView): ImageInfo | null {
  let offset = 2;
  while (offset + 9 <= bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    // SOF0 à SOF15, sauf DHT (C4), JPG (C8) et DAC (CC) : l'en-tête qui porte les dimensions.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { format: "jpeg", width: view.getUint16(offset + 7), height: view.getUint16(offset + 5), hasAlpha: false };
    }
    offset += 2 + view.getUint16(offset + 2);
  }
  return null;
}
