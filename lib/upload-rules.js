const MB = 1024 * 1024;

export const MAX_SOURCE_IMAGE = 25 * MB;

export const UPLOAD_RULES = {
  avatar: { preset: "aoun_avatar", folder: "aoun/avatars", resourceType: "image", formats: ["jpg", "png", "webp"], maxBytes: 4 * MB, maxDimension: 1024, transformation: "c_limit,w_512,h_512,q_auto,f_auto", admin: false },
  brand: { preset: "aoun_brand", folder: "aoun/brand", resourceType: "image", formats: ["jpg", "png", "webp", "svg"], maxBytes: 4 * MB, maxDimension: 1600, admin: true, owner: true },
  thumbnail: { preset: "aoun_thumbnail", folder: "aoun/thumbnails", resourceType: "image", formats: ["jpg", "png", "webp"], maxBytes: 8 * MB, maxDimension: 2400, transformation: "c_limit,w_1600,q_auto,f_auto", admin: true },
  document: { preset: "aoun_document", folder: "aoun/documents", resourceType: "image", formats: ["pdf"], maxBytes: 10 * MB, type: "authenticated", admin: true },
  submission: { preset: "aoun_submission", folder: "aoun/submissions", resourceType: "image", formats: ["pdf", "jpg", "png", "webp"], maxBytes: 10 * MB, maxDimension: 2400, type: "authenticated", admin: false },
  receipt: { preset: "aoun_receipt", folder: "aoun/receipts", resourceType: "image", formats: ["jpg", "png", "webp", "pdf"], maxBytes: 8 * MB, maxDimension: 2400, type: "authenticated", admin: false },
};

export const fileHref = (file) => (file?.publicId ? `/api/files?id=${encodeURIComponent(file.publicId)}` : file?.url);

export const imageUrl = (url, width) => (url?.includes("res.cloudinary.com/") && url.includes("/image/upload/") ? url.replace("/image/upload/", `/image/upload/c_limit,w_${width},f_auto,q_auto/`) : url);
