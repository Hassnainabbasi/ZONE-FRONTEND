const API_URL =
  import.meta.env['VITE_API_URL'] ||
  "http://localhost:5000/api";

/* =========================================================
   TYPE
========================================================= */

export type NotificationType =
  | "booking"
  | "cafe"
  | "membership"
  | "tournament";

export interface AdminNotification {
  id:
    string;

  source:
    string;

  type:
    NotificationType;

  title:
    string;

  body:
    string;

  status:
    string;

  referenceId:
    string;

  href:
    | "/admin/booking"
    | "/admin/cafe"
    | "/admin/members"
    | "/admin/tournament";

  createdAt:
    string;

  time:
    string;

  icon:
    string;
}

export interface NotificationResponse {
  success:
    boolean;

  serverTime:
    string;

  count:
    number;

  data:
    AdminNotification[];
}

/* =========================================================
   FETCH
========================================================= */

async function apiFetch<T>(
  path:
    string,
): Promise<T> {
  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );

  const data =
    await response.json();

  if (
    !response.ok
  ) {
    throw new Error(
      data?.message ||
        "Notification request failed",
    );
  }

  return data as T;
}

/* =========================================================
   API
========================================================= */

export const notificationApi = {
  list(
    since?:
      string,
  ) {
    const query =
      since
        ? `?since=${encodeURIComponent(
            since,
          )}`
        : "";

    return apiFetch<NotificationResponse>(
      `/admin-notifications${query}`,
    );
  },
};