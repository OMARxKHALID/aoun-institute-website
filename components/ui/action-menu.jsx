"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { menuItem, menuPanel } from "@/lib/ui";

const ActionMenu = ({ label, items }) => {
  const id = useId();
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const handleToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const left = Math.min(Math.max(8, rect.right - 224), window.innerWidth - 232);
    const top = rect.bottom + 6 + 320 > window.innerHeight ? Math.max(8, rect.top - 6 - Math.min(320, items.length * 40 + 12)) : rect.bottom + 6;
    setPos({ top, left });
  };

  const close = () => document.getElementById(id)?.hidePopover();

  const handleSelect = (onClick) => () => {
    close();
    onClick();
  };

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        onClick={handleToggle}
        aria-label={label}
        title={label}
        className="grid size-9 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-white"
      >
        <MoreHorizontal className="size-5" />
      </button>
      <div id={id} popover="auto" role="menu" style={{ top: pos.top, left: pos.left }} className={`${menuPanel} w-56`}>
        {items.filter(Boolean).map(({ label: text, icon: Icon, href, external, onClick, danger, disabled }) => {
          const className = `${menuItem} ${danger ? "text-red-300 hover:bg-red-500/10" : ""}`;
          const content = (
            <>
              {Icon && <Icon className={`size-4 shrink-0 ${danger ? "" : "text-white/50"}`} />} {text}
            </>
          );
          if (href && external)
            return (
              <a key={text} href={href} target="_blank" rel="noopener noreferrer" role="menuitem" onClick={close} className={className}>
                {content}
              </a>
            );
          if (href)
            return (
              <Link key={text} href={href} role="menuitem" onClick={close} className={className}>
                {content}
              </Link>
            );
          return (
            <button key={text} type="button" role="menuitem" disabled={disabled} onClick={handleSelect(onClick)} className={className}>
              {content}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default ActionMenu;
