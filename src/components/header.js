"use client"; 

import Link from "next/link";   
import { useState } from "react"; 

// navigation links defined once here as an array 
// to add or remove a page from the nav, just update this list.
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/registry", label: "Registry" },
  { href: "/accommodations", label: "Accommodations" },
  { href: "/info", label: "Info" },
];


export default function Header() {
  // menuOpen controls whether the mobile dropdown is visible.
  // Starts as false toggled by the Menu/Close button on small screens.
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    /* 
    TODO: 
    change style and look to however customer wants
    */
    // border-b adds a subtle bottom border to separate the header from page content
    <header className="border-b bg-white">

      {/* centered container — max-w-4xl */}
      <div className="mx-auto max-w-4xl px-6 py-8">

        {/* wedding title section — always visible on all screen sizes */}
        <div className="text-center mb-5">
          <h1 className="text-4xl font-bold">Tori & Connor</h1>
          <p className="mt-1 text-base text-gray-600">Welcome to our wedding website</p>
        </div>

        {/* desktop nav — hidden on mobile shown as a row on sm screens and up (sm:flex) */}
        <nav className="hidden sm:flex justify-center gap-6">

          {/* loop through navLinks and render a Link for each one */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}             // The URL this link navigates to
              className="text-base font-medium hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* mobile hamburger button only visible on small screens (sm:hidden hides it on sm and up) */}
        <div className="sm:hidden flex justify-center">
          <button
            className="cursor-pointer rounded-md border px-4 py-1 text-sm hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)} // flip menuOpen between true and false
          >
            {/* button label changes based on whether the menu is open */}
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* mobile dropdown nav only renders when menuOpen is true.
          sm:hidden ensures it never shows on desktop even if somehow triggered */}
      {menuOpen && (
        <nav className="sm:hidden border-t px-6 py-3 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium hover:underline"
              onClick={() => setMenuOpen(false)} // close the menu when a link is tapped
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
