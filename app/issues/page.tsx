"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchIssues, type UserIssue } from "@/lib/api";
import Link from "next/link";

export default function IssuesPage() {
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState<UserIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) return;
    if (!user) return;

    async function loadIssues() {
      setLoading(true);
      try {
        const data = await fetchIssues();
        setIssues(data);
      } catch (err) {
        setError("Failed to load issues. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadIssues();
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg className="animate-spin h-6 w-6 text-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Loading your issues...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg className="animate-spin h-6 w-6 text-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Loading your issues...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-6 w-6">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3v.01" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-red-900">Error</h2>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen px-4 py-12">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-ink">My Issues</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage your reported issues</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Report New Issue
          </Link>
        </div>

        {issues.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mx-auto h-12 w-12 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">No issues yet</h2>
            <p className="mt-2 text-sm text-gray-500">You haven't reported any issues yet.</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Report Your First Issue
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {issue.issue_type}
                      </span>
                      <a
                        href={issue.github_issue_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        GitHub Issue #{issue.github_issue_number}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-gray-700 mb-3">{issue.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {issue.user_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {issue.user_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(issue.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  {issue.image_url && (
                    <a
                      href={issue.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <img
                        src={issue.image_url}
                        alt="Issue screenshot"
                        className="h-32 w-auto rounded-lg border border-gray-200 object-cover"
                      />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}