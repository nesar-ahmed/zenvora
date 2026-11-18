import Link from "next/link";

const discoverLinks = [
  { href: "/", label: "Food delivery" },
  { href: "/businesses", label: "Shops" },
];

const accountLinks = [
  { href: "/account", label: "My account" },
  { href: "/login", label: "Log in" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
            >
              Z
            </span>
            <span className="text-lg font-semibold tracking-tight">Zenvora</span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Local food and everyday essentials from the shops around you,
            delivered through one shared network.
          </p>
        </div>

        <div className="text-sm">
          <h2 className="font-medium">Discover</h2>
          <ul className="mt-3 space-y-2">
            {discoverLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm">
          <h2 className="font-medium">Account</h2>
          <ul className="mt-3 space-y-2">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Zenvora. Built locally for local commerce.</p>
          <p>Offline-first MVP · No external services required</p>
        </div>
      </div>
    </footer>
  );
}
