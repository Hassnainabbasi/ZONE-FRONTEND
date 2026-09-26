const API_URL =
  import.meta.env['VITE_API_URL'] ||
  "http://localhost:5000/api";

/* =========================================================
   TYPES
========================================================= */

export interface RevenueKpis {
  todayRevenue:
    number;

  yesterdayRevenue:
    number;

  todayDelta:
    number;

  monthRevenue:
    number;

  allTimeRevenue:
    number;

  gamingRevenue:
    number;

  cafeRevenue:
    number;

  membershipRevenue:
    number;

  tournamentRevenue:
    number;
}

export interface DailyRevenue {
  date:
    string;

  day:
    string;

  gaming:
    number;

  cafe:
    number;

  other:
    number;

  total:
    number;
}

export interface RevenueSplit {
  name:
    string;

  amount:
    number;

  value:
    number;
}

export interface MonthlyRevenue {
  key:
    string;

  month:
    string;

  revenue:
    number;
}

export interface RevenueAnalytics {
  kpis:
    RevenueKpis;

  daily:
    DailyRevenue[];

  revenueSplit:
    RevenueSplit[];

  monthly:
    MonthlyRevenue[];

  transactionCount:
    number;
}

export interface RevenueResponse {
  success:
    boolean;

  generatedAt:
    string;

  data:
    RevenueAnalytics;
}

/* =========================================================
   ERROR
========================================================= */

export class RevenueApiError
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
      "RevenueApiError";

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
    throw new RevenueApiError(
      data?.message ||
        `Revenue API request failed with status ${response.status}`,

      response.status,

      data,
    );
  }

  return data as T;
}

/* =========================================================
   API
========================================================= */

export const revenueApi = {
  analytics() {
    return apiFetch<RevenueResponse>(
      "/revenue/analytics",
    );
  },
};