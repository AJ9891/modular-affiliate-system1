import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/dashboard/"],
    },
    sitemap: "https://www.launchpad4success.pro/sitemap.xml",
    host: "https://www.launchpad4success.pro",
  }
}
