import { z } from "zod";

export const LEVELS = ["Beginner", "Intermediate", "Advanced", "All levels"];

const text = (max) => z.string().trim().max(max);
const asset = z.object({ url: z.url(), publicId: z.string().min(1), name: z.string().max(200).optional() }).nullish();
const textList = (max, itemMax) =>
  z
    .array(z.object({ text: text(itemMax).min(1, { error: "Cannot be empty" }) }))
    .max(max)
    .transform((rows) => rows.map((row) => row.text));

export const courseDetailsSchema = z
  .strictObject({
    title: text(120).min(3, { error: "At least 3 characters" }),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, { error: "At least 3 characters" })
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: "Lowercase letters, numbers and dashes only" }),
    subtitle: text(200),
    description: text(5000),
    category: text(40),
    level: z.enum(LEVELS),
    price: z.number({ error: "Enter a price" }).min(0).max(10_000_000),
    discountPrice: z.number().min(0).max(10_000_000).nullish(),
    status: z.enum(["draft", "published"]),
    thumbnail: asset,
  })
  .refine((v) => v.discountPrice == null || v.discountPrice < v.price, { error: "Discount must be lower than the price", path: ["discountPrice"] });

export const syllabusSchema = z.strictObject({
  outcomes: textList(20, 200),
  prerequisites: textList(20, 200),
  sequentialUnlock: z.boolean(),
  certificateRule: z.strictObject({
    type: z.enum(["all", "percent"]),
    percent: z.number().int().min(1).max(100),
    requireQuizzes: z.boolean(),
  }),
  syllabusFile: asset,
  attachments: z.array(asset.unwrap().unwrap()).max(10),
});

export const titleSchema = z.strictObject({ title: text(120).min(2, { error: "At least 2 characters" }) });

export const lessonSchema = z.strictObject({
  title: text(120).min(2, { error: "At least 2 characters" }),
  description: text(5000),
  isFreePreview: z.boolean(),
  status: z.enum(["draft", "published"]),
  durationSec: z.number().int().min(0).max(36000),
  attachments: z.array(asset.unwrap().unwrap()).max(10),
});

export const lessonFormSchema = lessonSchema.omit({ durationSec: true }).extend({ durationMin: z.number({ error: "Enter minutes" }).min(0).max(600) });

const objectId = z.string().regex(/^[a-f\d]{24}$/i, { error: "Invalid id" });

export const outlineOrderSchema = z
  .array(z.strictObject({ id: objectId, lessonIds: z.array(objectId).max(500) }))
  .max(100);

export const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 80);
