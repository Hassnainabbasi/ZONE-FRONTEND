const API_URL =
  import.meta.env["VITE_API_URL"] ||
  "https://zone-backend.vercel.app/api";

/* =========================================================
   TYPES
========================================================= */

export interface AdminUser {
  _id: string;

  name: string;

  email: string;

  phone: string;

  role:
    "Admin";

  active:
    boolean;

  memberId?:
    string;

  createdAt?:
    string;

  lastLoginAt?:
    string | null;
}

export interface CreateAdminPayload {
  name:
    string;

  email:
    string;

  phone:
    string;

  password:
    string;
}

/* =========================================================
   ERROR
========================================================= */

export class AdminApiError
  extends Error {
  status:
    number;

  data?:
    unknown;

  constructor(
    message:
      string,

    status:
      number,

    data?:
      unknown,
  ) {
    super(
      message,
    );

    this.name =
      "AdminApiError";

    this.status =
      status;

    this.data =
      data;
  }
}

/* =========================================================
   FETCH
========================================================= */

async function apiFetch<T>(
  path:
    string,

  options:
    RequestInit = {},
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
    throw new AdminApiError(
      data?.message ||
        `Request failed: ${response.status}`,

      response.status,

      data,
    );
  }

  return data as T;
}

/* =========================================================
   ADMIN API
========================================================= */

export const adminApi = {
  listAdmins() {
    return apiFetch<{
      success:
        boolean;

      data:
        AdminUser[];
    }>(
      "/admin/users",
    );
  },

  createAdmin(
    payload:
      CreateAdminPayload,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        AdminUser;
    }>(
      "/admin/users",

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
};