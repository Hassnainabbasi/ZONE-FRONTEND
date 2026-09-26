const API_URL =
  import.meta.env['VITE_API_URL'] ||
  "http://localhost:5000/api";

/* =========================================================
   TYPES
========================================================= */

export type PaymentStatus =
  | "Unpaid"
  | "Partial"
  | "Paid"
  | "Refunded";

export interface BookingSystemGame {
  name:
    string;

  enabled:
    boolean;
}

export interface BookingSystem {
  name:
    string;

  label?:
    string;

  stations?:
    number;

  stationCount?:
    number;

  totalStations?:
    number;

  pricePerHour?:
    number;

  rate?:
    number;

  games?:
    BookingSystemGame[];
}

export interface BookingConfig {
  _id?:
    string;

  bookingEnabled:
    boolean;

  openingTime:
    string;

  closingTime:
    string;

  durations:
    number[];

  paymentMethods:
    string[];

  systems:
    BookingSystem[];

  durationDiscounts?: {
    hours:
      number;

    discountPercentage:
      number;
  }[];
}

export interface PriceData {
  pricingPlanId?:
    string | null;

  pricingPlanName?:
    string;

  packageType?:
    string;

  packageStartTime?:
    string;

  packageEndTime?:
    string;

  hours:
    number;

  stations:
    number;

  pricePerHour:
    number;

  subtotal:
    number;

  discountPercentage:
    number;

  discountAmount:
    number;

  totalBeforeMembership:
    number;

  membershipTierName:
    string;

  membershipDiscountPercentage:
    number;

  membershipDiscountAmount:
    number;

  totalAfterMembership:
    number;

  pointsAvailable:
    number;

  pointsUsed:
    number;

  pointsDiscount:
    number;

  totalAmount:
    number;
}

export interface PaymentHistory {
  _id?:
    string;

  type?:
    "Payment" |
    "Refund";

  amount:
    number;

  method:
    string;

  note?:
    string;

  createdAt?:
    string;

  receivedAt?:
    string;
}

export interface Booking {
  _id:
    string;

  bookingId:
    string;

  customer: {
    name:
      string;

    phone:
      string;

    email?:
      string;
  };

  bookingDate:
    string;

  startTime:
    string;

  duration:
    number;

  systemType:
    string;

  gameId?:
    string | null;

  game:
    string;

  stations:
    number[];

  bookingType:
    "Online" |
    "Walk-in";

  paymentMethod:
    string;

  paymentStatus:
    PaymentStatus;

  paidAmount:
    number;

  dueAmount:
    number;

  paymentHistory?:
    PaymentHistory[];

  bookingStatus:
    | "Pending"
    | "Confirmed"
    | "Cancelled"
    | "Completed"
    | "Refunded";

  pricePerHour:
    number;

  subtotal:
    number;

  discountPercentage:
    number;

  discountAmount:
    number;

  totalBeforeMembership:
    number;

  totalAfterMembership:
    number;

  totalAmount:
    number;

  loyalty?: {
    memberId?:
      string | null;

    memberCode?:
      string;

    membershipTierName?:
      string;

    membershipDiscountPercentage?:
      number;

    membershipDiscountAmount?:
      number;

    pointsUsed?:
      number;

    pointsDiscount?:
      number;

    pointsRestored?:
      boolean;

    pointsEarned?:
      number;
  };

  package?: {
    pricingPlanId?:
      string | null;

    pricingPlanName?:
      string;

    packageType?:
      string;

    packagePrice?:
      number;

    durationHours?:
      number;

    startTime?:
      string;

    endTime?:
      string;

    discountPercent?:
      number;
  };

  notes?:
    string;

  createdAt:
    string;

  updatedAt?:
    string;
}

export interface CalendarSummary {
  date:
    string;

  bookings:
    number;

  revenue:
    number;
}

/* =========================================================
   ERROR
========================================================= */

export class ApiError
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
      "ApiError";

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
    throw new ApiError(
      data?.message ||
        `Request failed: ${response.status}`,

      response.status,

      data,
    );
  }

  return data as T;
}

/* =========================================================
   QUERY
========================================================= */

function buildQuery(
  values: Record<
    string,
    | string
    | number
    | undefined
    | null
  >,
) {
  const query =
    new URLSearchParams();

  Object.entries(
    values,
  ).forEach(
    ([
      key,
      value,
    ]) => {
      if (
        value !==
          undefined &&
        value !==
          null &&
        value !== "" &&
        value !== "all"
      ) {
        query.set(
          key,

          String(
            value,
          ),
        );
      }
    },
  );

  const string =
    query.toString();

  return string
    ? `?${string}`
    : "";
}

