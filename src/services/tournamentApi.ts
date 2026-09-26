const API_URL =
  import.meta.env['VITE_API_URL'] ||
  "http://localhost:5000/api";

/* =========================================================
   TYPES
========================================================= */

export type TournamentStatus =
  | "Upcoming"
  | "Live"
  | "Completed"
  | "Cancelled";

export type RegistrationStatus =
  | "Pending"
  | "Approved"
  | "Denied"
  | "Cancelled";

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Waived";

export type MatchStatus =
  | "Scheduled"
  | "Live"
  | "Completed"
  | "Cancelled";

/* =========================================================
   LEADERBOARD
========================================================= */

export interface LeaderboardRow {
  _id?: string;

  rank:
    number;

  team:
    string;

  game:
    string;

  streak:
    string;

  points:
    number;
}

/* =========================================================
   TOURNAMENT
========================================================= */

export interface Tournament {
  _id:
    string;

  name:
    string;

  slug:
    string;

  game:
    string;

  description:
    string;

  tournamentDate:
    string;

  startTime:
    string;

  teamSize:
    number;

  maxTeams:
    number;

  entryFee:
    number;

  prizePool:
    number;

  format:
    string;

  finalsFormat:
    string;

  registrationStatus:
    "Open" |
    "Closed";

  status:
    TournamentStatus;

  active:
    boolean;

  approvedTeams?:
    number;

  pendingTeams?:
    number;

  availableSlots?:
    number;

  leaderboard:
    LeaderboardRow[];

  createdAt?:
    string;

  updatedAt?:
    string;
}

/* =========================================================
   REGISTRATION
========================================================= */

export interface TournamentRegistration {
  _id:
    string;

  tournamentId:
    Tournament |
    string;

  teamName:
    string;

  captainName:
    string;

  captainGameId:
    string;

  phone:
    string;

  email?:
    string;

  status:
    RegistrationStatus;

  paymentStatus:
    PaymentStatus;

  paymentMethod?:
    string;

  paymentNote?:
    string;

  adminNote?:
    string;

  paidAt?:
    string | null;

  approvedAt?:
    string | null;

  deniedAt?:
    string | null;

  createdAt:
    string;

  updatedAt?:
    string;
}

/* =========================================================
   MATCH
========================================================= */

export interface TournamentMatch {
  _id:
    string;

  tournamentId:
    string;

  round:
    string;

  roundOrder:
    number;

  matchNumber:
    number;

  teamARegistrationId?:
    string | null;

  teamBRegistrationId?:
    string | null;

  teamAName:
    string;

  teamBName:
    string;

  teamAScore:
    number;

  teamBScore:
    number;

  winnerRegistrationId?:
    string | null;

  winnerName:
    string;

  status:
    MatchStatus;

  scheduledDate:
    string;

  scheduledTime:
    string;

  adminNote?:
    string;

  createdAt?:
    string;

  updatedAt?:
    string;
}

/* =========================================================
   ERROR
========================================================= */

export class TournamentApiError
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
      "TournamentApiError";

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
    throw new TournamentApiError(
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
  params: Record<
    string,
    | string
    | number
    | undefined
  >,
) {
  const query =
    new URLSearchParams();

  Object.entries(
    params,
  ).forEach(
    ([
      key,
      value,
    ]) => {
      if (
        value !==
          undefined &&
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

  const result =
    query.toString();

  return result
    ? `?${result}`
    : "";
}

/* =========================================================
   API
========================================================= */

export const tournamentApi = {
  /* =======================================================
     PUBLIC
  ======================================================= */

  publicList() {
    return apiFetch<{
      success:
        boolean;

      data:
        Tournament[];
    }>(
      "/tournaments/public",
    );
  },

  register(
    payload: {
      tournamentId:
        string;

      teamName:
        string;

      captainName:
        string;

      captainGameId:
        string;

      phone:
        string;

      email?:
        string;
    },
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data?:
        TournamentRegistration;
    }>(
      "/tournaments/register",

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
     ADMIN TOURNAMENTS
  ======================================================= */

  adminList() {
    return apiFetch<{
      success:
        boolean;

      data:
        Tournament[];
    }>(
      "/tournaments",
    );
  },

  create(
    payload:
      Partial<Tournament>,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        Tournament;
    }>(
      "/tournaments",

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
    id:
      string,

    payload:
      Partial<Tournament>,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        Tournament;
    }>(
      `/tournaments/${id}`,

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
     REGISTRATIONS
  ======================================================= */

  registrations(
    status =
      "all",

    tournamentId?:
      string,
  ) {
    const query =
      buildQuery({
        status,

        tournamentId,
      });

    return apiFetch<{
      success:
        boolean;

      data:
        TournamentRegistration[];
    }>(
      `/tournaments/registrations/all${query}`,
    );
  },

  markPaid(
    id:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data?:
        TournamentRegistration;
    }>(
      `/tournaments/registrations/${id}/payment`,

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

  approve(
    id:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data?:
        TournamentRegistration;
    }>(
      `/tournaments/registrations/${id}/approve`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            adminNote:
              "Approved by Cyber Xtream admin",
          }),
      },
    );
  },

  deny(
    id:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data?:
        TournamentRegistration;
    }>(
      `/tournaments/registrations/${id}/deny`,

      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            adminNote:
              "Denied by Cyber Xtream admin",
          }),
      },
    );
  },

  /* =======================================================
     BRACKET
  ======================================================= */

  getBracket(
    tournamentId:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      data:
        TournamentMatch[];
    }>(
      `/tournaments/${tournamentId}/bracket`,
    );
  },

  generateBracket(
    tournamentId:
      string,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        TournamentMatch[];
    }>(
      `/tournaments/${tournamentId}/bracket/generate`,

      {
        method:
          "POST",

        body:
          JSON.stringify({}),
      },
    );
  },

  updateMatch(
    id:
      string,

    payload:
      Partial<TournamentMatch>,
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        TournamentMatch;
    }>(
      `/tournaments/matches/${id}`,

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

  /* =======================================================
     LEADERBOARD
  ======================================================= */

  updateLeaderboard(
    tournamentId:
      string,

    leaderboard:
      LeaderboardRow[],
  ) {
    return apiFetch<{
      success:
        boolean;

      message:
        string;

      data:
        Tournament;
    }>(
      `/tournaments/${tournamentId}/leaderboard`,

      {
        method:
          "PUT",

        body:
          JSON.stringify({
            leaderboard,
          }),
      },
    );
  },
};