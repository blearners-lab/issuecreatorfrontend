"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ALLOWED_IMAGE_TYPES,
  ISSUE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  createIssue,
  type IssueType,
} from "@/lib/api";

interface FieldErrors {
  type?: string;
  description?: string;
  image?: string;
  form?: string;
}

interface SuccessState {
  issueNumber: number;
  issueUrl: string;
}

const MAX_IMAGE_SIZE_MB = MAX_IMAGE_SIZE_BYTES / (1024 * 1024);

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function IssueReportForm() {
  const { user, logout } = useAuth();
  const [type, setType] = useState<IssueType>("Bug");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (!file) {
      setImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setImage(null);
      setErrors((prev) => ({ ...prev, image: "Only PNG, JPG, JPEG, or WEBP images are allowed." }));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImage(null);
      setErrors((prev) => ({
        ...prev,
        image: `Image is too large (${formatBytes(file.size)}). Maximum size is ${MAX_IMAGE_SIZE_MB} MB.`,
      }));
      event.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, image: undefined }));
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};
    if (!type) {
      nextErrors.type = "Issue type is required.";
    }
    if (!description.trim()) {
      nextErrors.description = "Description is required.";
    }
    if (!image) {
      nextErrors.image = "An image is required.";
    }
    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !image) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await createIssue({ type, description: description.trim(), image });

    setIsSubmitting(false);

    if (result.success) {
      setSuccess({ issueNumber: result.issueNumber, issueUrl: result.issueUrl });
    } else {
      setErrors({ form: result.message });
    }
  }

  function handleReportAnother() {
    setSuccess(null);
    setType("Bug");
    setDescription("");
    setImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-emerald-900">GitHub issue created successfully</h2>
        <p className="mt-1 text-sm text-emerald-700">Issue #{success.issueNumber} is now open in the repository.</p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={success.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Open GitHub Issue
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-8 8M6 12v6a1 1 0 001 1h6" />
            </svg>
          </a>
          <button
            type="button"
            onClick={handleReportAnother}
            className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
          >
            Report another issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">Report a QA Issue</h1>
          <p className="mt-1 text-sm text-gray-500">Creates a GitHub issue directly in the tracked repository.</p>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600">Signed in as {user.name} ({user.email})</span>
          )}
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-gray-600 underline-offset-2 hover:underline hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>

      {errors.form && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      <div className="mt-6">
        <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700">
          Issue Type
        </label>
        <select
          id="issue-type"
          value={type}
          onChange={(event) => {
            setType(event.target.value as IssueType);
            setErrors((prev) => ({ ...prev, type: undefined }));
          }}
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-ink focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          {ISSUE_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.type && <p className="mt-1.5 text-sm text-red-600">{errors.type}</p>}
      </div>

      <div className="mt-5">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          placeholder="Describe what happened, what you expected, and steps to reproduce."
          className="mt-1.5 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div className="mt-5">
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Image
        </label>
        <input
          id="image"
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageChange}
          className="mt-1.5 block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
        <p className="mt-1.5 text-xs text-gray-400">PNG, JPG, JPEG, or WEBP. Max {MAX_IMAGE_SIZE_MB} MB.</p>
        {errors.image && <p className="mt-1.5 text-sm text-red-600">{errors.image}</p>}

        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Selected screenshot preview"
            className="mt-3 max-h-56 w-full rounded-lg border border-gray-200 object-contain"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating issue…" : "Create GitHub Issue"}
      </button>
    </form>
  );
}
