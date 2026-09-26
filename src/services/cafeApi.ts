const API_URL =
  import.meta.env["VITE_API_URL"] ||
  "http://localhost:3000/api";

export type CafeCategory =
  | "Drinks"
  | "Hot Drinks"
  | "Fast Food"
  | "Snacks"
  | "Desserts"
  | "Other";

export type CafeOrderStatus =
  | "Pending"
  | "Preparing"
  | "Served"
  | "Cancelled";

export type CafePaymentStatus =
  | "Unpaid"
  | "Paid";

export type CafeOrderSource =
  | "Admin"
  | "Web"
  | "Counter"
  | "Station";

export interface CafeItem {
  _id: string;

  name: string;

  slug: string;

  category:
    CafeCategory;

  price: number;

  stock: number;

  lowStockAt: number;

  image: string;

  description: string;

  active: boolean;

  sortOrder: number;

  createdAt: string;

  updatedAt: string;
}

export interface CafeOrderItem {
  itemId: string;

  name: string;

  quantity: number;

  unitPrice: number;

  total: number;
}

export interface CafeOrder {
  _id: string;

  orderId: string;

  station: string;

  customerName: string;

  bookingId: string;

  orderSource:
    CafeOrderSource;

  items:
    CafeOrderItem[];

  subtotal: number;

  discountAmount: number;

  totalAmount: number;

  status:
    CafeOrderStatus;

  paymentStatus:
    CafePaymentStatus;

  paymentMethod: string;

  notes: string;

  createdAt: string;

  updatedAt: string;
}

export interface CafeStats {
  salesToday: number;

  totalOrdersToday:
    number;

  itemsSoldToday: number;

  openOrders: number;

  averageOrderValue:
    number;

  lowStockItems:
    number;
}

export interface TopSellingItem {
  _id: string;

  name: string;

  quantitySold: number;

  sales: number;
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

        headers: {
          "Content-Type":
            "application/json",

          ...options.headers,
        },
      },
    );

  let data: any = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Cafe API request failed",
    );
  }

  return data;
}

export const cafeApi = {
  getItems(
    params: {
      search?: string;

      category?: string;

      active?: boolean;
    } = {},
  ) {
    const query =
      new URLSearchParams();

    if (
      params.search
    ) {
      query.set(
        "search",
        params.search,
      );
    }

    if (
      params.category &&
      params.category !==
        "all"
    ) {
      query.set(
        "category",
        params.category,
      );
    }

    if (
      params.active !==
      undefined
    ) {
      query.set(
        "active",
        String(
          params.active,
        ),
      );
    }

    const string =
      query.toString();

    return apiFetch<{
      success: boolean;

      data:
        CafeItem[];
    }>(
      `/cafe/items${
        string
          ? `?${string}`
          : ""
      }`,
    );
  },

  createItem(
    payload: {
      name: string;

      category:
        CafeCategory;

      price: number;

      stock: number;

      lowStockAt?: number;

      image?: string;

      description?: string;

      active?: boolean;

      sortOrder?: number;
    },
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data:
        CafeItem;
    }>(
      "/cafe/items",
      {
        method: "POST",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );
  },

  updateItem(
    id: string,

    payload:
      Partial<CafeItem>,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data:
        CafeItem;
    }>(
      `/cafe/items/${id}`,
      {
        method: "PUT",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );
  },

  deleteItem(
    id: string,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;
    }>(
      `/cafe/items/${id}`,
      {
        method:
          "DELETE",
      },
    );
  },

  getOrders(
    params: {
      search?: string;

      status?: string;

      paymentStatus?: string;

      orderSource?: string;
    } = {},
  ) {
    const query =
      new URLSearchParams();

    if (
      params.search
    ) {
      query.set(
        "search",
        params.search,
      );
    }

    if (
      params.status &&
      params.status !==
        "all"
    ) {
      query.set(
        "status",
        params.status,
      );
    }

    if (
      params.paymentStatus &&
      params.paymentStatus !==
        "all"
    ) {
      query.set(
        "paymentStatus",
        params.paymentStatus,
      );
    }

    if (
      params.orderSource &&
      params.orderSource !==
        "all"
    ) {
      query.set(
        "orderSource",
        params.orderSource,
      );
    }

    const string =
      query.toString();

    return apiFetch<{
      success: boolean;

      data:
        CafeOrder[];
    }>(
      `/cafe/orders${
        string
          ? `?${string}`
          : ""
      }`,
    );
  },

  createOrder(
    payload: {
      station?: string;

      customerName?: string;

      bookingId?: string;

      orderSource?:
        CafeOrderSource;

      items: {
        itemId: string;

        quantity: number;
      }[];

      discountAmount?: number;

      paymentStatus?:
        CafePaymentStatus;

      paymentMethod?: string;

      notes?: string;
    },
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data:
        CafeOrder;
    }>(
      "/cafe/orders",
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

  updateOrderStatus(
    id: string,

    status:
      CafeOrderStatus,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data:
        CafeOrder;
    }>(
      `/cafe/orders/${id}/status`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            status,
          }),
      },
    );
  },

  updateOrderPayment(
    id: string,

    payload: {
      paymentStatus:
        CafePaymentStatus;

      paymentMethod?: string;
    },
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data:
        CafeOrder;
    }>(
      `/cafe/orders/${id}/payment`,
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

  getStats() {
    return apiFetch<{
      success: boolean;

      data:
        CafeStats;
    }>(
      "/cafe/stats",
    );
  },

  getTopItems(
    days = 30,
  ) {
    return apiFetch<{
      success: boolean;

      data:
        TopSellingItem[];
    }>(
      `/cafe/stats/top-items?days=${days}`,
    );
  },
};