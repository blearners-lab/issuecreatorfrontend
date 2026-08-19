const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  name: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
}

function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
}

export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(params: RegisterParams): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (data.success && data.token) {
      setToken(data.token);
    }

    return data;
  } catch {
    return { success: false, message: "Could not reach the server. Check your connection and try again." };
  }
}

export async function login(params: LoginParams): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (data.success && data.token) {
      setToken(data.token);
    }

    return data;
  } catch {
    return { success: false, message: "Could not reach the server. Check your connection and try again." };
  }
}

export function logout(): void {
  removeToken();
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    const data = await response.json();
    return data.success ? data.user : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}