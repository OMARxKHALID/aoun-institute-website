import HeroBackground from "@/components/ui/hero-background";
import SectionTag from "@/components/ui/section-tag";

const AuthShell = ({ tag, title, text, children }) => (
  <main className="relative isolate flex min-h-screen items-center justify-center px-6 pb-20 pt-40">
    <HeroBackground className="h-full" />
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
      <SectionTag>{tag}</SectionTag>
      <h1 className="font-machina text-[2.5rem] leading-tight md:text-[3.5rem]">{title}</h1>
      <p className="text-xl font-light text-white/60">{text}</p>
      <div className="w-full">{children}</div>
    </div>
  </main>
);

export default AuthShell;
