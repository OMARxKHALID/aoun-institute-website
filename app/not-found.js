import HeroBackground from "@/components/ui/hero-background";
import GlowButton from "@/components/ui/glow-button";

export const metadata = { title: "Page Not Found" };

const NotFound = () => (
  <main className="relative isolate flex min-h-screen flex-col items-center justify-center gap-6 px-8 text-center">
    <HeroBackground className="h-full" />
    <p className="font-machina text-[8rem] leading-none text-accent md:text-[12rem]">404</p>
    <h1 className="font-machina text-4xl md:text-5xl">This page took a wrong turn</h1>
    <p className="text-xl font-normal text-white/70">The page you are looking for does not exist or has moved.</p>
    <GlowButton href="/" className="mt-4">Back Home</GlowButton>
  </main>
);

export default NotFound;
