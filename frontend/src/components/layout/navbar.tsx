"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { useLocation } from "@/features/locations/location-provider";

const navLinks = [{ href: "/businesses", label: "Shops" }];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, status, logout } = useAuth();
  const { selection, ready, openPicker } = useLocation();
  const firstName = user?.full_name.split(" ")[0];

  function closeMenu() {
    setOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
  }

  function handleLocationClick() {
    closeMenu();
    openPicker();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
            >
              Z
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Zenvora
            </span>
          </Link>

          <button
            type="button"
            onClick={openPicker}
            className="hidden min-w-0 items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-left transition-colors hover:bg-accent sm:flex"
          >
            <MapPin className="size-4 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-[10px] leading-tight font-medium tracking-wide text-muted-foreground uppercase">
                Deliver to
              </span>
              <span className="block max-w-32 truncate text-xs leading-tight font-medium">
                {!ready
                  ? "Select location"
                  : selection
                    ? `${selection.city}, ${selection.countryCode}`
                    : "Select location"}
              </span>
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <span aria-hidden="true" className="h-5 w-px bg-border" />

          {status === "loading" ? (
            <span className="h-8 w-32 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              <Link
                href="/account"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {firstName}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={handleLocationClick}
              className="mb-2 flex items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-left"
            >
              <MapPin className="size-4 text-primary" />
              <span>
                <span className="block text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  Deliver to
                </span>
                <span className="block text-sm font-medium">
                  {selection
                    ? `${selection.city}, ${selection.countryCode}`
                    : "Select location"}
                </span>
              </span>
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 border-t pt-3">
              {status === "loading" ? (
                <span className="block h-9 w-full animate-pulse rounded-md bg-muted" />
              ) : user ? (
                <div className="space-y-2">
                  <Link
                    href="/account"
                    onClick={closeMenu}
                    className="block rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
                  >
                    My account ({firstName})
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Log out
                  </Button>
                </div>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login" onClick={closeMenu}>
                    Log in
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
