import type { Metadata } from "next";

import { AccountProfile } from "@/features/auth/account-profile";

export const metadata: Metadata = {
  title: "My account",
};

export default function AccountPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl justify-center px-4 py-16 sm:px-6">
      <AccountProfile />
    </main>
  );
}
