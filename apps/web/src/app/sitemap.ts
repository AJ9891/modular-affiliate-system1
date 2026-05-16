import type { MetadataRoute } from "next"

const baseUrl = "https://www.launchpad4success.pro"
const lastModified = new Date(process.env.SITEMAP_LAST_MODIFIED ?? "2025-01-01T00:00:00.000Z")

const publicRoutes = [
  "",
  "/about",
  "/features",
  "/pricing",
  "/get-started",
  "/launchpad",
  "/ai-generator",
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }))
}
