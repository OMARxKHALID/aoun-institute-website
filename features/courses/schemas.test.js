import { expect, test } from "bun:test";
import { courseDetailsSchema, slugify } from "@/features/courses/schemas";

test("slugify makes URL-safe slugs", () => {
  expect(slugify("Full-Stack Web Development with Next.js!")).toBe("full-stack-web-development-with-nextjs");
  expect(slugify("  Café   Basics  ")).toBe("cafe-basics");
});

test("discount must be lower than price", () => {
  const course = { title: "Test course", slug: "test-course", subtitle: "", description: "", category: "Dev", level: "Beginner", price: 5000, status: "draft", thumbnail: null };
  expect(courseDetailsSchema.safeParse({ ...course, discountPrice: 6000 }).success).toBe(false);
  expect(courseDetailsSchema.safeParse({ ...course, discountPrice: 3000 }).success).toBe(true);
});
