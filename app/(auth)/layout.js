import Navbar from "@/components/sections/navbar";
import { getSiteSettings } from "@/features/site-settings/queries";

export const metadata = { robots: { index: false, follow: false } };

const AuthLayout = async ({ children }) => {
  const { brand } = await getSiteSettings();
  return (
    <>
      <Navbar brand={brand} />
      {children}
    </>
  );
};

export default AuthLayout;
