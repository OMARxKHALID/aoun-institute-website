import Navbar from "@/components/sections/navbar";
import { getSiteSettings } from "@/features/site-settings/queries";

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
