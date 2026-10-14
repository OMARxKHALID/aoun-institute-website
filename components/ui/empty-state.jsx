import Link from "next/link";
import { btn } from "@/lib/ui";

const EmptyState = ({ icon: Icon, title, text, action, boxed }) => (
  <div className={`flex flex-col items-start gap-3 ${boxed ? "rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-6 sm:p-8" : ""}`}>
    {Icon && (
      <span className="grid size-12 place-items-center rounded-2xl bg-accent/15 text-accent">
        <Icon className="size-6" />
      </span>
    )}
    {title && <p className="text-xl font-medium">{title}</p>}
    {text && <p className="max-w-xl text-sm text-white/55">{text}</p>}
    {action && (
      <Link href={action.href} className={btn.secondary}>
        {action.label}
      </Link>
    )}
  </div>
);

export default EmptyState;
