import { z } from "zod";

const youtubeId = (url) => {
  if (url.hostname === "youtu.be") return url.pathname.slice(1);
  if (url.searchParams.get("v")) return url.searchParams.get("v");
  return url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];
};

export const toEmbedUrl = (value) => {
  const url = URL.parse(value);
  if (!url) return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");
  if (["youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host)) {
    const id = youtubeId(url);
    return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.match(/(\d{5,})/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
};

export const videoLinkSchema = z
  .strictObject({
    provider: z.enum(["embed", "url"]),
    src: z.url({ protocol: /^https$/, error: "Enter a full https:// link" }).max(1000),
  })
  .transform((v, ctx) => {
    if (v.provider === "url") return v;
    const src = toEmbedUrl(v.src);
    if (!src) {
      ctx.addIssue({ code: "custom", path: ["src"], message: "Use a YouTube or Vimeo link" });
      return z.NEVER;
    }
    return { ...v, src };
  });

export const deviceIdSchema = z.uuid();