/* =========================================================
   API
========================================================= */

export const bookingApi = {
  /* CONFIG */

  getConfig() {
    return apiFetch<{
      success:
        boolean;

      data:
        BookingConfig;
    }>(
      "/bookings/config",
    );
  },

  updateConfig(
    payload:
      Partial<BookingConfig>,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        BookingConfig;
    }>(
      "/bookings/config",

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

  /* AVAILABILITY */

  getAvailability(
    payload: {
      date:
        string;

      startTime:
        string;

      hours:
        number;

      systemType:
        string;

      pricingPlanId?:
        string | null;
    },
  ) {
    const query =
      buildQuery({
        date:
          payload.date,

        startTime:
          payload.startTime,

        hours:
          payload.hours,

        systemType:
          payload.systemType,

        pricingPlanId:
          payload.pricingPlanId,
      });

    return apiFetch<{
      success:
        boolean;

      data: {
        date:
          string;

        startTime:
          string;

        duration:
          number;

        occupiedStations:
          number[];

        availableStations:
          number[];
      };
    }>(
      `/bookings/availability${query}`,
    );
  },

  /* PRICE */

  calculate(
    payload: {
      hours:
        number;

      stations:
        number[];

      systemType:
        string;

      gameId?:
        string | null;

      pricingPlanId?:
        string | null;

      usePoints?:
        boolean;
    },
  ) {
    return apiFetch<{
      success:
        boolean;

      data:
        PriceData;
    }>(
      "/bookings/calculate",

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

  /* CREATE */

  create(
    payload: {
      customer: {
        name:
          string;

        phone:
          string;

        email?:
          string;
      };

      bookingDate:
        string;

      startTime:
        string;

      duration:
        number;

      stations:
        number[];

      systemType:
        string;

      gameId?:
        string | null;

      pricingPlanId?:
        string | null;

      bookingType:
        "Online" |
        "Walk-in";

      paymentMethod:
        string;

      usePoints?:
        boolean;

      notes?:
        string;
    },
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        Booking;
    }>(
      "/bookings",

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

  /* =======================================================
     ADMIN LIST
  ======================================================= */

  list(
    params: {
      search?:
        string;

      systemType?:
        string;

      paymentStatus?:
        string;

      bookingType?:
        string;

      bookingStatus?:
        string;

      page?:
        number;

      limit?:
        number;

      sort?:
        string;
    } = {},
  ) {
    const query =
      buildQuery({
        search:
          params.search,

        systemType:
          params.systemType,

        paymentStatus:
          params.paymentStatus,

        bookingType:
          params.bookingType,

        bookingStatus:
          params.bookingStatus,

        page:
          params.page,

        limit:
          params.limit,

        sort:
          params.sort,
      });

    return apiFetch<{
      success:
        boolean;

      data:
        Booking[];

      pagination: {
        total:
          number;

        page:
          number;

        limit:
          number;

        pages:
          number;
      };
    }>(
      `/bookings${query}`,
    );
  },

  get(
    id:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      data:
        Booking;
    }>(
      `/bookings/${id}`,
    );
  },

  confirm(
    id:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        Booking;
    }>(
      `/bookings/${id}/confirm`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify({}),
      },
    );
  },

  complete(
    id:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        unknown;
    }>(
      `/bookings/${id}/complete`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify({}),
      },
    );
  },

  addPayment(
    id:
      string,

    payload: {
      amount:
        number;

      method:
        string;

      note?:
        string;
    },
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        Booking;
    }>(
      `/bookings/${id}/payment`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );
  },

  cancel(
    id:
      string,

    reason =
      "Cancelled by admin",
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        Booking;
    }>(
      `/bookings/${id}/cancel`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            reason,
          }),
      },
    );
  },

  refund(
    id:
      string,

    payload?: {
      amount?:
        number;

      reason?:
        string;
    },
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        Booking;
    }>(
      `/bookings/${id}/refund`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify(
            payload ||
              {},
          ),
      },
    );
  },

  getCalendarSummary() {
    return apiFetch<{
      success:
        boolean;

      data:
        CalendarSummary[];
    }>(
      "/bookings/calendar-summary",
    );
  },

  /* Alias */

  calendarSummary() {
    return this.getCalendarSummary();
  },
};