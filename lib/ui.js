export const menuPanel = "fixed m-0 rounded-xl border border-[#302C2A] bg-[#0C0C0C] p-1.5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.6)] outline-hidden";

export const menuItem = "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/[0.06] disabled:pointer-events-none disabled:opacity-30";

export const railLabel = (collapsed) => `ml-3 max-w-56 overflow-hidden whitespace-nowrap opacity-100 transition-[max-width,opacity,margin] duration-300 ease-out ${collapsed ? "lg:ml-0 lg:max-w-0 lg:opacity-0" : ""}`;
