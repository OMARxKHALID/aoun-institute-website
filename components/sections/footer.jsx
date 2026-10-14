"use client";

import { useId, useRef } from "react";
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
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const svgRef = useRef(null);
  const glowRef = useRef(null);
  const fontSize = Math.round(980 / Math.max(text.length * 0.6, 1));
  const height = Math.round(fontSize * 0.95);
  const baseline = Math.round(fontSize * 0.76);
  const textProps = {
    x: 500,
    y: baseline,
    textAnchor: "middle",
    textLength: 960,
    lengthAdjust: "spacing",
    fontSize,
    className: "font-machina font-bold",
  };

  const handleMove = (e) => {
    const svg = svgRef.current;
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    glowRef.current.style.transform = `translate(${point.x}px, ${point.y}px)`;
    glowRef.current.style.opacity = "0.85";
  };

  const handleLeave = () => {
    glowRef.current.style.opacity = "0";
  };

  return (
    <div onPointerMove={handleMove} onPointerLeave={handleLeave} aria-hidden="true" className="w-full select-none px-4 py-10 sm:px-8 md:py-16">
      <svg ref={svgRef} viewBox={`0 0 1000 ${height}`} className="mx-auto h-auto max-h-[40vh] w-full overflow-visible">
        <defs>
          <clipPath id={`${id}-clip`}>
            <text {...textProps}>{text}</text>
          </clipPath>
          <filter id={`${id}-blur`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="55" />
          </filter>
        </defs>
        <g clipPath={`url(#${id}-clip)`}>
          <rect width="1000" height={height} fill="#080808" />
          <circle
            ref={glowRef}
            r={height * 0.42}
            fill="#E8602E"
            filter={`url(#${id}-blur)`}
            style={{ opacity: 0, transform: `translate(500px, ${height / 2}px)`, transition: "opacity 1.2s ease, transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)" }}
          />
        </g>
        <text {...textProps} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
          {text}
        </text>
      </svg>
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
