"use client";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Journey", href: "#journey" },
  { label: "Shimla", href: "#shimla" },
  { label: "Manali", href: "#manali" },
  { label: "Spiti", href: "#spiti" },
  { label: "Ladakh", href: "#ladakh" },
  { label: "Book", href: "#book" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
      aria-label="Primary navigation"
    >
      <a href="#hero" className="navbar__logo">
        Drishya Trails
      </a>

      <nav className="navbar__nav" aria-label="Main menu">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} className="navbar__link">
            {link.label}
          </a>
        ))}
      </nav>

      <button
        className="navbar__lang"
        aria-label="Change language"
      >
        <span>EN</span>
        <span aria-hidden="true">⌄</span>
      </button>
    </header>
  );
}
