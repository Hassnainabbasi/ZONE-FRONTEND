const API_URL =
  import.meta.env["VITE_API_URL"] ||
  "http://localhost:5000/api";

export interface AuthMember {
  _id: string;

  memberId: string;

  points: number;

  hoursPlayed: number;

  membershipTierId?:
    string | null;

  membershipTierName?:
    string;

  membershipStatus:
    | "Active"
    | "Inactive"
    | "Expired";

  membershipStartedAt?:
    string | null;

  membershipExpiresAt?:
    string | null;
}

export interface AuthUser {
  _id: string;

  name: string;

  email: string;

  phone: string;

  role:
    | "Customer"
    | "Admin";

  active: boolean;

  member:
    AuthMember | null;
}

export interface SignupPayload {
  name: string;

  email: string;

  phone: string;

  password: string;
}

export interface LoginPayload {
  login: string;

  password: string;
}

export class AuthApiError
  extends Error {
  status: number;

  data?: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown,
  ) {
    super(message);

    this.name =
      "AuthApiError";

    this.status =
      status;

    this.data =
      data;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",

          ...options.headers,
        },
      },
    );

  let data: any =
    null;

  try {
    data =
      await response.json();
  } catch {
    data =
      null;
  }

  if (
    !response.ok
  ) {
    throw new AuthApiError(
      data?.message ||
        `Request failed: ${response.status}`,

      response.status,

      data,
    );
  }

  return data as T;
}

export const authApi = {
  signup(
    payload:
      SignupPayload,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data: {
        user:
          AuthUser;
      };
    }>(
      "/auth/signup",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );
  },

  login(
    payload:
      LoginPayload,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data: {
        user:
          AuthUser;
      };
    }>(
      "/auth/login",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );
  },

  me() {
    return apiFetch<{
      success: boolean;

      data: {
        user:
          AuthUser;
      };
    }>(
      "/auth/me",
    );
  },

  logout() {
    return apiFetch<{
      success: boolean;

      message: string;
    }>(
      "/auth/logout",
      {
        method:
          "POST",
      },
    );
  },
};