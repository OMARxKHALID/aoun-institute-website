const MB = 1024 * 1024;

export const UPLOAD_RULES = {
  avatar: { preset: "aoun_avatar", folder: "aoun/avatars", resourceType: "image", formats: ["jpg", "png", "webp"], maxBytes: 2 * MB, transformation: "c_limit,w_512,h_512,q_auto,f_auto", admin: false },
  brand: { preset: "aoun_brand", folder: "aoun/brand", resourceType: "image", formats: ["jpg", "png", "webp", "svg"], maxBytes: 2 * MB, admin: true },
  thumbnail: { preset: "aoun_thumbnail", folder: "aoun/thumbnails", resourceType: "image", formats: ["jpg", "png", "webp"], maxBytes: 4 * MB, transformation: "c_limit,w_1600,q_auto,f_auto", admin: true },
  document: { preset: "aoun_document", folder: "aoun/documents", resourceType: "image", formats: ["pdf"], maxBytes: 10 * MB, admin: true },
  receipt: { preset: "aoun_receipt", folder: "aoun/receipts", resourceType: "image", formats: ["jpg", "png", "webp", "pdf"], maxBytes: 5 * MB, type: "authenticated", admin: false },
};
