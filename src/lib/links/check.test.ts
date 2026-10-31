import { describe, expect, it } from "vitest";

import { checkUrl, classify, isPublicAddress, type CheckDeps } from "./check";

describe("isPublicAddress", () => {
  it.each(["8.8.8.8", "151.101.1.69", "2606:4700::6810:84e5", "::ffff:8.8.8.8"])("%s est publique", (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });
  it.each([
    "127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0",
    "224.0.0.1", "198.18.0.1", "::1", "::", "fe80::1", "fd00::1", "ff02::1", "::ffff:127.0.0.1", "::ffff:7f00:1",
    "64:ff9b::a00:1", "pas-une-ip",
  ])("%s est refusée", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
});

describe("classify", () => {
  it("404 et 410 : lien cassé, même sur un réseau social", () => {
    expect(classify("www.instagram.com", { kind: "response", status: 404 })).toEqual({ status: "broken", httpStatus: 404 });
    expect(classify("paiement.exemple", { kind: "response", status: 410 }).status).toBe("broken");
  });
  it("réseaux à page de connexion : 200 ne prouve rien", () => {
    for (const host of ["www.instagram.com", "tiktok.com", "m.facebook.com", "x.com", "twitter.com", "www.linkedin.com", "whatsapp.com"]) {
      expect(classify(host, { kind: "response", status: 200 }).status).toBe("unverifiable");
    }
    expect(classify("youtube.com", { kind: "response", status: 200 }).status).toBe("ok");
  });
  it("refus d'accès et limites : non vérifiable ; panne serveur ou réseau : injoignable", () => {
    for (const status of [401, 403, 429, 999]) expect(classify("paiement.exemple", { kind: "response", status }).status).toBe("unverifiable");
    expect(classify("paiement.exemple", { kind: "response", status: 503 }).status).toBe("unreachable");
    expect(classify("paiement.exemple", { kind: "network" })).toEqual({ status: "unreachable", httpStatus: null });
    expect(classify("paiement.exemple", { kind: "blocked" }).status).toBe("unverifiable");
  });
});

function deps(routes: Record<string, { status: number; location?: string }>, addresses: Record<string, string[]> = {}): CheckDeps & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    lookup: async (hostname) => {
      if (addresses[hostname]) return addresses[hostname];
      if (hostname.endsWith(".test")) throw new Error("ENOTFOUND");
      return ["93.184.215.14"];
    },
    fetch: async (input, init) => {
      const url = String(input);
      calls.push(`${init?.method} ${url}`);
      const route = routes[url];
      if (!route) throw new Error("connexion refusée");
      return new Response(null, { status: route.status, headers: route.location ? { location: route.location } : {} });
    },
  };
}

describe("checkUrl", () => {
  it("suit au plus trois redirections, chacune revérifiée", async () => {
    const d = deps({
      "https://pay.exemple/a": { status: 301, location: "/b" },
      "https://pay.exemple/b": { status: 302, location: "https://autre.exemple/c" },
      "https://autre.exemple/c": { status: 200 },
    });
    expect(await checkUrl("https://pay.exemple/a", d)).toEqual({ status: "ok", httpStatus: 200 });

    const loop = deps({ "https://pay.exemple/a": { status: 302, location: "/a" } });
    expect((await checkUrl("https://pay.exemple/a", loop)).status).toBe("unverifiable");
    expect(loop.calls).toHaveLength(4);
  });

  it("refuse http, un port exotique et toute adresse interne, même atteinte par redirection", async () => {
    const d = deps(
      { "https://pay.exemple/a": { status: 302, location: "https://interne.exemple/" } },
      { "interne.exemple": ["10.0.0.5"], "metadata.exemple": ["169.254.169.254"] },
    );
    expect((await checkUrl("http://pay.exemple/a", d)).status).toBe("unverifiable");
    expect((await checkUrl("https://pay.exemple:8443/a", d)).status).toBe("unverifiable");
    expect((await checkUrl("https://metadata.exemple/", d)).status).toBe("unverifiable");
    expect((await checkUrl("https://127.0.0.1/", d)).status).toBe("unverifiable");
    expect((await checkUrl("https://[::1]/", d)).status).toBe("unverifiable");
    expect((await checkUrl("https://pay.exemple/a", d)).status).toBe("unverifiable");
    expect(d.calls).toEqual(["HEAD https://pay.exemple/a"]);
  });

  it("nom introuvable ou serveur muet : injoignable ; HEAD refusé : redemande en GET", async () => {
    const d = deps({ "https://pay.exemple/head": { status: 405 } });
    expect(await checkUrl("https://paiement.exemple.test/marcel", d)).toEqual({ status: "unreachable", httpStatus: null });
    expect((await checkUrl("https://muet.exemple/", d)).status).toBe("unreachable");
    expect((await checkUrl("https://pay.exemple/head", d)).status).toBe("unverifiable");
    expect(d.calls.slice(-2)).toEqual(["HEAD https://pay.exemple/head", "GET https://pay.exemple/head"]);
  });
});
