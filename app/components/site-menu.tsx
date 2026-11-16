"use client";

import { CircleUserRound, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/app/components/theme-toggle";

export function SiteMenu({ accountActive }: { accountActive: boolean }) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!menu.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return <div className="site-menu" ref={menu}>
    <button ref={trigger} className="site-menu-trigger" type="button" aria-label="Menu"
      aria-expanded={open} aria-controls="site-menu-panel" onClick={() => setOpen(value => !value)}>
      <Menu aria-hidden="true" />
    </button>
    {open && <div id="site-menu-panel" className="site-menu-panel" aria-label="Account and appearance">
      <Link href="/account" prefetch={false} aria-current={accountActive ? "page" : undefined} onClick={() => setOpen(false)}>
        <CircleUserRound aria-hidden="true" /><span>Account</span>
      </Link>
      <ThemeToggle />
    </div>}
  </div>;
}
