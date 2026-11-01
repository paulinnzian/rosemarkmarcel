import { describe, expect, it } from "vitest";

import { countryOf, publicHost, publicUrl, sameOrigin } from "./request-host";

const headers = (values: Record<string, string>) => new Headers(values);

describe("publicHost", () => {
  it("préfère l'hôte transmis par le proxy", () => {
    expect(publicHost(headers({ host: "127.0.0.1:3000", "x-forwarded-host": "rosemark.exemple, proxy.interne" }))).toBe("rosemark.exemple");
    expect(publicHost(headers({ host: "rosemark.exemple" }))).toBe("rosemark.exemple");
  });
});

describe("publicUrl", () => {
  it("construit l'adresse sur l'hôte et le protocole publics", () => {
    const h = headers({ host: "127.0.0.1:3000", "x-forwarded-host": "rosemark.exemple", "x-forwarded-proto": "https" });
    expect(publicUrl("/admin/connexion", h, "http://127.0.0.1:3000/admin").href).toBe("https://rosemark.exemple/admin/connexion");
  });
  it("retombe sur l'adresse reçue sans protocole transmis ou avec un hôte invalide", () => {
    expect(publicUrl("/admin", headers({ host: "localhost:3100" }), "http://localhost:3100/x").href).toBe("http://localhost:3100/admin");
    const bad = headers({ "x-forwarded-host": "a b", "x-forwarded-proto": "https" });
    expect(publicUrl("/admin", bad, "http://localhost:3100/x").href).toBe("http://localhost:3100/admin");
  });
});

describe("sameOrigin", () => {
  it("accepte l'hôte public, même derrière le proxy", () => {
    expect(sameOrigin(headers({ host: "rosemark.exemple", origin: "https://rosemark.exemple" }))).toBe(true);
    expect(sameOrigin(headers({ host: "127.0.0.1:3000", "x-forwarded-host": "rosemark.exemple", origin: "https://rosemark.exemple" }))).toBe(true);
    expect(sameOrigin(headers({ host: "rosemark.exemple" }))).toBe(true);
  });
  it("refuse une autre origine, « null » ou une valeur invalide", () => {
    expect(sameOrigin(headers({ host: "rosemark.exemple", origin: "https://ailleurs.exemple" }))).toBe(false);
    expect(sameOrigin(headers({ host: "rosemark.exemple", origin: "null" }))).toBe(false);
  });
});

describe("countryOf", () => {
  it("lit le pays posé par le réseau devant le serveur, sinon rien", () => {
    expect(countryOf(headers({ "cf-ipcountry": "ci" }))).toBe("CI");
    expect(countryOf(headers({ "cloudfront-viewer-country": "SN" }))).toBe("SN");
    expect(countryOf(headers({ "x-vercel-ip-country": "FR" }))).toBe("FR");
    expect(countryOf(headers({ "cf-ipcountry": "XX" }))).toBeNull();
    expect(countryOf(headers({ "cf-ipcountry": "T1" }))).toBeNull();
    expect(countryOf(headers({}))).toBeNull();
  });
});
