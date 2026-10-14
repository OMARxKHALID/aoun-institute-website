export const menuPanel = "fixed m-0 rounded-xl border border-[#302C2A] bg-[#0C0C0C] p-1.5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.6)] outline-hidden";

export const menuItem = "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/[0.06] disabled:pointer-events-none disabled:opacity-30";

export const railLabel = (collapsed) => `ml-3 max-w-56 overflow-hidden whitespace-nowrap opacity-100 transition-[max-width,opacity,margin] duration-300 ease-out ${collapsed ? "lg:ml-0 lg:max-w-0 lg:opacity-0" : ""}`;

const btnCommon = "inline-flex items-center justify-center gap-2 font-semibold outline-hidden transition disabled:cursor-not-allowed disabled:opacity-60";

export const btnSize = { md: "rounded-full px-5 py-2.5 text-sm", lg: "rounded-2xl px-6 py-3 text-lg" };

export const btnColor = {
  primary: "bg-linear-to-b from-[#E8602E] to-[#A8401A] text-white hover:shadow-[0_0_24px_rgba(232,96,46,0.45)] focus-visible:shadow-[0_0_24px_rgba(232,96,46,0.45)]",
  secondary: "bg-white text-black hover:bg-accent hover:text-white",
  outline: "border border-[#302C2A] text-white hover:border-accent hover:text-accent",
  ghost: "text-white/70 hover:bg-white/5 hover:text-white",
  danger: "border border-red-500/40 text-red-300 hover:bg-red-500/10",
};

export const buttonClass = (variant = "primary", size = "md") => `${btnCommon} ${btnSize[size]} ${btnColor[variant]}`;

export const btn = Object.fromEntries(Object.keys(btnColor).map((v) => [v, buttonClass(v)]));
