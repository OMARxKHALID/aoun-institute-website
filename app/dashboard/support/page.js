import Link from "next/link";
import { BadgeCheck, Clock, Mail, MapPin, Phone, Receipt } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { getSiteSettings } from "@/features/site-settings/queries";
import ContactForm from "@/features/contact/components/contact-form";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";

export const metadata = { title: "Help & Support" };

const SupportPage = async () => {
  const [user, { contact, home }] = await Promise.all([requireUser(), getSiteSettings()]);
  const details = [
    [Mail, contact.email, contact.email && `mailto:${contact.email}`],
    [Phone, contact.phone, contact.phone && `tel:${contact.phone.replace(/\s/g, "")}`],
    [Clock, contact.hours],
    [MapPin, contact.address],
  ].filter(([, value]) => value);
  return (
    <>
      <PanelHeader title="Help & Support" subtitle="Answers to common questions, or send us a message." />
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-8">
        <div className="flex min-w-0 flex-col gap-5">
          <PanelCard title="Send us a message">
            <ContactForm embedded defaults={{ name: user.name, email: user.email, phone: user.phone ?? "" }} />
          </PanelCard>
          {home.faqs.length > 0 && (
            <PanelCard title="Frequently asked questions">
              <div className="flex flex-col gap-2">
                {home.faqs.map((faq) => (
                  <details key={faq.q} className="group rounded-2xl border border-white/5 bg-[#070707] p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                      {faq.q}
                      <span className="text-xl text-white/40 transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 whitespace-pre-line text-sm text-white/60">{faq.a}</p>
                  </details>
                ))}
              </div>
            </PanelCard>
          )}
        </div>
        <aside className="flex min-w-0 flex-col gap-5">
          <PanelCard title="Contact">
            <ul className="flex flex-col gap-3 text-sm">
              {details.map(([Icon, value, href]) => (
                <li key={value} className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-accent" />
                  {href ? (
                    <a href={href} className="break-words hover:text-accent">
                      {value}
                    </a>
                  ) : (
                    <span className="break-words text-white/70">{value}</span>
                  )}
                </li>
              ))}
            </ul>
          </PanelCard>
          <PanelCard title="Quick help">
            <ul className="flex flex-col gap-2 text-sm">
              {[
                [Receipt, "/dashboard/orders", "Check a payment status"],
                [BadgeCheck, "/verify", "Verify a certificate"],
              ].map(([Icon, href, label]) => (
                <li key={href}>
                  <Link href={href} className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#070707] px-3 py-2.5 hover:border-accent/50">
                    <Icon className="size-4 text-accent" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </PanelCard>
        </aside>
      </div>
    </>
  );
};

export default SupportPage;
