import type { NextConfig } from "next";

// Photos envoyées depuis l'admin : servies par le bucket public-media de Supabase.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const mediaPattern = supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/public-media/**`)] : [];
// En local, Supabase répond sur 127.0.0.1 : next/image refuse les IP locales sauf autorisation explicite.
const localSupabase = supabaseUrl ? /^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(supabaseUrl) : false;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    remotePatterns: mediaPattern,
    dangerouslyAllowLocalIP: localSupabase,
  },
  experimental: {
    // Photo du héros : 5 Mo au plus (limite du bucket), plus l'enveloppe multipart.
    serverActions: { bodySizeLimit: "6mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
