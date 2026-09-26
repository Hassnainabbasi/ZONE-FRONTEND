const API_URL =
  import.meta.env['VITE_API_URL'] ||
  "http://localhost:5000/api";

export type LiveStationStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "maintenance";

export interface LiveBookingInfo {
  _id?: string;

  bookingId?: string;

  customerName?: string;

  phone?: string;

  game?: string;

  bookingDate: string;

  startTime: string;

  duration: number;

  bookingStatus?: string;

  minutesUntil?: number;

  startAt?: string;

  endAt?: string;
}

export interface LiveStation {
  stationNumber: number;

  stationId: string;

  status:
    LiveStationStatus;

  minutesLeft:
    number | null;

  currentBooking:
    LiveBookingInfo | null;

  nextBooking:
    LiveBookingInfo | null;
}

export interface GamingSystem {
  _id: string;

  name: string;

  label: string;

  slug: string;

  totalStations: number;

  pricePerHour: number;

  tag: string;

  specs: string[];

  maintenanceStations: number[];

  active: boolean;

  publicVisible: boolean;

  sortOrder: number;

  stations?: LiveStation[];

  stats?: {
    total: number;

    available: number;

    occupied: number;

    reserved: number;

    maintenance: number;
  };

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateGamingSystemPayload {
  name: string;

  label: string;

  totalStations: number;

  pricePerHour: number;

  tag?: string;

  specs?: string[];

  active?: boolean;

  publicVisible?: boolean;

  sortOrder?: number;
}

/* =========================================================
   ERROR
========================================================= */

export class SystemApiError
  extends Error {
  status: number;

  data?: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown,
  ) {
    super(
      message,
    );

    this.name =
      "SystemApiError";

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
    throw new SystemApiError(
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

export const systemApi = {
  publicList() {
    return apiFetch<{
      success: boolean;

      generatedAt: string;

      data: GamingSystem[];
    }>(
      "/systems/public",
    );
  },

  adminList() {
    return apiFetch<{
      success: boolean;

      data: GamingSystem[];
    }>(
      "/systems",
    );
  },

  liveMonitor() {
    return apiFetch<{
      success: boolean;

      generatedAt: string;

      data: GamingSystem[];
    }>(
      "/systems/monitor",
    );
  },

  create(
    payload:
      CreateGamingSystemPayload,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data: GamingSystem;
    }>(
      "/systems",

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
      Partial<CreateGamingSystemPayload>,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data: GamingSystem;
    }>(
      `/systems/${id}`,

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

  setMaintenance(
    id: string,

    stationNumber: number,

    maintenance: boolean,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data: GamingSystem;
    }>(
      `/systems/${id}/maintenance`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            stationNumber,

            maintenance,
          }),
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
      `/systems/${id}`,

      {
        method:
          "DELETE",
      },
    );
  },
};