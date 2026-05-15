"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { IconArrowRight, IconGitHub } from "./landing-icons";
import { NorthBrand } from "./NorthBrand";

const GH = "https://github.com/Get-North-Path/AOR-tracker";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/streams/cec", label: "CEC" },
  { href: "/streams/fsw", label: "FSW" },
  { href: "/streams/pnp", label: "PNP" },
  { href: "/community", label: "Community" },
  { href: "/roadmap", label: "Roadmap" },
];

export function StreamsNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (btnRef.current?.contains(target)) return;
      close();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, close]);

  return (
    <nav className="nav">
      <div className="nav-start">
        <NorthBrand />

        <button
          type="button"
          ref={btnRef}
          className="nav-menu-btn"
          aria-expanded={open}
          aria-controls="streams-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <FaTimes aria-hidden /> : <FaBars aria-hidden />}
          <span>Menu</span>
        </button>
      </div>

      <div className="nav-links">
        {NAV_ITEMS.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            data-active={pathname === item.href ? "true" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <a
          href={GH}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-oss"
        >
          <IconGitHub />
          Open Source
        </a>
      </div>

      <Link href="/track" className="nav-cta">
        Track My AOR <IconArrowRight />
      </Link>

      <div
        id="streams-nav-panel"
        ref={panelRef}
        className={`nav-mobile-panel${open ? " open" : ""}`}
        role="menu"
        aria-hidden={!open}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            role="menuitem"
            onClick={close}
            data-active={pathname === item.href ? "true" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <a
          href={GH}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-oss"
          role="menuitem"
          onClick={close}
        >
          <IconGitHub />
          Open Source
        </a>
      </div>
    </nav>
  );
}
