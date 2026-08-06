import type { MetadataRoute } from "next"

const baseUrl = "https://launchpad4success.pro"
const configuredLastModified = process.env.SITEMAP_LAST_MODIFIED
const parsedLastModified = configuredLastModified
  ? Date.parse(configuredLastModified)
  : Number.NaN
const lastModified = Number.isNaN(parsedLastModified)
  ? undefined
  : new Date(parsedLastModified)

const publicRoutes = [
  "",
  "/about",
  "/features",
  "/get-started",
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }))
}
