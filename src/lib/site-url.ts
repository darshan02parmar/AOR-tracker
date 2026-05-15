/**
 * Canonical site origin for absolute URLs (sitemap, metadata, OG).
 * Set `NEXT_PUBLIC_SITE_URL` in deploy (e.g. `https://track.getnorthpath.com`).
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "https://track.getnorthpath.com";
}
