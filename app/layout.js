import { Manrope, Space_Grotesk } from "next/font/google";
import Providers from "@/app/providers";
import { getSiteSettings } from "@/features/site-settings/queries";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope-src", subsets: ["latin"] });
const display = Space_Grotesk({ variable: "--font-display-src", subsets: ["latin"], weight: ["300", "400", "500", "700"] });

export const generateMetadata = async () => {
  const { brand, seo } = await getSiteSettings();
  return {
    title: { default: seo.title || brand.name, template: `%s | ${brand.name}` },
    description: seo.description,
    openGraph: seo.ogImage?.url ? { images: [seo.ogImage.url] } : undefined,
  };
};

const RootLayout = ({ children }) => (
  <html lang="en" className={`${manrope.variable} ${display.variable} text-[clamp(12px,0.85vw,25px)] scheme-dark antialiased`}>
    <body className="min-h-screen overflow-x-hidden bg-black font-manrope text-white">
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
