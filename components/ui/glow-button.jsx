import Link from "next/link";
import RollText from "@/components/ui/roll-text";

const GlowButton = ({ children, href, className = "" }) => (
  <div className={`flex rounded-2xl bg-linear-to-b from-white/50 to-transparent p-[.5px] ${className}`}>
    <Link
      href={href}
      className="group rounded-2xl bg-linear-to-b from-[#E8602E] to-[#A8401A] px-8 py-3 text-center text-xl font-bold text-white outline-hidden transition-all duration-300 hover:shadow-[0_0_40px_5px_rgba(232,96,46,0.5)] focus-visible:shadow-[0_0_40px_5px_rgba(232,96,46,0.5)] sm:px-10 sm:py-4"
    >
      <RollText className="mx-auto">{children} →</RollText>
    </Link>
  </div>
);

export default GlowButton;
