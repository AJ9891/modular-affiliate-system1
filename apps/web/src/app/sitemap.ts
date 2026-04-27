import type { MetadataRoute } from "next"

const baseUrl = "https://www.launchpad4success.pro"

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
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }))
}
