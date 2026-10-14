import { getCatalog } from "@/features/courses/queries";
import { absoluteUrl } from "@/lib/site";

const PAGES = [
  ["/", 1, "weekly"],
  ["/courses", 0.9, "weekly"],
  ["/about", 0.6, "monthly"],
  ["/contact", 0.6, "monthly"],
  ["/faq", 0.5, "monthly"],
  ["/verify", 0.4, "yearly"],
  ["/pricing-and-refund", 0.3, "yearly"],
  ["/privacy-policy", 0.2, "yearly"],
  ["/terms-and-conditions", 0.2, "yearly"],
];

const sitemap = async () => {
  const courses = await getCatalog();
  return [
    ...PAGES.map(([path, priority, changeFrequency]) => ({ url: absoluteUrl(path), changeFrequency, priority })),
    ...courses.map((c) => ({ url: absoluteUrl(`/courses/${c.slug}`), lastModified: c.updatedAt ?? c.createdAt, changeFrequency: "weekly", priority: 0.8 })),
  ];
};

export default sitemap;
