export const menuPanel = "fixed m-0 rounded-xl border border-[#302C2A] bg-[#0C0C0C] p-1.5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.6)] outline-hidden";

export const menuItem = "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/[0.06] disabled:pointer-events-none disabled:opacity-30";

export const railLabel = (collapsed) => `ml-3 max-w-56 overflow-hidden whitespace-nowrap opacity-100 transition-[max-width,opacity,margin] duration-300 ease-out ${collapsed ? "lg:ml-0 lg:max-w-0 lg:opacity-0" : ""}`;

export const inputClass = "w-full rounded-xl border border-[#302C2A] bg-[#070707] px-4 py-3 text-base text-white outline-hidden transition-colors placeholder:text-white/30 focus:border-accent disabled:opacity-60 aria-invalid:border-red-500/70";

export const labelClass = "text-base font-medium text-white/70 [[data-panel]_&]:text-sm";

const searchBase = "w-full rounded-full border border-[#302C2A] bg-[#070707] text-white outline-hidden transition-colors placeholder:text-white/30 focus:border-accent";

export const searchClass = `${searchBase} py-2.5 pl-11 pr-4 text-base`;

export const searchLgClass = `${searchBase} py-3.5 pl-13 pr-5 text-lg`;

const btnCommon = "inline-flex items-center justify-center gap-2 font-semibold outline-hidden transition disabled:cursor-not-allowed disabled:opacity-60";

const btnSize = { sm: "rounded-full px-3.5 py-1.5 text-base [[data-panel]_&]:text-sm", md: "rounded-full px-5 py-2.5 text-base [[data-panel]_&]:text-sm", lg: "rounded-full px-6 py-3 text-base" };

const btnColor = {
  primary: "bg-linear-to-b from-[#E8602E] to-[#A8401A] text-white hover:shadow-[0_0_24px_rgba(232,96,46,0.45)] focus-visible:shadow-[0_0_24px_rgba(232,96,46,0.45)]",
  secondary: "bg-white text-black hover:bg-accent hover:text-white",
  outline: "border border-[#302C2A] text-white hover:border-accent hover:text-accent",
  ghost: "text-white/70 hover:bg-white/5 hover:text-white",
  danger: "border border-red-500/40 text-red-400 hover:bg-red-500/10",
};

export const buttonClass = (variant = "primary", size = "md") => `${btnCommon} ${btnSize[size]} ${btnColor[variant]}`;

export const btn = Object.fromEntries(Object.keys(btnColor).map((v) => [v, buttonClass(v)]));
