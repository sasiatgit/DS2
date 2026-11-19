import type { MetadataRoute } from "next";
import { business } from "@/lib/config";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacy"].map((path) => ({
    url: new URL(path, business.url).href,
    changeFrequency: "monthly",
    priority: path ? 0.3 : 1,
  }));
}
