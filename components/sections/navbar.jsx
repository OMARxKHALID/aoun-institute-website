"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import RollText from "@/components/ui/roll-text";
import BrandLogo from "@/components/ui/brand-logo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
];

const isLightBehind = () => {
  const header = document.querySelector("header");
  const point = document.elementsFromPoint(40, 64).find((el) => !header.contains(el));
  for (let el = point; el; el = el.parentElement) {
    const [r, g, b, a = 1] = getComputedStyle(el).backgroundColor.match(/[\d.]+/g).map(Number);
    if (a > 0.5) return 0.299 * r + 0.587 * g + 0.114 * b > 160;
  }
  return false;
};

const Navbar = ({ brand }) => {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [onLight, setOnLight] = useState(false);
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    let last = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 120);
      setOnLight(isLightBehind());
      last = y;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const accounts = { ADMIN: { label: "Admin", href: "/admin" }, TEACHER: { label: "Teaching", href: "/admin/courses" } };
  const account = session ? (accounts[session.user.role] ?? { label: "Dashboard", href: "/dashboard" }) : { label: "Sign In", href: "/login" };

  const handleToggle = () => setOpen((v) => !v);

  return (
    <header
      className={`fixed left-1/2 top-0 z-50 w-full -translate-x-1/2 transition-[translate,color] duration-300 ${hidden && !open ? "-translate-y-full" : "translate-y-0"} ${open ? "bg-black/95" : "backdrop-blur-sm"} ${onLight && !open ? "text-black" : "text-white"}`}
    >
      <div className="flex h-32 items-center justify-between px-10 lg:px-20">
        <BrandLogo brand={brand} />

        <div className="hidden min-[880px]:block">
          <div className="rounded-lg bg-linear-to-l from-white/30 via-transparent to-white/30 p-[.5px]">
            <nav className="flex gap-10 rounded-lg bg-[#0C0C0C] px-8 py-4 tracking-wide text-white/70 lg:text-lg">
              {navLinks.map(({ label, href }) => (
                <Link key={label} href={href} className={`group ${isActive(href) ? "text-white" : ""}`}>
                  <RollText hoverClass="text-accent">{label}</RollText>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="hidden items-center justify-end gap-3.5 min-[880px]:flex">
          <Link href="/contact" className="flex items-center gap-2 rounded-full border border-accent bg-[#4B1E0E] px-4 py-2 text-white">
            <Phone className="size-4" />
            <span>Contact us</span>
          </Link>
          <Link href={account.href} className="group rounded-full border border-current/20 px-4 py-2 transition hover:border-accent hover:bg-accent hover:text-white">
            <RollText>{account.label}</RollText>
          </Link>
        </div>

        <div className="flex items-center gap-3.5 min-[880px]:hidden">
          <Link href="/contact" aria-label="Contact us" className="flex size-10 items-center justify-center rounded-full border border-accent bg-[#4B1E0E] text-white active:scale-95">
            <Phone className="size-4" />
          </Link>
          <button onClick={handleToggle} aria-label="Toggle menu" aria-expanded={open} className="relative flex size-8 items-center justify-center">
            <span className={`absolute block h-[2px] w-7 rounded bg-current transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-1.5"}`} />
            <span className={`absolute block h-[2px] w-7 rounded bg-current transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-1.5"}`} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-black/95 px-10 pb-8 pt-4 text-2xl min-[880px]:hidden">
          {navLinks.map(({ label, href }) => (
            <Link key={label} href={href} onClick={handleToggle} className={`border-b border-white/10 py-4 ${isActive(href) ? "text-accent" : "text-white"}`}>
              {label}
            </Link>
          ))}
          <Link href="/contact" onClick={handleToggle} className={`border-b border-white/10 py-4 ${isActive("/contact") ? "text-accent" : "text-white"}`}>
            Contact
          </Link>
          <Link href={account.href} onClick={handleToggle} className="mt-6 rounded-full border border-white/20 py-3 text-center text-xl">
            {account.label}
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
