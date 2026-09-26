const API_URL =
  import.meta.env["VITE_API_URL"] ||
  "http://localhost:5000/api";

export type MembershipAccent =
  | "silver"
  | "gold"
  | "vip";

export type MembershipStatus =
  | "Active"
  | "Inactive"
  | "Expired";

export type MembershipRequestStatus =
  | "Pending"
  | "Approved"
  | "Denied"
  | "Cancelled";

export type MembershipPaymentStatus =
  | "Pending"
  | "Paid";

export interface MembershipTier {
  _id:
    string;

  name:
    string;

  slug:
    string;

  price:
    number;

  durationMonths:
    number;

  minHours:
    number;

  pointsPerHour:
    number;

  gamingDiscountPercent:
    number;

  cafeDiscountPercent:
    number;

  accent:
    MembershipAccent;

  perks:
    string[];

  maxMembers:
    number;

  memberCount?:
    number;

  availableSlots?:
    number | null;

  active:
    boolean;

  sortOrder:
    number;
}

export interface PointHistoryItem {
  _id?:
    string;

  type:
    string;

  points:
    number;

  note:
    string;

  bookingId?:
    string;

  createdAt:
    string;
}

export interface MemberBooking {
  _id:
    string;

  bookingId:
    string;

  bookingDate:
    string;

  startTime:
    string;

  duration:
    number;

  systemType:
    string;

  game:
    string;

  stations:
    number[];

  totalAmount:
    number;

  bookingStatus:
    string;

  paymentStatus:
    string;
}

export interface Member {
  _id:
    string;

  memberId:
    string;

  userId?:
    string | null;

  name:
    string;

  phone:
    string;

  email?:
    string;

  hoursPlayed:
    number;

  points:
    number;

  membershipTierId?:
    string | null;

  membershipTierName?:
    string;

  membershipStatus:
    MembershipStatus;

  membershipStartedAt?:
    string | null;

  membershipExpiresAt?:
    string | null;

  active:
    boolean;

  pointHistory?:
    PointHistoryItem[];
}

export interface MemberDetails
  extends Member {
  pointHistory:
    PointHistoryItem[];

  bookings:
    MemberBooking[];
}

export interface MemberStats {
  totalMembers:
    number;

  vipMembers:
    number;

  pointsIssuedThisMonth:
    number;

  churnRisk:
    number;
}

export interface MembershipRequestMember {
  _id:
    string;

  memberId:
    string;

  name:
    string;

  phone:
    string;

  email?:
    string;

  points:
    number;

  hoursPlayed:
    number;

  membershipStatus:
    MembershipStatus;

  membershipTierName?:
    string;

  membershipStartedAt?:
    string | null;

  membershipExpiresAt?:
    string | null;
}

export interface MembershipRequest {
  _id:
    string;

  userId:
    string;

  memberId:
    | string
    | MembershipRequestMember;

  tierId:
    | string
    | MembershipTier;

  tierName:
    string;

  tierPrice:
    number;

  status:
    MembershipRequestStatus;

  paymentStatus:
    MembershipPaymentStatus;

  paymentMethod?:
    string;

  paymentNote?:
    string;

  adminNote?:
    string;

  requestedAt:
    string;

  approvedAt?:
    string | null;

  deniedAt?:
    string | null;

  createdAt:
    string;
}

/* =========================================================
   ERROR
========================================================= */

export class MembershipApiError
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
      "MembershipApiError";

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
    throw new MembershipApiError(
      data?.message ||
        `Request failed: ${response.status}`,

      response.status,

      data,
    );
  }

  return data as T;
}

/* =========================================================
   API
========================================================= */

export const membershipApi = {
  publicTiers() {
    return apiFetch<{
      success:
        boolean;

      data:
        MembershipTier[];
    }>(
      "/membership/tiers/public",
    );
  },

  requestMembership(
    tierId:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        MembershipRequest;
    }>(
      "/membership/requests",

      {
        method:
          "POST",

        body:
          JSON.stringify({
            tierId,
          }),
      },
    );
  },

  myRequest() {
    return apiFetch<{
      success:
        boolean;

      data:
        MembershipRequest | null;
    }>(
      "/membership/my-request",
    );
  },

  myProfile() {
    return apiFetch<{
      success:
        boolean;

      data:
        MemberDetails;
    }>(
      "/membership/me",
    );
  },

  getTiers() {
    return apiFetch<{
      success:
        boolean;

      data:
        MembershipTier[];
    }>(
      "/membership/tiers",
    );
  },

  updateTier(
    id:
      string,

    payload:
      Partial<MembershipTier>,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        MembershipTier;
    }>(
      `/membership/tiers/${id}`,

      {
        method:
          "PUT",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );
  },

  getRequests(
    status =
      "all",
  ) {
    const query =
      status ===
        "all"
        ? ""
        : `?status=${encodeURIComponent(
            status,
          )}`;

    return apiFetch<{
      success:
        boolean;

      data:
        MembershipRequest[];
    }>(
      `/membership/requests${query}`,
    );
  },

  markRequestPaid(
    id:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;
    }>(
      `/membership/requests/${id}/payment`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            paymentMethod:
              "Manual",

            paymentNote:
              "Payment confirmed by admin",
          }),
      },
    );
  },

  approveRequest(
    id:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;
    }>(
      `/membership/requests/${id}/approve`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            adminNote:
              "Approved by admin",
          }),
      },
    );
  },

  denyRequest(
    id:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;
    }>(
      `/membership/requests/${id}/deny`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            adminNote:
              "Denied by admin",
          }),
      },
    );
  },

  getMembers() {
    return apiFetch<{
      success:
        boolean;

      data:
        Member[];
    }>(
      "/membership/members?limit=500",
    );
  },

  getMember(
    id:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      data:
        MemberDetails;
    }>(
      `/membership/members/${id}`,
    );
  },

  adjustPoints(
    id:
      string,

    points:
      number,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        Member;
    }>(
      `/membership/members/${id}/points`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            points,

            note:
              "Admin manual adjustment",
          }),
      },
    );
  },

  getStats() {
    return apiFetch<{
      success:
        boolean;

      data:
        MemberStats;
    }>(
      "/membership/stats",
    );
  },
};