import { Clock, Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/ui/page-hero";
import ContactForm from "@/features/contact/components/contact-form";
import { getSiteSettings } from "@/features/site-settings/queries";

export const metadata = { title: "Contact", description: "Questions about a course, payment or certificate? Message us or find our phone, email and address.", alternates: { canonical: "/contact" } };

const ContactPage = async () => {
  const { contact } = await getSiteSettings();
  const channels = [
    { icon: Mail, label: "Email", value: contact.email, href: contact.email && `mailto:${contact.email}` },
    { icon: Phone, label: "Phone", value: contact.phone, href: contact.phone && `tel:${contact.phone.replace(/[^\d+]/g, "")}` },
    { icon: Clock, label: "Hours", value: contact.hours },
    { icon: MapPin, label: "Address", value: contact.address },
  ].filter((c) => c.value);

  return (
    <main>
      <PageHero tag="Contact" title="We are here to help" text="Questions about courses, payments, or your account? Send us a message and we will get back to you." />
      <section className="mx-auto grid w-[90%] max-w-6xl gap-10 pb-24 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          {channels.map(({ icon: Icon, label, value, href }) => {
            const Tag = href ? "a" : "div";
            return (
              <Tag key={label} href={href} className="flex items-center gap-4 rounded-2xl border border-[#302C2A] p-5 transition-colors hover:border-accent">
                <span className="rounded-xl bg-[#4B1E0E] p-3 text-accent">
                  <Icon className="size-6" />
                </span>
                <div>
                  <p className="text-sm text-white/50">{label}</p>
                  <p className="text-lg wrap-anywhere">{value}</p>
                </div>
              </Tag>
            );
          })}
        </div>
        <ContactForm />
      </section>
    </main>
  );
};

export default ContactPage;
