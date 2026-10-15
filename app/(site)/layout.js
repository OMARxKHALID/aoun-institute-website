import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import SmoothScroll from "@/components/motion/smooth-scroll";
import { getSiteSettings } from "@/features/site-settings/queries";

const SiteLayout = async ({ children }) => {
  const settings = await getSiteSettings();
  return (
    <>
      <SmoothScroll />
      <Navbar brand={settings.brand} />
      {children}
      <Footer settings={settings} />
    </>
  );
};

export default SiteLayout;
