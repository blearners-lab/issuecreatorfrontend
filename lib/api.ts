import { getAuthHeader } from "./auth";

export const ISSUE_TYPES = ["Bug", "UI", "Functional"] as const;
export type IssueType = (typeof ISSUE_TYPES)[number];

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"] as const;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB, matches backend limit
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB, matches backend limit

export interface CreateIssueSuccess {
  success: true;
  issueNumber: number;
  issueUrl: string;
  mediaUrls: string[];
}

export interface CreateIssueFailure {
  success: false;
  message: string;
}

export type CreateIssueResponse = CreateIssueSuccess | CreateIssueFailure;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface UserIssue {
  id: number;
  github_issue_number: number;
  github_issue_url: string;
  issue_type: string;
  description: string;
  image_url: string;
  media_urls: string[];
  created_at: string;
  user_id: number;
  user_name: string;
  user_email: string;
}

export async function fetchIssues(): Promise<UserIssue[]> {
  const token = getAuthHeader();
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const response = await fetch(`${API_URL}/api/issues`, {
    method: "GET",
    headers: token,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch issues");
  }

  const data = await response.json();
  if (data.success && Array.isArray(data.issues)) {
    return data.issues;
  }
  throw new Error(data.message || "Failed to fetch issues");
}

export async function createIssue(params: {
  type: IssueType;
  description: string;
  files: File[];
}): Promise<CreateIssueResponse> {
  const formData = new FormData();
  formData.append("type", params.type);
  formData.append("description", params.description);
  // Append all files as "media" array
  params.files.forEach((file) => formData.append("media", file));

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/issues`, {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    });
  } catch {
    return {
      success: false,
      message: "Could not reach the server. Check your connection and try again.",
    };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return {
      success: false,
      message: "The server returned an unexpected response.",
    };
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    (data as { success: unknown }).success === true
  ) {
    const parsed = data as CreateIssueSuccess;
    return {
      success: true,
      issueNumber: parsed.issueNumber,
      issueUrl: parsed.issueUrl,
      mediaUrls: parsed.mediaUrls || [],
    };
  }

  const message =
    typeof data === "object" && data !== null && "message" in data && typeof (data as { message?: unknown }).message === "string"
      ? (data as { message: string }).message
      : "Something went wrong while creating the issue.";

  return { success: false, message };
}