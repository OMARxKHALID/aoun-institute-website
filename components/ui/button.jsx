import { LoaderCircle } from "lucide-react";

const variants = {
  primary: "bg-linear-to-b from-[#E8602E] to-[#A8401A] text-white hover:shadow-[0_0_40px_5px_rgba(232,96,46,0.5)] focus-visible:shadow-[0_0_40px_5px_rgba(232,96,46,0.5)]",
  outline: "border border-white/25 text-white hover:border-accent hover:text-accent",
  ghost: "text-white/70 hover:bg-white/5 hover:text-white",
  danger: "border border-red-500/40 text-red-300 hover:bg-red-500/10",
};

const Button = ({ children, loading, variant = "primary", className = "", disabled, ...props }) => (
  <button
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-lg font-semibold outline-hidden transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    {...props}
  >
    {loading && <LoaderCircle className="size-5 animate-spin" />}
    {children}
  </button>
);

export default Button;
