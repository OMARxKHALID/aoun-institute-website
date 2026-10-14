"use client";

import { useRef } from "react";
import Link from "next/link";
import BrandLogo from "@/components/ui/brand-logo";
import SocialIcon from "@/components/ui/social-icon";

const linkColumns = [
  {
    title: "Explore",
    links: [
      { label: "Courses", href: "/courses" },
      { label: "About Us", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Learners",
    links: [
      { label: "My Dashboard", href: "/dashboard" },
      { label: "Verify Certificate", href: "/verify" },
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Pricing & Refund", href: "/pricing-and-refund" },
    ],
  },
];

const Wordmark = ({ text }) => {
  const areaRef = useRef(null);
  const dotRef = useRef(null);

  const handleMove = (e) => {
    const r = areaRef.current.getBoundingClientRect();
    dotRef.current.style.opacity = "1";
    dotRef.current.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px) translate(-50%, -50%)`;
  };

  const handleLeave = () => {
    dotRef.current.style.opacity = "0";
  };

  return (
    <div ref={areaRef} onMouseMove={handleMove} onMouseLeave={handleLeave} aria-hidden="true" className="relative flex w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-8 md:py-16">
      <span ref={dotRef} className="pointer-events-none absolute left-0 top-0 hidden aspect-square h-[30vw] rounded-full bg-accent opacity-0 blur-2xl transition-opacity duration-300 md:block" />
      <p
        style={{ fontSize: `${Math.round(92 / Math.max(text.length * 0.62, 1))}vw` }}
        className="relative z-10 select-none whitespace-nowrap font-machina font-bold leading-[0.9] tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.28)]"
      >
        {text}
      </p>
    </div>
  );
};

const FooterLink = ({ href, children }) => (
  <Link href={href} className="w-fit font-light text-white/55 transition-colors hover:text-accent">
    {children}
  </Link>
);

const Heading = ({ children }) => <h4 className="mb-2 text-sm font-medium uppercase tracking-[0.14em] text-white">{children}</h4>;

const Footer = ({ settings }) => {
  const { brand, contact, socials, footer } = settings;
  const phoneHref = `tel:${contact.phone?.replace(/[^\d+]/g, "")}`;

  return (
    <footer className="relative mt-10 border-t border-white/5">
      <Wordmark text={brand.shortName || brand.name.split(" ")[0]} />

      <div className="mx-auto grid w-full max-w-[1500px] gap-12 px-6 pb-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 lg:px-16">
        <div className="flex flex-col gap-5">
          <BrandLogo brand={brand} />
          {footer.text && <p className="max-w-sm text-base font-light text-white/55">{footer.text}</p>}
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {socials.map(({ label, url }) => (
                <li key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="grid size-11 place-items-center rounded-full border border-white/15 text-white/75 transition hover:border-accent hover:bg-accent/10 hover:text-accent"
                  >
                    <SocialIcon label={label} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-[repeat(3,max-content)_minmax(0,18rem)] lg:gap-x-14">
          {linkColumns.map(({ title, links }) => (
            <nav key={title} aria-label={title} className="flex flex-col gap-3 text-[15px]">
              <Heading>{title}</Heading>
              {links.map(({ label, href }) => (
                <FooterLink key={label} href={href}>
                  {label}
                </FooterLink>
              ))}
            </nav>
          ))}
          <div className="col-span-2 flex flex-col gap-3 text-[15px] sm:col-span-3 lg:col-span-1">
            <Heading>Contact</Heading>
            {contact.hours && <span className="font-light text-white">{contact.hours}</span>}
            {contact.phone && <FooterLink href={phoneHref}>{contact.phone}</FooterLink>}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="w-fit break-all font-light text-white/55 transition-colors hover:text-accent">
                {contact.email}
              </a>
            )}
            {contact.address && <span className="font-light text-white/55">{contact.address}</span>}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-6 py-6 text-sm text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
          <p>© {brand.name}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white">
              Terms
            </Link>
            <Link href="/verify" className="hover:text-white">
              Verify a certificate
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
