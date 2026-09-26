const API_URL =
  import.meta.env['VITE_API_URL'] ||
  "https://zone-backend.vercel.app/api";

export type PricingSystemType =
  | "PC"
  | "PS5"
  | "VR"
  | "Other";

export type PricingPackageType =
  | "Hourly"
  | "Night"
  | "Day"
  | "Custom";

export interface PricingPlan {
  _id: string;

  name: string;

  slug: string;

  systemType:
    PricingSystemType;

  packageType:
    PricingPackageType;

  price: number;

  unit: string;

  durationHours: number;

  startTime: string;

  endTime: string;

  discountPercent: number;

  perks: string[];

  description: string;

  highlight: boolean;

  active: boolean;

  sortOrder: number;

  createdAt?: string;

  updatedAt?: string;
}

class PricingApiError
  extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "PricingApiError";

    this.status =
      status;
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
    throw new PricingApiError(
      data?.message ||
        `Request failed: ${response.status}`,
      response.status,
    );
  }

  return data as T;
}

export const pricingApi = {
  publicList() {
    return apiFetch<{
      success: boolean;
      data: PricingPlan[];
    }>(
      "/pricing/public",
    );
  },

  adminList() {
    return apiFetch<{
      success: boolean;
      data: PricingPlan[];
    }>(
      "/pricing",
    );
  },

  create(
    payload:
      Partial<PricingPlan>,
  ) {
    return apiFetch<{
      success: boolean;
      message: string;
      data: PricingPlan;
    }>(
      "/pricing",
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

  update(
    id: string,
    payload:
      Partial<PricingPlan>,
  ) {
    return apiFetch<{
      success: boolean;
      message: string;
      data: PricingPlan;
    }>(
      `/pricing/${id}`,
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

  remove(
    id: string,
  ) {
    return apiFetch<{
      success: boolean;
      message: string;
    }>(
      `/pricing/${id}`,
      {
        method:
          "DELETE",
      },
    );
  },
};