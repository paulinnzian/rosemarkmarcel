import { describe, expect, it } from "vitest";

import { solidPng } from "../../../e2e/support/png";

import { imageInfo } from "./image-info";

function webp(chunk: string, payload: number[]): Uint8Array {
  const bytes = new Uint8Array(40);
  bytes.set([..."RIFF"].map((c) => c.charCodeAt(0)), 0);
  bytes.set([..."WEBP"].map((c) => c.charCodeAt(0)), 8);
  bytes.set([...chunk].map((c) => c.charCodeAt(0)), 12);
  bytes.set(payload, 20);
  return bytes;
}

describe("imageInfo", () => {
  it("PNG RGBA : dimensions et transparence", () => {
    expect(imageInfo(solidPng(500, 700, { alpha: true }))).toEqual({ format: "png", width: 500, height: 700, hasAlpha: true });
  });

  it("PNG RGB sans bloc tRNS : pas de transparence", () => {
    expect(imageInfo(solidPng(640, 480, { alpha: false }))).toEqual({ format: "png", width: 640, height: 480, hasAlpha: false });
  });

  it("PNG RGB avec bloc tRNS : transparent", () => {
    const png = solidPng(10, 10, { alpha: false });
    // tRNS (longueur 6) inséré juste après IHDR (octet 33).
    const trns = Buffer.from([0, 0, 0, 6, ...Buffer.from("tRNS"), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const withTrns = Buffer.concat([png.subarray(0, 33), trns, png.subarray(33)]);
    expect(imageInfo(withTrns)?.hasAlpha).toBe(true);
  });

  it("JPEG : dimensions lues dans l'en-tête SOF0, après un segment APP0", () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x05, 0xdf, 0x04, 0x00, 0x03]);
    expect(imageInfo(jpeg)).toEqual({ format: "jpeg", width: 1024, height: 1503, hasAlpha: false });
  });

  it("WebP étendu (VP8X) avec drapeau alpha", () => {
    // largeur-1 = 1023, hauteur-1 = 1534, sur 24 bits petit-boutiste, à partir de l'octet 24.
    const bytes = webp("VP8X", [0x10, 0, 0, 0, 0xff, 0x03, 0x00, 0xfe, 0x05, 0x00]);
    expect(imageInfo(bytes)).toEqual({ format: "webp", width: 1024, height: 1535, hasAlpha: true });
  });

  it("WebP sans perte (VP8L)", () => {
    const width = 800 - 1;
    const height = 600 - 1;
    const bits = width | (height << 14) | (1 << 28);
    const bytes = webp("VP8L", [0, 0, 0, 0, 0, 0, 0, 0]);
    bytes[20] = 0x2f;
    new DataView(bytes.buffer).setUint32(21, bits, true);
    expect(imageInfo(bytes)).toEqual({ format: "webp", width: 800, height: 600, hasAlpha: true });
  });

  it("fichier qui n'est pas une image : null", () => {
    expect(imageInfo(new TextEncoder().encode("ceci n’est pas une image, même avec .png"))).toBeNull();
  });
});
