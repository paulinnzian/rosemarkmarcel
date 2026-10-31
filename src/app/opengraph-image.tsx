import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { seedContent } from "@/content";

// Aperçu affiché quand le lien du site est partagé (WhatsApp, Facebook, X…). Généré une fois au build.
// Satori ne lit ni les variables CSS ni le WebP : couleurs recopiées de tokens.css (--accent, --highlight,
// --on-accent), photo convertie en PNG dans src/assets.
const ACCENT = "#2025b9";
const HIGHLIGHT = "#ff9718";
const ON_ACCENT = "#ffffff";

export const alt = `${seedContent.creatorName}, web humoriste, créateur du concept « Le Repos »`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const photo = await readFile(join(process.cwd(), "src/assets/og-photo.png"), "base64");
  const [first, ...rest] = seedContent.hero.heading.lines;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: ACCENT, color: ON_ACCENT, padding: "0 0 0 72px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, gap: 24 }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: HIGHLIGHT }}>
            {seedContent.creatorName}
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            <span>{first}</span>
            <span style={{ color: HIGHLIGHT }}>{rest.join(" ")}</span>
          </div>
          <div style={{ fontSize: 30 }}>Web humoriste · concept « Le Repos »</div>
        </div>
        <img src={`data:image/png;base64,${photo}`} width={420} height={630} alt="" style={{ alignSelf: "flex-end" }} />
      </div>
    ),
    size,
  );
}
