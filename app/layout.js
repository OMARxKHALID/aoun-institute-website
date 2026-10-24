import { Manrope, Space_Grotesk } from "next/font/google";
import Providers from "@/app/providers";
import TouchShow from "@/components/motion/touch-show";
import { getSiteSettings } from "@/features/site-settings/queries";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope-src", subsets: ["latin"] });
const display = Space_Grotesk({ variable: "--font-display-src", subsets: ["latin"], weight: ["300", "400", "500", "700"] });

export const generateMetadata = async () => {
  const { brand, seo } = await getSiteSettings();
  const title = seo.title || brand.name;
  const images = seo.ogImage?.url ? [seo.ogImage.url] : undefined;
  return {
    metadataBase: SITE_URL,
    title: { default: title, template: `%s | ${brand.name}` },
    description: seo.description,
    applicationName: brand.name,
    openGraph: { type: "website", siteName: brand.name, locale: "en_PK", title, description: seo.description, url: "/", images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description: seo.description, images },
    robots: { index: true, follow: true },
  };
};

const RootLayout = ({ children }) => (
  <html lang="en" className={`${manrope.variable} ${display.variable} text-[clamp(12px,0.85vw,25px)] has-[[data-panel]]:text-[16px] lg:has-[[data-panel]]:text-[clamp(14px,0.85vw,16px)] scheme-dark antialiased [scrollbar-color:#3d3633_#000] [scrollbar-width:thin]`}>
    <body className="min-h-screen overflow-x-hidden bg-black font-manrope text-white">
      <Providers>{children}</Providers>
      <TouchShow />
    </body>
  </html>
);

export default RootLayout;
