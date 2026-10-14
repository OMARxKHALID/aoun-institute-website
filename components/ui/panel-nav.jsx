"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, House, ChevronLeft, Menu, X } from "lucide-react";
import SignOutButton from "@/features/auth/components/sign-out-button";
import { railLabel } from "@/lib/ui";
import { navs } from "@/lib/nav";

const STORAGE_KEY = "panel-sidebar-collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const writeCollapsed = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {}
};

const NavList = ({ groups, activeHref, collapsed }) => {
  const root = groups[0].items[0].href;
  const isActive = (href) => activeHref != null && (href === root ? activeHref === root : activeHref === href || activeHref.startsWith(`${href}/`));
  return (
    <nav className="flex w-full flex-col gap-3 short:gap-1.5">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <p className={`relative h-5 whitespace-nowrap px-[17px] text-[10px] short:h-3 short:text-transparent font-medium uppercase tracking-[0.14em] text-white/35 transition-opacity duration-300 ${collapsed ? "lg:text-transparent" : ""}`}>
            {group.label}
            <span aria-hidden="true" className={`absolute inset-x-4 top-1/2 hidden h-px bg-white/10 short:block ${collapsed ? "lg:block" : ""}`} />
          </p>
          {group.items.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`flex items-center rounded-full px-[17px] py-2 text-[15px] transition-colors short:py-1.5 tiny:py-1 tiny:text-sm ${
                  active ? "bg-linear-to-b from-[#E8602E] to-[#A8401A] font-medium text-white shadow-[0_0_24px_rgba(232,96,46,0.35)]" : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="size-5 shrink-0 tiny:size-[18px]" />
                <span className={railLabel(collapsed)}>{label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
};

const ActiveNavList = ({ onNavigate, ...props }) => {
  const pathname = usePathname();

  useEffect(() => {
    onNavigate();
  }, [pathname, onNavigate]);

  return <NavList {...props} activeHref={pathname} />;
};

const PanelNav = ({ panel, brand }) => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const { groups, promo } = navs[panel];
  const root = groups[0].items[0].href;

  useEffect(() => {
    setCollapsed(readCollapsed());
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleOpen = () => setOpen(true);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleCollapse = () =>
    setCollapsed((v) => {
      writeCollapsed(!v);
      return !v;
    });

  return (
    <div
      className={`relative transition-[width] duration-300 ease-out lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:shrink-0 ${collapsed ? "lg:w-20" : "lg:w-72"} ${ready ? "" : "transition-none **:transition-none!"}`}
    >
      <div className="flex items-center justify-between rounded-2xl bg-[#0C0C0C] px-4 py-3 lg:hidden">
        <button type="button" onClick={handleOpen} aria-label="Open navigation" aria-expanded={open} aria-controls="panel-sidebar" className="rounded-xl p-2 hover:bg-white/5">
          <Menu className="size-6" />
        </button>
        <Link href="/" className="font-machina text-xl">
          {brand.shortName || brand.name}
        </Link>
        <span className="size-10" />
      </div>

      <div
        onClick={handleClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <button
        type="button"
        onClick={handleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-9 z-10 hidden size-7 place-items-center rounded-full border border-[#302C2A] bg-[#0C0C0C] text-white/60 shadow-lg transition hover:border-accent hover:text-accent lg:grid"
      >
        <ChevronLeft className={`size-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
      </button>

      <aside
        id="panel-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-5 overflow-x-hidden overflow-y-auto short:gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-r border-white/5 bg-[#0C0C0C] p-5 transition-transform duration-300 lg:static lg:z-auto lg:h-full lg:w-auto lg:max-w-none lg:translate-x-0 lg:rounded-3xl lg:border lg:px-3 lg:py-6 short:lg:py-4 tiny:lg:py-3 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <Link href="/" aria-label={brand.name} className="flex min-w-0 flex-1 items-center lg:pl-[7px]">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white font-machina text-xl font-bold text-black">{brand.name?.[0]}</span>
            <span className={`truncate font-machina text-2xl leading-none ${railLabel(collapsed)}`}>{brand.shortName || brand.name}</span>
            {panel === "admin" && (
              <span className={`ml-auto shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs uppercase tracking-wider text-accent transition-opacity duration-300 ${collapsed ? "lg:pointer-events-none lg:opacity-0" : ""}`}>Admin</span>
            )}
          </Link>
          <button type="button" onClick={handleClose} aria-label="Close navigation" className="rounded-xl p-2 text-white/60 hover:bg-white/5 hover:text-white lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        <Suspense fallback={<NavList groups={groups} activeHref={null} collapsed={collapsed} />}>
          <ActiveNavList groups={groups} collapsed={collapsed} onNavigate={handleClose} />
        </Suspense>

        <div className="mt-auto flex w-full flex-col gap-3">
          <div className={`grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-300 ease-out [@media(max-height:960px)]:hidden ${collapsed ? "lg:pointer-events-none lg:grid-rows-[0fr] lg:opacity-0" : ""}`}>
            <div className="min-h-0 overflow-hidden">
              <Link href={promo.href} tabIndex={collapsed ? -1 : undefined} className="group relative block w-[246px] max-w-full overflow-hidden rounded-2xl bg-[#FFF3EF] p-5 text-black lg:w-[262px]">
                <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-black text-white transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
                <p className="font-machina text-xl">{promo.title}</p>
                <p className="mt-1 pr-8 text-sm text-black/60">{promo.text}</p>
                <span className="mt-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white">{promo.cta}</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col">
            <Link href="/" title={collapsed ? "Back to website" : undefined} aria-label="Back to website" className="flex items-center rounded-full px-[17px] py-2.5 text-white/70 transition-colors hover:bg-white/5 hover:text-white short:py-1.5">
              <House className="size-5 shrink-0" />
              <span className={railLabel(collapsed)}>Back to website</span>
            </Link>
            <SignOutButton compact={collapsed} className="short:py-1.5" />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PanelNav;
