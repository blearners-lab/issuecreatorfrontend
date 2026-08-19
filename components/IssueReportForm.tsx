"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ISSUE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  createIssue,
  type IssueType,
} from "@/lib/api";

interface FieldErrors {
  type?: string;
  description?: string;
  media?: string;
  form?: string;
}

interface SuccessState {
  issueNumber: number;
  issueUrl: string;
  mediaUrls: string[];
}

const MAX_IMAGE_SIZE_MB = MAX_IMAGE_SIZE_BYTES / (1024 * 1024);
const MAX_VIDEO_SIZE_MB = MAX_VIDEO_SIZE_BYTES / (1024 * 1024);

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function IssueReportForm() {
  const { user, logout } = useAuth();
  const [type, setType] = useState<IssueType>("Bug");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files ?? [];

    // Deduplicate: keep existing files, add new valid ones without duplicates
    const existingFileNames = new Set(files.map((f) => f.name + f.type));
    const validFiles: File[] = [];
    const newPreviewUrls = new Map<string, string>();

    // Preserve existing preview URLs for files that are still in the list
    files.forEach((f) => {
      if (previewUrls.has(f.name + f.type)) {
        newPreviewUrls.set(f.name + f.type, previewUrls.get(f.name + f.type)!);
      }
    });

    // Process new selected files
    Array.from(selectedFiles).forEach((file) => {
      // Skip if already selected
      if (existingFileNames.has(file.name + file.type)) {
        return;
      }

      // Validate file type
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type as (typeof ALLOWED_VIDEO_TYPES)[number]);

      if (!isImage && !isVideo) {
        setErrors((prev) => ({ ...prev, media: "Only PNG, JPG, JPEG, WEBP images or MP4/MOV videos are allowed." }));
        event.target.value = "";
        return;
      }

      // Validate file size
      const maxSize = isImage ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          media: `${isImage ? "Image" : "Video"} is too large (${formatBytes(file.size)}). Maximum size is ${isImage ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB} MB.`,
        }));
        event.target.value = "";
        return;
      }

      validFiles.push(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newPreviewUrls.set(file.name + file.type, previewUrl);
    });

    // Merge: keep existing valid files with their URLs, add new files
    const mergedFiles = [...files, ...validFiles];
    // Remove duplicates from merged (keep first occurrence)
    const seen = new Set<string>();
    const dedupedFiles = mergedFiles.filter((f) => {
      const key = f.name + f.type;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    const mergedPreviewUrls = new Map([...newPreviewUrls]);
    // Remove keys for files that were filtered out
    seen.forEach((key) => mergedPreviewUrls.delete(key));

    setFiles(dedupedFiles);
    setPreviewUrls(mergedPreviewUrls);
    setErrors((prev) => ({ ...prev, media: undefined }));
  }

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};
    if (!type) {
      nextErrors.type = "Issue type is required.";
    }
    if (!description.trim()) {
      nextErrors.description = "Description is required.";
    }
    if (files.length === 0) {
      nextErrors.media = "At least one image or video is required.";
    }
    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (files.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await createIssue({ type, description: description.trim(), files });

    setIsSubmitting(false);

    if (result.success) {
      setSuccess({
        issueNumber: result.issueNumber,
        issueUrl: result.issueUrl,
        mediaUrls: result.mediaUrls,
      });
    } else {
      setErrors({ form: result.message });
    }
  }

  function handleReportAnother() {
    setSuccess(null);
    setType("Bug");
    setDescription("");
    setFiles([]);
    setPreviewUrls(new Map());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors({});
  }

  // Build preview gallery from preview URLs
  const previewGallery = Array.from(previewUrls.entries()).map(([key, url], index) => (
    <div
      key={index}
      className="mt-3 flex items-center gap-2"
    >
      {url && (
        <div className="flex-1 min-w-0">
          {(() => {
            const isVideo = /video\/mp4|video\/quicktime/.test(key);
            return isVideo ? (
              <div
                className="h-32 w-full rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-6 w-6 mx-auto"
                >
                  <path d="M4 4v16h16M16 4h1v16m-6-7h8m0 0v8m-8 0v-8M4 4v16h16M16 4h1v16m-6-7h8m0 0v8m-8 0v-8" />
                </svg>
                <p className="text-center pt-2">Video file</p>
              </div>
            ) : (
              <img
                src={url}
                alt="Selected screenshot preview"
                className="h-32 w-full rounded-lg border border-gray-200 object-cover"
              />
            );
          })()}
        </div>
      )}
      {(() => {
        const isVideo = /video\/mp4|video\/quicktime/.test(key);
        return isVideo ? null : (
          <button
            type="button"
            onClick={() => {
              const newFiles = files.filter((f) => f.name + f.type !== key);
              setFiles(newFiles);
              setPreviewUrls((prev) => {
                const newMap = new Map(prev);
                newMap.delete(key);
                return newMap;
              });
              // Revoke object URL
              const urlEntry = Array.from(previewUrls.entries()).find(([k]) => k === key);
              if (urlEntry) {
                URL.revokeObjectURL(urlEntry[1]);
              }
            }}
            className="ml-2 text-xs text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        );
      })()}
    </div>
  ));

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

      <div className="mt-5">
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
        <label htmlFor="media" className="block text-sm font-medium text-gray-700">
          Media
        </label>
        <input
          id="media"
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime"
          onChange={handleFileChange}
          className="mt-1.5 block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
        <p className="mt-1.5 text-xs text-gray-400">PNG, JPG, JPEG, WEBP or MP4/MOV. Max: {MAX_IMAGE_SIZE_MB} MB images, {MAX_VIDEO_SIZE_MB} MB videos.</p>
        {errors.media && <p className="mt-1.5 text-sm text-red-600">{errors.media}</p>}
      </div>

      {previewGallery}

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