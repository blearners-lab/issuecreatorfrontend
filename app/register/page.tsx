"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  form?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    } else if (name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Invalid email address.";
    }
    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
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

    const result = await register(email.trim(), password, name.trim());

    setIsSubmitting(false);

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setErrors({ form: result.message ?? "Registration failed. Please try again." });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-ink">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Start reporting QA issues to GitHub</p>
        </div>

        {errors.form && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="John Doe"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
          </div>

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
              autoComplete="new-password"
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

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}