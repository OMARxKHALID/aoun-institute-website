import { Globe, MessageCircle } from "lucide-react";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

const icons = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" {...stroke} />
      <circle cx="12" cy="12" r="4" {...stroke} />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" {...stroke} />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" {...stroke} />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" {...stroke} />
      <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" />
    </>
  ),
  facebook: <path d="M14 21v-7.5h2.5l.5-3H14V8.8c0-.9.3-1.5 1.6-1.5H17V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.3-3.7 3.8v2.2H8.5v3H11V21" {...stroke} />,
  x: <path d="M4 4l16 16M20 4 4 20" {...stroke} />,
  twitter: <path d="M4 4l16 16M20 4 4 20" {...stroke} />,
  tiktok: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.2 4.4 5 4.6" {...stroke} />,
  discord: (
    <>
      <path d="M7 17c-2-.6-3.5-1.4-4-2 0-4 1.3-7.5 3-10 1.4-.6 2.6-.9 3.6-1l.6 1.4c1.2-.2 2.4-.2 3.6 0L14.4 4c1 .1 2.2.4 3.6 1 1.7 2.5 3 6 3 10-.5.6-2 1.4-4 2l-1-1.8M8 16.2c2.6 1 5.4 1 8 0" {...stroke} />
      <circle cx="9.5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="14.5" cy="12" r="1.2" fill="currentColor" />
    </>
  ),
};

const SocialIcon = ({ label, className = "size-5" }) => {
  const key = label.trim().toLowerCase();
  if (key.includes("whatsapp")) return <MessageCircle className={className} />;
  const icon = icons[key];
  if (!icon) return <Globe className={className} />;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {icon}
    </svg>
  );
};

export default SocialIcon;
