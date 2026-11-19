"use client";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navigation } from "@/lib/config";
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="DS2 home">
          <Logo priority />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(([name, href]) => (
            <Link key={name} href={href}>
              {name}
            </Link>
          ))}
        </nav>
        <Link className="button small header-cta" href="/#contact">
          <span className="cta-monogram" aria-hidden="true">
            SK
          </span>{" "}
          Let’s talk <ArrowUpRight size={16} />
        </Link>
        <button
          className="menu-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {[...navigation, ["Contact", "/#contact"]].map(([name, href]) => (
            <Link key={name} href={href} onClick={() => setOpen(false)}>
              {name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
