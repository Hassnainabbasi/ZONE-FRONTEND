const API_URL =
  import.meta.env['VITE_API_URL'] ||
  "http://localhost:5000/api";

/* =========================================================
   TYPES
========================================================= */

export type GamePlatform =
  | "PC"
  | "PS5"
  | "Both";

export type GameCategory =
  | "FPS"
  | "Racing"
  | "Sports"
  | "Fighting"
  | "Action"
  | "Adventure"
  | "Battle Royale"
  | "Strategy"
  | "Other";

export interface Game {
  _id: string;

  title: string;

  slug: string;

  category: GameCategory;

  genre: string;

  platform: GamePlatform;

  rate: number;

  poster: string;

  players: string;

  active: boolean;

  featured: boolean;

  description: string;

  sortOrder: number;

  createdAt: string;

  updatedAt: string;
}

export interface CreateGamePayload {
  title: string;

  category: GameCategory;

  genre?: string;

  platform: GamePlatform;

  rate?: number;

  poster?: string;

  players?: string;

  active?: boolean;

  featured?: boolean;

  description?: string;

  sortOrder?: number;
}

export interface GameListParams {
  search?: string;

  category?: string;

  platform?: string;

  active?: boolean;

  featured?: boolean;

  page?: number;

  limit?: number;
}

/* =========================================================
   API ERROR
========================================================= */

export class GameApiError extends Error {
  status: number;

  data?: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown,
  ) {
    super(message);

    this.name =
      "GameApiError";

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
  const url =
    `${API_URL}${path}`;

  console.log(
    "Game API request:",
    url,
  );

  const response =
    await fetch(
      url,
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

  if (!response.ok) {
    throw new GameApiError(
      data?.message ||
        `Game API request failed with status ${response.status}`,

      response.status,

      data,
    );
  }

  return data as T;
}

/* =========================================================
   QUERY BUILDER
========================================================= */

function buildQuery(
  params: GameListParams,
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
      "all" &&
    params.category !==
      "All"
  ) {
    query.set(
      "category",
      params.category,
    );
  }

  if (
    params.platform &&
    params.platform !==
      "all" &&
    params.platform !==
      "All"
  ) {
    query.set(
      "platform",
      params.platform,
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

  if (
    params.featured !==
    undefined
  ) {
    query.set(
      "featured",
      String(
        params.featured,
      ),
    );
  }

  if (
    params.page !==
    undefined
  ) {
    query.set(
      "page",
      String(
        params.page,
      ),
    );
  }

  if (
    params.limit !==
    undefined
  ) {
    query.set(
      "limit",
      String(
        params.limit,
      ),
    );
  }

  const string =
    query.toString();

  return string
    ? `?${string}`
    : "";
}

/* =========================================================
   GAME API
========================================================= */

export const gameApi = {
  /* =======================================================
     ADMIN LIST
  ======================================================= */

  list(
    params:
      GameListParams = {},
  ) {
    return apiFetch<{
      success: boolean;

      data: Game[];

      pagination: {
        total: number;

        page: number;

        limit: number;

        pages: number;
      };
    }>(
      `/games${buildQuery(
        params,
      )}`,
    );
  },

  /* =======================================================
     PUBLIC ACTIVE GAMES

     Example:

     gameApi.publicList({
       platform: "PC",
     })
  ======================================================= */

  publicList(
    params: {
      category?: string;

      platform?: string;
    } = {},
  ) {
    const query =
      new URLSearchParams();

    if (
      params.category &&
      params.category !==
        "All" &&
      params.category !==
        "all"
    ) {
      query.set(
        "category",
        params.category,
      );
    }

    if (
      params.platform &&
      params.platform !==
        "All" &&
      params.platform !==
        "all"
    ) {
      query.set(
        "platform",
        params.platform,
      );
    }

    const queryString =
      query.toString();

    return apiFetch<{
      success: boolean;

      data: Game[];
    }>(
      `/games/public${
        queryString
          ? `?${queryString}`
          : ""
      }`,
    );
  },

  /* =======================================================
     SINGLE
  ======================================================= */

  getById(
    id: string,
  ) {
    if (!id) {
      return Promise.reject(
        new GameApiError(
          "Game ID is required",
          400,
        ),
      );
    }

    return apiFetch<{
      success: boolean;

      data: Game;
    }>(
      `/games/${id}`,
    );
  },

  /* =======================================================
     CREATE
  ======================================================= */

  create(
    payload:
      CreateGamePayload,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data: Game;
    }>(
      "/games",
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
     UPDATE
  ======================================================= */

  update(
    id: string,

    payload:
      Partial<CreateGamePayload>,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data: Game;
    }>(
      `/games/${id}`,
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

  /* =======================================================
     STATUS
  ======================================================= */

  toggleStatus(
    id: string,

    active: boolean,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;

      data: Game;
    }>(
      `/games/${id}/status`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            active,
          }),
      },
    );
  },

  /* =======================================================
     DELETE
  ======================================================= */

  delete(
    id: string,
  ) {
    return apiFetch<{
      success: boolean;

      message: string;
    }>(
      `/games/${id}`,
      {
        method:
          "DELETE",
      },
    );
  },
};