import { crc32, deflateSync } from "node:zlib";

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** PNG uni généré pour les tests d'envoi de photo (RGBA = avec transparence, RGB = sans). */
export function solidPng(width: number, height: number, { alpha }: { alpha: boolean }): Buffer {
  const channels = alpha ? 4 : 3;
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // 8 bits par canal
  header[9] = alpha ? 6 : 2; // RGBA ou RGB
  const row = Buffer.alloc(1 + width * channels);
  for (let x = 0; x < width; x += 1) {
    row.set(alpha ? [242, 120, 40, x % 2 === 0 ? 255 : 0] : [242, 120, 40], 1 + x * channels);
  }
  const pixels = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
