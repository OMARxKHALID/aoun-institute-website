import { z } from "zod";

const text = (max = 200) => z.string().trim().max(max);
const optionalUrl = z.union([z.url({ error: "Enter a valid URL" }), z.literal("")]);
const asset = z.object({ url: z.url(), publicId: z.string().min(1) }).nullable();

export const siteSettingsSchema = z.strictObject({
  brand: z.strictObject({ name: text(80).min(1, { error: "Brand name is required" }), shortName: text(30), tagline: text(160), logo: asset }),
  contact: z.strictObject({ email: z.union([z.email({ error: "Enter a valid email" }), z.literal("")]), phone: text(40), address: text(200), hours: text(80) }),
  socials: z.array(z.strictObject({ label: text(30).min(1), url: optionalUrl })).max(10),
  hero: z.strictObject({ eyebrow: text(80), title: text(160), highlight: text(40), titleEnd: text(120), subtitle: text(300) }),
  footer: z.strictObject({ text: text(300) }),
  seo: z.strictObject({ title: text(70), description: text(160), ogImage: asset }),
  home: z.strictObject({
    stats: z.array(z.strictObject({ value: text(20).min(1), label: text(60).min(1), text: text(160) })).max(2),
    partners: z.array(z.strictObject({ name: text(60).min(1), logo: asset.optional() })).max(16),
    impactCards: z.array(z.strictObject({ title: text(60).min(1), text: text(200), tag: text(30), image: asset.optional() })).max(8),
    testimonials: z
      .array(z.strictObject({ name: text(60).min(1), role: text(60), rating: z.string().regex(/^[1-5](\.\d)?$/, { error: "Rating 1-5" }), quote: text(400).min(1), photo: asset.optional() }))
      .max(20),
    communityTiles: z.array(z.strictObject({ title: text(60).min(1), text: text(160), image: asset.optional() })).max(8),
    faqs: z.array(z.strictObject({ q: text(200).min(1), a: text(1000).min(1) })).max(30),
  }),
  payment: z.strictObject({
    currency: z.literal("PKR"),
    bank: z.strictObject({ bankName: text(80), accountTitle: text(80), accountNumber: text(40), iban: text(40) }),
    wallets: z.array(z.strictObject({ name: text(40).min(1), accountTitle: text(80), number: text(40) })).max(5),
    instructions: text(500),
  }),
});
