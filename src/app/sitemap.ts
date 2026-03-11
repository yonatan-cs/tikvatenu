import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tikvatenu.com";
  const supabase = await createClient();

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/magazine`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/join`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    // English versions
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/en/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/en/events`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/en/magazine`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/en/join`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  // Fetch published events
  const { data: events } = await supabase
    .from("events")
    .select("slug, updated_at")
    .eq("is_published", true);

  const eventPages = (events || []).flatMap((event) => [
    {
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/events/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ]);

  // Fetch published articles
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, updated_at")
    .eq("is_published", true);

  const articlePages = (articles || []).flatMap((article) => [
    {
      url: `${baseUrl}/magazine/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/magazine/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]);

  return [...staticPages, ...eventPages, ...articlePages];
}
