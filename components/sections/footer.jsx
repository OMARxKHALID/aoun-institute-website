"use client";

import { useRef } from "react";
import Link from "next/link";

const linkColumns = [
  { title: "Explore", links: [{ label: "Courses", href: "/courses" }, { label: "About Us", href: "/about" }, { label: "FAQ", href: "/faq" }, { label: "Contact", href: "/contact" }] },
  { title: "Learners", links: [{ label: "My Dashboard", href: "/dashboard" }, { label: "Verify Certificate", href: "/verify" }, { label: "Sign In", href: "/login" }] },
  { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms & Conditions", href: "/terms-and-conditions" }, { label: "Pricing & Refund", href: "/pricing-and-refund" }] },
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
    <div
      ref={areaRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative mb-20 hidden h-[35vh] w-full items-center justify-center overflow-hidden px-10 lg:flex"
    >
      <span ref={dotRef} className="pointer-events-none absolute left-0 top-0 aspect-square h-[40vh] rounded-full bg-accent opacity-0 transition-opacity duration-300" />
      <p className="relative z-10 select-none whitespace-nowrap font-machina text-[22vw] font-bold uppercase leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.35)]">
        {text}
      </p>
    </div>
  );
};

const FooterLink = ({ href, children }) => (
  <Link href={href} className="font-light text-white/60 wrap-anywhere hover:text-accent">
    {children}
  </Link>
);

const Footer = ({ settings }) => {
  const { brand, contact, socials, footer } = settings;
  const phoneHref = `tel:${contact.phone?.replace(/[^\d+]/g, "")}`;
  return (
    <footer className="pb-10">
      <Wordmark text={brand.shortName || brand.name} />
      <section className="flex gap-20 px-18 max-md:flex-col max-md:px-8 md:flex-wrap lg:flex-nowrap">
        <div className="flex w-full flex-col gap-4">
          <p className="font-machina text-3xl">{brand.name}</p>
          <p className="max-w-sm text-lg font-light text-white/60">{footer.text}</p>
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {socials.map(({ label, url }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-4 py-1.5 text-sm text-white/70 transition-colors hover:border-accent hover:text-accent">
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-10 md:grid-cols-4 md:gap-16">
          {linkColumns.map(({ title, links }) => (
            <div key={title} className="flex flex-col gap-3 text-lg font-normal">
              <h4 className="mb-4 font-medium uppercase">{title}</h4>
              {links.map(({ label, href }) => (
                <FooterLink key={label} href={href}>
                  {label}
                </FooterLink>
              ))}
            </div>
          ))}
          <div className="flex flex-col gap-3 text-lg font-normal">
            <h4 className="mb-4 font-medium uppercase">Contact</h4>
            {contact.hours && <span className="font-light text-white">{contact.hours}</span>}
            {contact.phone && <FooterLink href={phoneHref}>{contact.phone}</FooterLink>}
            {contact.email && <FooterLink href={`mailto:${contact.email}`}>{contact.email}</FooterLink>}
            {contact.address && <span className="font-light text-white/60">{contact.address}</span>}
          </div>
        </div>
      </section>
      <p className="mt-16 px-18 text-sm text-white/30 max-md:px-8">
        © {brand.name}. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
