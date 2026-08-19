"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Invalid email address.";
    }
    if (!password) {
      nextErrors.password = "Password is required.";
    }
    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await login(email.trim(), password);

    setIsSubmitting(false);

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setErrors({ form: result.message ?? "Login failed. Please try again." });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to report QA issues</p>
        </div>

        {errors.form && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="you@example.com"
              disabled={isSubmitting}
            />
            {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-ink underline-offset-2 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}