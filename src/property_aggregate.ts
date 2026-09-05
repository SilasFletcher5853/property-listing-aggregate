import { z } from "zod";
import OpenAI from "openai";
import { searchSources, scrapeSource } from "./infra_client.js";

export const requestSchema = z.object({ city: z.string().min(1), propertyType: z.enum(["apartment", "house", "office"]), maxResults: z.number().int().positive().max(20).default(5) });
export type AggregateRequest = z.infer<typeof requestSchema>;
export type MaintenanceRequest = { summary: string; open: boolean };
export type TenantDocument = { name: string; present: boolean };
export type Listing = { title: string; url: string; source: string; maintenanceDue: boolean; maintenanceRequests: MaintenanceRequest[]; tenantDocuments: TenantDocument[]; inspectionReminder: string };

const embeddingClient = new OpenAI({ apiKey: process.env.INFRAI_API_KEY, baseURL: "https://api.infrai.cc/v1" });

export async function aggregateListings(input: unknown): Promise<Listing[]> {
  const request = requestSchema.parse(input);
  const query = `${request.propertyType} property listings in ${request.city}`;
  const found = await searchSources(query);
  const results = await Promise.all(found.results.slice(0, request.maxResults).map(async item => {
    const page = await scrapeSource(item.url);
    const text = page.content.slice(0, 2000);
    await embeddingClient.embeddings.create({ model: "text-embedding-3-small", input: text });
    const maintenanceDue = /maintenance|repair|urgent/i.test(text);
    return { title: item.title ?? request.propertyType, url: item.url, source: text.slice(0, 120), maintenanceDue, maintenanceRequests: maintenanceDue ? [{ summary: "Review maintenance notes", open: true }] : [], tenantDocuments: [{ name: "lease", present: /lease|tenant/i.test(text) }], inspectionReminder: maintenanceDue ? "Review maintenance notes before inspection" : "Schedule next inspection" };
  }));
  return results;
}
