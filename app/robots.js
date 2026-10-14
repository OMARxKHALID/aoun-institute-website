import { absoluteUrl } from "@/lib/site";

const robots = () => ({
  rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/api", "/checkout", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"] },
  sitemap: absoluteUrl("/sitemap.xml"),
});

export default robots;
