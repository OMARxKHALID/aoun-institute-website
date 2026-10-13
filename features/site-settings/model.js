import { Schema, model, models } from "mongoose";

const asset = { url: String, publicId: String };

const siteSettingsSchema = new Schema(
  {
    _id: { type: String, default: "site" },
    brand: { name: String, shortName: String, tagline: String, logo: asset },
    contact: { email: String, phone: String, address: String, hours: String },
    socials: [{ label: String, url: String }],
    hero: { eyebrow: String, title: String, highlight: String, titleEnd: String, subtitle: String },
    footer: { text: String },
    seo: { title: String, description: String, ogImage: asset },
    home: {
      stats: [{ value: String, label: String, text: String }],
      partners: [{ name: String, logo: asset }],
      impactCards: [{ title: String, text: String, tag: String, image: asset }],
      testimonials: [{ name: String, role: String, rating: String, quote: String, photo: asset }],
      communityTiles: [{ title: String, text: String, image: asset }],
      faqs: [{ q: String, a: String }],
    },
    payment: {
      currency: { type: String, default: "PKR" },
      bank: { bankName: String, accountTitle: String, accountNumber: String, iban: String },
      wallets: [{ name: String, accountTitle: String, number: String }],
      instructions: String,
    },
  },
  { collection: "siteSettings", timestamps: true },
);

export default models.SiteSettings || model("SiteSettings", siteSettingsSchema);
