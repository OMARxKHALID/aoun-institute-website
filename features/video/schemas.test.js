import { expect, test } from "bun:test";
import { toEmbedUrl, videoLinkSchema } from "@/features/video/schemas";

test("turns YouTube and Vimeo links into embed URLs", () => {
  expect(toEmbedUrl("https://www.youtube.com/watch?v=W6NZfCO5SIk&t=10")).toBe("https://www.youtube-nocookie.com/embed/W6NZfCO5SIk");
  expect(toEmbedUrl("https://youtu.be/W6NZfCO5SIk?si=x")).toBe("https://www.youtube-nocookie.com/embed/W6NZfCO5SIk");
  expect(toEmbedUrl("https://vimeo.com/76979871")).toBe("https://player.vimeo.com/video/76979871");
  expect(toEmbedUrl("https://example.com/video")).toBeNull();
});

test("embed links must be YouTube or Vimeo, and all links https", () => {
  expect(videoLinkSchema.safeParse({ provider: "embed", src: "https://example.com/x" }).success).toBe(false);
  expect(videoLinkSchema.safeParse({ provider: "url", src: "http://example.com/a.m3u8" }).success).toBe(false);
  expect(videoLinkSchema.safeParse({ provider: "url", src: "https://example.com/a.m3u8" }).success).toBe(true);
});
