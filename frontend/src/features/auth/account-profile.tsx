"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LogOut } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatLabel } from "@/lib/format";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name."),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function AccountProfile() {
  const router = useRouter();
  const { user, status, logout, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "" },
  });

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (user) {
      reset({ full_name: user.full_name });
    }
  }, [user, reset]);

  if (status === "loading" || !user) {
    return (
      <div className="h-64 w-full max-w-xl animate-pulse rounded-2xl border bg-muted/40" />
    );
  }

  async function onSubmit(values: ProfileValues) {
    setSaved(false);
    setRequestError(null);
    try {
      await updateProfile(values.full_name);
      setSaved(true);
    } catch (error) {
      setRequestError(getApiErrorMessage(error));
    }
  }

  function handleLogout() {
    logout();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
              {user.full_name.charAt(0).toUpperCase()}
            </span>
            <div>
              <h1 className="text-xl font-semibold">{user.full_name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {formatLabel(user.role)}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 border-t pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Account status</dt>
            <dd className="mt-1 font-medium">
              {user.is_active ? "Active" : "Inactive"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="mt-1 font-medium">
              {new Date(user.created_at).toLocaleDateString("en-IE")}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Profile details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your display name up to date.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              autoComplete="name"
              aria-invalid={Boolean(errors.full_name)}
              {...register("full_name")}
            />
            {errors.full_name ? (
              <p className="text-xs text-destructive">
                {errors.full_name.message}
              </p>
            ) : null}
          </div>

          {requestError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {requestError}
            </p>
          ) : null}

          {saved ? (
            <p className="rounded-md border border-primary/20 bg-accent px-3 py-2 text-sm text-accent-foreground">
              Profile updated.
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </div>

      <Button variant="outline" onClick={handleLogout}>
        <LogOut />
        Log out
      </Button>
    </div>
  );
}
