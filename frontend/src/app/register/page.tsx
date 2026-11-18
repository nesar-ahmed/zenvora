import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16 sm:px-6">
      <RegisterForm />
    </main>
  );
}
