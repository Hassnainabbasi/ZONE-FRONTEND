import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  Brackets,
  CheckCircle2,
  Loader2,
  Medal,
  MessageCircle,
  Minus,
  Plus,
  RefreshCcw,
  Save,
  Trophy,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Progress,
} from "@/components/ui/progress";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  PageHeader,
  StatCard,
} from "@/components/admin/AdminShell";

import {
  tournamentApi,
  type LeaderboardRow,
  type Tournament,
  type TournamentMatch,
  type TournamentRegistration,
} from "@/services/tournamentApi";

/* =========================================================
   ROUTE
========================================================= */

const title =
  "Tournaments | Arcadium Admin";

export const Route =
  createFileRoute(
    "/admin/tournament",
  )({
    head: () => ({
      meta: [
        {
          title,
        },
      ],
    }),

    component:
      TournamentsPage,
  });

/* =========================================================
   HELPERS
========================================================= */

function statusTone(
  status:
    string,
) {
  if (
    status ===
      "Approved" ||
    status ===
      "Paid" ||
    status ===
      "Completed"
  ) {
    return "border-neon-green/30 bg-neon-green/10 text-neon-green";
  }

  if (
    status ===
      "Denied" ||
    status ===
      "Cancelled"
  ) {
    return "border-neon-red/30 bg-neon-red/10 text-neon-red";
  }

  if (
    status ===
      "Live"
  ) {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  return "border-gold/30 bg-gold/10 text-gold";
}

function normalizeWhatsAppPhone(
  value =
    "",
) {
  let phone =
    value.replace(
      /\D/g,
      "",
    );

  if (
    phone.startsWith(
      "0092",
    )
  ) {
    phone =
      phone.substring(
        2,
      );
  }

  if (
    phone.startsWith(
      "0",
    )
  ) {
    phone =
      `92${phone.substring(
        1,
      )}`;
  }

  if (
    phone.length ===
      10 &&
    phone.startsWith(
      "3",
    )
  ) {
    phone =
      `92${phone}`;
  }

  return phone;
}

function openPaymentMessage(
  registration:
    TournamentRegistration,
) {
  const tournament =
    typeof registration.tournamentId ===
    "string"
      ? null
      : registration.tournamentId;

  const phone =
    normalizeWhatsAppPhone(
      registration.phone,
    );

  if (!phone) {
    toast.error(
      "Captain phone unavailable",
    );

    return;
  }

  const message = [
    `Assalam-o-Alaikum ${registration.captainName},`,

    "",

    `Your team "${registration.teamName}" registration for ${tournament?.name || "Arcadium Tournament"} has been received.`,

    "",

    `Entry Fee: Rs ${Number(
      tournament?.entryFee ||
        0,
    ).toLocaleString()}`,

    "",

    "Kindly complete the tournament entry payment and share confirmation with us.",

    "",

    "After payment verification, your team registration will be approved.",

    "",

    "Regards,",

    "Arcadium",
  ].join(
    "\n",
  );

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(
      message,
    )}`,

    "_blank",

    "noopener,noreferrer",
  );
}

/* =========================================================
   PAGE
========================================================= */

function TournamentsPage() {
  /* =======================================================
     DATA
  ======================================================= */

  const [
    tournaments,
    setTournaments,
  ] =
    useState<
      Tournament[]
    >([]);

  const [
    registrations,
    setRegistrations,
  ] =
    useState<
      TournamentRegistration[]
    >([]);

  const [
    matches,
    setMatches,
  ] =
    useState<
      TournamentMatch[]
    >([]);

  /* =======================================================
     PAGE STATE
  ======================================================= */

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState<
      string | null
    >(null);

  const [
    registrationFilter,
    setRegistrationFilter,
  ] =
    useState(
      "Pending",
    );

  const [
    selectedTournamentId,
    setSelectedTournamentId,
  ] =
    useState("");

  /* =======================================================
     CREATE EVENT
  ======================================================= */

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(
      false,
    );

  const [
    creating,
    setCreating,
  ] =
    useState(
      false,
    );

  const [
    createName,
    setCreateName,
  ] =
    useState("");

  const [
    createGame,
    setCreateGame,
  ] =
    useState("");

  const [
    createDescription,
    setCreateDescription,
  ] =
    useState("");

  const [
    createDate,
    setCreateDate,
  ] =
    useState("");

  const [
    createTime,
    setCreateTime,
  ] =
    useState("");

  const [
    createEntry,
    setCreateEntry,
  ] =
    useState(
      "0",
    );

  const [
    createPrize,
    setCreatePrize,
  ] =
    useState(
      "0",
    );

  const [
    createTeamSize,
    setCreateTeamSize,
  ] =
    useState(
      "5",
    );

  const [
    createMaxTeams,
    setCreateMaxTeams,
  ] =
    useState(
      "32",
    );

  /* =======================================================
     LEADERBOARD
  ======================================================= */

  const [
    leaderboard,
    setLeaderboard,
  ] =
    useState<
      LeaderboardRow[]
    >([]);

  /* =======================================================
     SELECTED TOURNAMENT
  ======================================================= */

  const selectedTournament =
    useMemo(
      () =>
        tournaments.find(
          (
            tournament,
          ) =>
            tournament._id ===
            selectedTournamentId,
        ) ||
        null,

      [
        tournaments,
        selectedTournamentId,
      ],
    );

  /* =======================================================
     STATS
  ======================================================= */

  const totalApproved =
    tournaments.reduce(
      (
        total,
        tournament,
      ) =>
        total +
        Number(
          tournament.approvedTeams ||
            0,
        ),

      0,
    );

  const totalPrizePool =
    tournaments.reduce(
      (
        total,
        tournament,
      ) =>
        total +
        Number(
          tournament.prizePool ||
            0,
        ),

      0,
    );

  const liveEvents =
    tournaments.filter(
      (
        tournament,
      ) =>
        tournament.status ===
        "Live",
    ).length;

  /* =======================================================
     LOAD
  ======================================================= */

  async function loadBaseData() {
    try {
      setLoading(
        true,
      );

      const [
        tournamentResponse,
        registrationResponse,
      ] =
        await Promise.all([
          tournamentApi.adminList(),

          tournamentApi.registrations(
            registrationFilter,
          ),
        ]);

      const list =
        Array.isArray(
          tournamentResponse.data,
        )
          ? tournamentResponse.data
          : [];

      setTournaments(
        list,
      );

      setRegistrations(
        Array.isArray(
          registrationResponse.data,
        )
          ? registrationResponse.data
          : [],
      );

      /*
       * Automatically select first tournament.
       */

      setSelectedTournamentId(
        (
          current,
        ) =>
          current &&
          list.some(
            (
              item,
            ) =>
              item._id ===
              current,
          )
            ? current
            : list[0]?._id ||
              "",
      );
    } catch (error) {
      console.error(
        "Tournament load:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load tournaments",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(() => {
    void loadBaseData();
  }, [
    registrationFilter,
  ]);

  /* =======================================================
     LOAD BRACKET + LEADERBOARD
  ======================================================= */

  useEffect(() => {
    if (
      !selectedTournamentId
    ) {
      setMatches(
        [],
      );

      setLeaderboard(
        [],
      );

      return;
    }

    async function loadSelected() {
      try {
        const bracketResponse =
          await tournamentApi.getBracket(
            selectedTournamentId,
          );

        setMatches(
          Array.isArray(
            bracketResponse.data,
          )
            ? bracketResponse.data
            : [],
        );
      } catch (error) {
        console.error(
          "Bracket:",
          error,
        );

        setMatches(
          [],
        );
      }

      const tournament =
        tournaments.find(
          (
            item,
          ) =>
            item._id ===
            selectedTournamentId,
        );

      setLeaderboard(
        tournament?.leaderboard
          ? tournament.leaderboard.map(
              (
                row,
              ) => ({
                ...row,
              }),
            )
          : [],
      );
    }

    void loadSelected();
  }, [
    selectedTournamentId,
    tournaments,
  ]);

  /* =======================================================
     PATCH TOURNAMENT
  ======================================================= */

  function patchTournament(
    tournamentId:
      string,

    key:
      keyof Tournament,

    value:
      unknown,
  ) {
    setTournaments(
      (current) =>
        current.map(
          (
            tournament,
          ) =>
            tournament._id ===
            tournamentId
              ? {
                  ...tournament,

                  [key]:
                    value,
                }
              : tournament,
        ),
    );
  }

  /* =======================================================
     CREATE TOURNAMENT
  ======================================================= */

  async function createTournament() {
    if (
      !createName.trim() ||
      !createGame.trim() ||
      !createDate ||
      !createTime
    ) {
      toast.error(
        "Name, game, date and start time are required",
      );

      return;
    }

    try {
      setCreating(
        true,
      );

      const response =
        await tournamentApi.create({
          name:
            createName.trim(),

          game:
            createGame.trim(),

          description:
            createDescription.trim(),

          tournamentDate:
            createDate,

          startTime:
            createTime,

          teamSize:
            Math.max(
              Number(
                createTeamSize,
              ) ||
                1,

              1,
            ),

          maxTeams:
            Math.max(
              Number(
                createMaxTeams,
              ) ||
                2,

              2,
            ),

          entryFee:
            Math.max(
              Number(
                createEntry,
              ) ||
                0,

              0,
            ),

          prizePool:
            Math.max(
              Number(
                createPrize,
              ) ||
                0,

              0,
            ),

          format:
            "Double Elimination",

          finalsFormat:
            "Best of 3",

          registrationStatus:
            "Open",

          status:
            "Upcoming",

          active:
            true,
        });

      toast.success(
        response.message,
      );

      setCreateOpen(
        false,
      );

      setCreateName("");
      setCreateGame("");
      setCreateDescription("");
      setCreateDate("");
      setCreateTime("");
      setCreateEntry("0");
      setCreatePrize("0");
      setCreateTeamSize("5");
      setCreateMaxTeams("32");

      await loadBaseData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create tournament",
      );
    } finally {
      setCreating(
        false,
      );
    }
  }

  /* =======================================================
     SAVE EVENT
  ======================================================= */

  async function saveTournament(
    tournament:
      Tournament,
  ) {
    try {
      setActionLoading(
        `event-${tournament._id}`,
      );

      const response =
        await tournamentApi.update(
          tournament._id,

          {
            name:
              tournament.name,

            game:
              tournament.game,

            description:
              tournament.description,

            tournamentDate:
              tournament.tournamentDate,

            startTime:
              tournament.startTime,

            teamSize:
              Number(
                tournament.teamSize,
              ),

            maxTeams:
              Number(
                tournament.maxTeams,
              ),

            entryFee:
              Number(
                tournament.entryFee,
              ),

            prizePool:
              Number(
                tournament.prizePool,
              ),

            format:
              tournament.format,

            finalsFormat:
              tournament.finalsFormat,

            registrationStatus:
              tournament.registrationStatus,

            status:
              tournament.status,

            active:
              tournament.active,
          },
        );

      toast.success(
        response.message,
      );

      await loadBaseData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save tournament",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     REGISTRATION PAYMENT
  ======================================================= */

  async function markRegistrationPaid(
    registration:
      TournamentRegistration,
  ) {
    try {
      setActionLoading(
        `paid-${registration._id}`,
      );

      const response =
        await tournamentApi.markPaid(
          registration._id,
        );

      toast.success(
        response.message,
      );

      await loadBaseData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to mark payment",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     APPROVE REGISTRATION
  ======================================================= */

  async function approveRegistration(
    registration:
      TournamentRegistration,
  ) {
    try {
      setActionLoading(
        `approve-${registration._id}`,
      );

      const response =
        await tournamentApi.approve(
          registration._id,
        );

      toast.success(
        response.message,
      );

      await loadBaseData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to approve registration",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     DENY REGISTRATION
  ======================================================= */

  async function denyRegistration(
    registration:
      TournamentRegistration,
  ) {
    try {
      setActionLoading(
        `deny-${registration._id}`,
      );

      const response =
        await tournamentApi.deny(
          registration._id,
        );

      toast.success(
        response.message,
      );

      await loadBaseData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to deny registration",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     GENERATE BRACKET
  ======================================================= */

  async function generateBracket() {
    if (
      !selectedTournamentId
    ) {
      toast.error(
        "Select a tournament first",
      );

      return;
    }

    try {
      setActionLoading(
        "generate-bracket",
      );

      const response =
        await tournamentApi.generateBracket(
          selectedTournamentId,
        );

      toast.success(
        response.message,
      );

      setMatches(
        response.data ||
        [],
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to generate bracket",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     PATCH MATCH
  ======================================================= */

  function patchMatch(
    id:
      string,

    key:
      keyof TournamentMatch,

    value:
      unknown,
  ) {
    setMatches(
      (current) =>
        current.map(
          (
            match,
          ) =>
            match._id ===
            id
              ? {
                  ...match,

                  [key]:
                    value,
                }
              : match,
        ),
    );
  }

  /* =======================================================
     SAVE MATCH
  ======================================================= */

  async function saveMatch(
    match:
      TournamentMatch,
  ) {
    let winnerName =
      match.winnerName;

    let winnerRegistrationId =
      match.winnerRegistrationId ||
      null;

    /*
     * If admin did not manually select a winner,
     * infer it from score.
     */

    if (
      match.teamAScore >
      match.teamBScore
    ) {
      winnerName =
        match.teamAName;

      winnerRegistrationId =
        match.teamARegistrationId ||
        null;
    } else if (
      match.teamBScore >
      match.teamAScore
    ) {
      winnerName =
        match.teamBName;

      winnerRegistrationId =
        match.teamBRegistrationId ||
        null;
    }

    try {
      setActionLoading(
        `match-${match._id}`,
      );

      const response =
        await tournamentApi.updateMatch(
          match._id,

          {
            teamAScore:
              Number(
                match.teamAScore,
              ),

            teamBScore:
              Number(
                match.teamBScore,
              ),

            status:
              match.status,

            winnerName,

            winnerRegistrationId,

            scheduledDate:
              match.scheduledDate,

            scheduledTime:
              match.scheduledTime,

            adminNote:
              match.adminNote ||
              "",
          },
        );

      toast.success(
        response.message,
      );

      setMatches(
        (
          current,
        ) =>
          current.map(
            (
              item,
            ) =>
              item._id ===
              match._id
                ? response.data
                : item,
          ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save match",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     LEADERBOARD
  ======================================================= */

  function addLeaderboardRow() {
    setLeaderboard(
      (
        current,
      ) => [
        ...current,

        {
          rank:
            current.length +
            1,

          team:
            "",

          game:
            selectedTournament?.game ||
            "",

          streak:
            "",

          points:
            0,
        },
      ],
    );
  }

  function patchLeaderboardRow(
    index:
      number,

    key:
      keyof LeaderboardRow,

    value:
      unknown,
  ) {
    setLeaderboard(
      (
        current,
      ) =>
        current.map(
          (
            row,
            rowIndex,
          ) =>
            rowIndex ===
            index
              ? {
                  ...row,

                  [key]:
                    value,
                }
              : row,
        ),
    );
  }

  function removeLeaderboardRow(
    index:
      number,
  ) {
    setLeaderboard(
      (
        current,
      ) =>
        current
          .filter(
            (
              _,
              rowIndex,
            ) =>
              rowIndex !==
              index,
          )
          .map(
            (
              row,
              rowIndex,
            ) => ({
              ...row,

              rank:
                rowIndex +
                1,
            }),
          ),
    );
  }

  async function saveLeaderboard() {
    if (
      !selectedTournamentId
    ) {
      toast.error(
        "Select a tournament",
      );

      return;
    }

    const clean =
      leaderboard
        .map(
          (
            row,
            index,
          ) => ({
            rank:
              Number(
                row.rank,
              ) ||
              index +
                1,

            team:
              row.team.trim(),

            game:
              row.game.trim(),

            streak:
              row.streak.trim(),

            points:
              Number(
                row.points,
              ) ||
              0,
          }),
        )
        .filter(
          (
            row,
          ) =>
            row.team,
        );

    try {
      setActionLoading(
        "leaderboard",
      );

      const response =
        await tournamentApi.updateLeaderboard(
          selectedTournamentId,

          clean,
        );

      toast.success(
        response.message,
      );

      setLeaderboard(
        response.data.leaderboard ||
        [],
      );

      await loadBaseData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save leaderboard",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <PageHeader
        eyebrow="Esports"
        title="Tournaments & Brackets"
        subtitle="Create tournaments, manage team registrations, payments, brackets, match results and public leaderboard."
        action={
          <div className="flex flex-wrap gap-2">

            <Button
              variant="glass"
              onClick={() =>
                void loadBaseData()
              }
            >
              <RefreshCcw className="mr-2 size-4" />

              Refresh
            </Button>

            <Dialog
              open={
                createOpen
              }
              onOpenChange={
                setCreateOpen
              }
            >

              <DialogTrigger
                asChild
              >

                <Button variant="hero">

                  <Plus className="mr-2 size-4" />

                  New Tournament

                </Button>

              </DialogTrigger>

              <DialogContent className="sm:max-w-xl">

                <DialogHeader>

                  <DialogTitle>
                    Create Tournament
                  </DialogTitle>

                  <DialogDescription>
                    Create a new public Arcadium tournament.
                  </DialogDescription>

                </DialogHeader>

                <div className="grid gap-4">

                  <div className="grid gap-1.5">

                    <Label>
                      Tournament Name
                    </Label>

                    <Input
                      value={
                        createName
                      }
                      onChange={(
                        event,
                      ) =>
                        setCreateName(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Valorant Clash Season 4"
                    />

                  </div>

                  <div className="grid gap-1.5">

                    <Label>
                      Game
                    </Label>

                    <Input
                      value={
                        createGame
                      }
                      onChange={(
                        event,
                      ) =>
                        setCreateGame(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Valorant"
                    />

                  </div>

                  <div className="grid gap-1.5">

                    <Label>
                      Description
                    </Label>

                    <Input
                      value={
                        createDescription
                      }
                      onChange={(
                        event,
                      ) =>
                        setCreateDescription(
                          event.target
                            .value,
                        )
                      }
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="grid gap-1.5">

                      <Label>
                        Date
                      </Label>

                      <Input
                        type="date"
                        value={
                          createDate
                        }
                        onChange={(
                          event,
                        ) =>
                          setCreateDate(
                            event.target
                              .value,
                          )
                        }
                      />

                    </div>

                    <div className="grid gap-1.5">

                      <Label>
                        Start Time
                      </Label>

                      <Input
                        type="time"
                        value={
                          createTime
                        }
                        onChange={(
                          event,
                        ) =>
                          setCreateTime(
                            event.target
                              .value,
                          )
                        }
                      />

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="grid gap-1.5">

                      <Label>
                        Entry Fee
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        value={
                          createEntry
                        }
                        onChange={(
                          event,
                        ) =>
                          setCreateEntry(
                            event.target
                              .value,
                          )
                        }
                      />

                    </div>

                    <div className="grid gap-1.5">

                      <Label>
                        Prize Pool
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        value={
                          createPrize
                        }
                        onChange={(
                          event,
                        ) =>
                          setCreatePrize(
                            event.target
                              .value,
                          )
                        }
                      />

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="grid gap-1.5">

                      <Label>
                        Players / Team
                      </Label>

                      <Input
                        type="number"
                        min="1"
                        value={
                          createTeamSize
                        }
                        onChange={(
                          event,
                        ) =>
                          setCreateTeamSize(
                            event.target
                              .value,
                          )
                        }
                      />

                    </div>

                    <div className="grid gap-1.5">

                      <Label>
                        Maximum Teams
                      </Label>

                      <Input
                        type="number"
                        min="2"
                        value={
                          createMaxTeams
                        }
                        onChange={(
                          event,
                        ) =>
                          setCreateMaxTeams(
                            event.target
                              .value,
                          )
                        }
                      />

                    </div>

                  </div>

                  <Button
                    variant="hero"
                    disabled={
                      creating
                    }
                    onClick={() =>
                      void createTournament()
                    }
                  >

                    {creating ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 size-4" />
                    )}

                    Create Tournament

                  </Button>

                </div>

              </DialogContent>

            </Dialog>

          </div>
        }
      />

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Tournaments"
          value={String(
            tournaments.length,
          )}
        />

        <StatCard
          label="Live Events"
          value={String(
            liveEvents,
          )}
        />

        <StatCard
          label="Approved Teams"
          value={String(
            totalApproved,
          )}
        />

        <StatCard
          label="Total Prize Pools"
          value={`Rs ${Number(
            totalPrizePool,
          ).toLocaleString()}`}
        />

      </div>

      {/* =================================================
          TABS
      ================================================= */}

      <Tabs
        defaultValue="events"
        className="mt-6"
      >

        <TabsList className="grid w-full max-w-3xl grid-cols-4">

          <TabsTrigger value="events">
            Events
          </TabsTrigger>

          <TabsTrigger value="registrations">
            Registrations
          </TabsTrigger>

          <TabsTrigger value="bracket">
            Bracket
          </TabsTrigger>

          <TabsTrigger value="leaderboard">
            Leaderboard
          </TabsTrigger>

        </TabsList>

        {/* =================================================
            EVENTS
        ================================================= */}

        <TabsContent
          value="events"
          className="mt-5"
        >

          {loading ? (

            <div className="flex justify-center py-16">

              <Loader2 className="size-7 animate-spin text-neon-cyan" />

            </div>

          ) : (

            <div className="grid gap-5 xl:grid-cols-3">

              {tournaments.map(
                (
                  tournament,
                ) => {

                  const progress =
                    tournament.maxTeams >
                    0
                      ? Math.min(
                          ((tournament.approvedTeams ||
                            0) /
                            tournament.maxTeams) *
                            100,

                          100,
                        )
                      : 0;

                  return (

                    <section
                      key={
                        tournament._id
                      }
                      className="glass-static rounded-2xl p-5"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0 flex-1">

                          <Input
                            value={
                              tournament.name
                            }
                            onChange={(
                              event,
                            ) =>
                              patchTournament(
                                tournament._id,

                                "name",

                                event.target
                                  .value,
                              )
                            }
                            className="font-display font-bold"
                          />

                          <Input
                            value={
                              tournament.game
                            }
                            onChange={(
                              event,
                            ) =>
                              patchTournament(
                                tournament._id,

                                "game",

                                event.target
                                  .value,
                              )
                            }
                            className="mt-2"
                          />

                        </div>

                        <Badge
                          variant="outline"
                          className={statusTone(
                            tournament.status,
                          )}
                        >
                          {
                            tournament.status
                          }
                        </Badge>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div>

                          <Label>
                            Date
                          </Label>

                          <Input
                            type="date"
                            value={
                              tournament.tournamentDate
                            }
                            onChange={(
                              event,
                            ) =>
                              patchTournament(
                                tournament._id,

                                "tournamentDate",

                                event.target
                                  .value,
                              )
                            }
                          />

                        </div>

                        <div>

                          <Label>
                            Time
                          </Label>

                          <Input
                            type="time"
                            value={
                              tournament.startTime
                            }
                            onChange={(
                              event,
                            ) =>
                              patchTournament(
                                tournament._id,

                                "startTime",

                                event.target
                                  .value,
                              )
                            }
                          />

                        </div>

                        <div>

                          <Label>
                            Entry Fee
                          </Label>

                          <Input
                            type="number"
                            min="0"
                            value={
                              tournament.entryFee
                            }
                            onChange={(
                              event,
                            ) =>
                              patchTournament(
                                tournament._id,

                                "entryFee",

                                Number(
                                  event.target
                                    .value,
                                ),
                              )
                            }
                          />

                        </div>

                        <div>

                          <Label>
                            Prize Pool
                          </Label>

                          <Input
                            type="number"
                            min="0"
                            value={
                              tournament.prizePool
                            }
                            onChange={(
                              event,
                            ) =>
                              patchTournament(
                                tournament._id,

                                "prizePool",

                                Number(
                                  event.target
                                    .value,
                                ),
                              )
                            }
                          />

                        </div>

                        <div>

                          <Label>
                            Team Size
                          </Label>

                          <Input
                            type="number"
                            min="1"
                            value={
                              tournament.teamSize
                            }
                            onChange={(
                              event,
                            ) =>
                              patchTournament(
                                tournament._id,

                                "teamSize",

                                Number(
                                  event.target
                                    .value,
                                ),
                              )
                            }
                          />

                        </div>

                        <div>

                          <Label>
                            Max Teams
                          </Label>

                          <Input
                            type="number"
                            min="2"
                            value={
                              tournament.maxTeams
                            }
                            onChange={(
                              event,
                            ) =>
                              patchTournament(
                                tournament._id,

                                "maxTeams",

                                Number(
                                  event.target
                                    .value,
                                ),
                              )
                            }
                          />

                        </div>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div>

                          <Label>
                            Event Status
                          </Label>

                          <Select
                            value={
                              tournament.status
                            }
                            onValueChange={(
                              value,
                            ) =>
                              patchTournament(
                                tournament._id,

                                "status",

                                value,
                              )
                            }
                          >

                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent>

                              <SelectItem value="Upcoming">
                                Upcoming
                              </SelectItem>

                              <SelectItem value="Live">
                                Live
                              </SelectItem>

                              <SelectItem value="Completed">
                                Completed
                              </SelectItem>

                              <SelectItem value="Cancelled">
                                Cancelled
                              </SelectItem>

                            </SelectContent>

                          </Select>

                        </div>

                        <div>

                          <Label>
                            Registration
                          </Label>

                          <Select
                            value={
                              tournament.registrationStatus
                            }
                            onValueChange={(
                              value,
                            ) =>
                              patchTournament(
                                tournament._id,

                                "registrationStatus",

                                value,
                              )
                            }
                          >

                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent>

                              <SelectItem value="Open">
                                Open
                              </SelectItem>

                              <SelectItem value="Closed">
                                Closed
                              </SelectItem>

                            </SelectContent>

                          </Select>

                        </div>

                      </div>

                      <div className="mt-5">

                        <div className="mb-1 flex justify-between text-xs text-muted-foreground">

                          <span>
                            Approved Teams
                          </span>

                          <span>
                            {
                              tournament.approvedTeams ||
                              0
                            }
                            /
                            {
                              tournament.maxTeams
                            }
                          </span>

                        </div>

                        <Progress
                          value={
                            progress
                          }
                        />

                      </div>

                      <Button
                        variant="hero"
                        className="mt-5 w-full"
                        disabled={
                          actionLoading ===
                          `event-${tournament._id}`
                        }
                        onClick={() =>
                          void saveTournament(
                            tournament,
                          )
                        }
                      >

                        {actionLoading ===
                        `event-${tournament._id}` ? (

                          <Loader2 className="mr-2 size-4 animate-spin" />

                        ) : (

                          <Save className="mr-2 size-4" />

                        )}

                        Save Event

                      </Button>

                    </section>

                  );
                },
              )}

            </div>

          )}

        </TabsContent>

        {/* =================================================
            REGISTRATIONS
        ================================================= */}

        <TabsContent
          value="registrations"
          className="mt-5"
        >

          <section className="glass-static rounded-2xl p-5">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>

                <p className="font-display text-[10px] tracking-[0.2em] text-primary uppercase">
                  Team Entries
                </p>

                <h2 className="mt-1 font-display text-lg font-black">
                  Tournament Registrations
                </h2>

              </div>

              <div className="flex gap-2">

                {[
                  "Pending",
                  "Approved",
                  "Denied",
                  "all",
                ].map(
                  (
                    status,
                  ) => (

                    <Button
                      key={
                        status
                      }
                      size="sm"
                      variant={
                        registrationFilter ===
                        status
                          ? "hero"
                          : "glass"
                      }
                      onClick={() =>
                        setRegistrationFilter(
                          status,
                        )
                      }
                    >
                      {status ===
                      "all"
                        ? "All"
                        : status}
                    </Button>

                  ),
                )}

              </div>

            </div>

            <div className="mt-5 grid gap-4">

              {registrations.length ? (

                registrations.map(
                  (
                    registration,
                  ) => {

                    const tournament =
                      typeof registration.tournamentId ===
                      "string"
                        ? null
                        : registration.tournamentId;

                    const busy =
                      Boolean(
                        actionLoading?.includes(
                          registration._id,
                        ),
                      );

                    return (

                      <div
                        key={
                          registration._id
                        }
                        className="rounded-2xl border border-border bg-background/20 p-5"
                      >

                        <div className="flex flex-wrap justify-between gap-5">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-display font-black">
                                {
                                  registration.teamName
                                }
                              </h3>

                              <Badge
                                variant="outline"
                                className={statusTone(
                                  registration.status,
                                )}
                              >
                                {
                                  registration.status
                                }
                              </Badge>

                              <Badge
                                variant="outline"
                                className={statusTone(
                                  registration.paymentStatus,
                                )}
                              >
                                Payment{" "}
                                {
                                  registration.paymentStatus
                                }
                              </Badge>

                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">

                              Captain:{" "}

                              {
                                registration.captainName
                              }

                              {" · "}

                              {
                                registration.captainGameId
                              }

                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {
                                registration.phone
                              }
                            </p>

                            <p className="mt-3 font-display text-xs font-bold text-neon-cyan">
                              {
                                tournament?.name ||
                                "Tournament"
                              }
                            </p>

                            <p className="mt-1 text-xs">
                              Entry Fee: Rs{" "}

                              {Number(
                                tournament?.entryFee ||
                                  0,
                              ).toLocaleString()}
                            </p>

                          </div>

                          {registration.status ===
                            "Pending" && (

                            <div className="flex flex-wrap gap-2">

                              <Button
                                variant="glass"
                                size="sm"
                                onClick={() =>
                                  openPaymentMessage(
                                    registration,
                                  )
                                }
                              >

                                <MessageCircle className="mr-2 size-4" />

                                WhatsApp Payment

                              </Button>

                              {registration.paymentStatus ===
                                "Pending" && (

                                <Button
                                  variant="glass"
                                  size="sm"
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    void markRegistrationPaid(
                                      registration,
                                    )
                                  }
                                >

                                  <Wallet className="mr-2 size-4" />

                                  Mark Paid

                                </Button>

                              )}

                              <Button
                                variant="hero"
                                size="sm"
                                disabled={
                                  busy ||
                                  Boolean(
                                    tournament &&
                                      Number(
                                        tournament.entryFee ||
                                          0,
                                      ) >
                                        0 &&
                                      registration.paymentStatus !==
                                        "Paid",
                                  )
                                }
                                onClick={() =>
                                  void approveRegistration(
                                    registration,
                                  )
                                }
                              >

                                <CheckCircle2 className="mr-2 size-4" />

                                Approve

                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-neon-red"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void denyRegistration(
                                    registration,
                                  )
                                }
                              >

                                <XCircle className="mr-2 size-4" />

                                Deny

                              </Button>

                            </div>

                          )}

                        </div>

                      </div>

                    );
                  },
                )

              ) : (

                <div className="rounded-xl border border-dashed border-border p-10 text-center">

                  <Users className="mx-auto size-7 text-muted-foreground" />

                  <p className="mt-3 text-sm text-muted-foreground">
                    No tournament registrations found.
                  </p>

                </div>

              )}

            </div>

          </section>

        </TabsContent>

        {/* =================================================
            BRACKET
        ================================================= */}

        <TabsContent
          value="bracket"
          className="mt-5"
        >

          <section className="glass-static rounded-2xl p-5">

            <div className="flex flex-wrap items-end justify-between gap-4">

              <div className="w-full max-w-md">

                <Label>
                  Tournament
                </Label>

                <Select
                  value={
                    selectedTournamentId
                  }
                  onValueChange={
                    setSelectedTournamentId
                  }
                >

                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Tournament" />
                  </SelectTrigger>

                  <SelectContent>

                    {tournaments.map(
                      (
                        tournament,
                      ) => (

                        <SelectItem
                          key={
                            tournament._id
                          }
                          value={
                            tournament._id
                          }
                        >
                          {
                            tournament.name
                          }
                        </SelectItem>

                      ),
                    )}

                  </SelectContent>

                </Select>

              </div>

              <Button
                variant="hero"
                disabled={
                  !selectedTournamentId ||
                  actionLoading ===
                    "generate-bracket"
                }
                onClick={() =>
                  void generateBracket()
                }
              >

                {actionLoading ===
                "generate-bracket" ? (

                  <Loader2 className="mr-2 size-4 animate-spin" />

                ) : (

                  <Brackets className="mr-2 size-4" />

                )}

                Generate Bracket

              </Button>

            </div>

            <div className="mt-6">

              {matches.length ? (

                <div className="grid gap-4 xl:grid-cols-2">

                  {matches.map(
                    (
                      match,
                    ) => (

                      <div
                        key={
                          match._id
                        }
                        className="rounded-2xl border border-border bg-background/20 p-5"
                      >

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="font-display text-[9px] tracking-[0.18em] text-primary uppercase">
                              {
                                match.round
                              }
                            </p>

                            <h3 className="mt-1 font-display font-bold">
                              Match{" "}
                              {
                                match.matchNumber
                              }
                            </h3>

                          </div>

                          <Badge
                            variant="outline"
                            className={statusTone(
                              match.status,
                            )}
                          >
                            {
                              match.status
                            }
                          </Badge>

                        </div>

                        {/* TEAM A */}

                        <div className="mt-5 rounded-xl border border-border p-3">

                          <div className="flex items-center gap-3">

                            <div className="flex-1">

                              <p className="text-xs text-muted-foreground">
                                Team A
                              </p>

                              <p className="mt-1 font-semibold">
                                {
                                  match.teamAName ||
                                  "TBD"
                                }
                              </p>

                            </div>

                            <Input
                              type="number"
                              min="0"
                              className="w-20"
                              value={
                                match.teamAScore
                              }
                              onChange={(
                                event,
                              ) =>
                                patchMatch(
                                  match._id,

                                  "teamAScore",

                                  Number(
                                    event.target
                                      .value,
                                  ),
                                )
                              }
                            />

                          </div>

                        </div>

                        {/* TEAM B */}

                        <div className="mt-2 rounded-xl border border-border p-3">

                          <div className="flex items-center gap-3">

                            <div className="flex-1">

                              <p className="text-xs text-muted-foreground">
                                Team B
                              </p>

                              <p className="mt-1 font-semibold">
                                {
                                  match.teamBName ||
                                  "TBD"
                                }
                              </p>

                            </div>

                            <Input
                              type="number"
                              min="0"
                              className="w-20"
                              value={
                                match.teamBScore
                              }
                              onChange={(
                                event,
                              ) =>
                                patchMatch(
                                  match._id,

                                  "teamBScore",

                                  Number(
                                    event.target
                                      .value,
                                  ),
                                )
                              }
                            />

                          </div>

                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">

                          <div>

                            <Label>
                              Date
                            </Label>

                            <Input
                              type="date"
                              value={
                                match.scheduledDate ||
                                ""
                              }
                              onChange={(
                                event,
                              ) =>
                                patchMatch(
                                  match._id,

                                  "scheduledDate",

                                  event.target
                                    .value,
                                )
                              }
                            />

                          </div>

                          <div>

                            <Label>
                              Time
                            </Label>

                            <Input
                              type="time"
                              value={
                                match.scheduledTime ||
                                ""
                              }
                              onChange={(
                                event,
                              ) =>
                                patchMatch(
                                  match._id,

                                  "scheduledTime",

                                  event.target
                                    .value,
                                )
                              }
                            />

                          </div>

                        </div>

                        <div className="mt-4">

                          <Label>
                            Match Status
                          </Label>

                          <Select
                            value={
                              match.status
                            }
                            onValueChange={(
                              value,
                            ) =>
                              patchMatch(
                                match._id,

                                "status",

                                value,
                              )
                            }
                          >

                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent>

                              <SelectItem value="Scheduled">
                                Scheduled
                              </SelectItem>

                              <SelectItem value="Live">
                                Live
                              </SelectItem>

                              <SelectItem value="Completed">
                                Completed
                              </SelectItem>

                              <SelectItem value="Cancelled">
                                Cancelled
                              </SelectItem>

                            </SelectContent>

                          </Select>

                        </div>

                        {match.winnerName && (

                          <div className="mt-4 rounded-xl border border-neon-green/30 bg-neon-green/10 p-3">

                            <p className="text-[10px] text-muted-foreground">
                              Winner
                            </p>

                            <p className="mt-1 font-display text-sm font-bold text-neon-green">
                              {
                                match.winnerName
                              }
                            </p>

                          </div>

                        )}

                        <Button
                          variant="hero"
                          className="mt-4 w-full"
                          disabled={
                            actionLoading ===
                            `match-${match._id}`
                          }
                          onClick={() =>
                            void saveMatch(
                              match,
                            )
                          }
                        >

                          {actionLoading ===
                          `match-${match._id}` ? (

                            <Loader2 className="mr-2 size-4 animate-spin" />

                          ) : (

                            <Save className="mr-2 size-4" />

                          )}

                          Save Match Result

                        </Button>

                      </div>

                    ),
                  )}

                </div>

              ) : (

                <div className="rounded-xl border border-dashed border-border p-12 text-center">

                  <Brackets className="mx-auto size-8 text-muted-foreground" />

                  <p className="mt-4 font-display text-xs font-bold uppercase">
                    No Bracket Generated
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Approve at least two teams, then generate the tournament bracket.
                  </p>

                </div>

              )}

            </div>

          </section>

        </TabsContent>

        {/* =================================================
            LEADERBOARD
        ================================================= */}

        <TabsContent
          value="leaderboard"
          className="mt-5"
        >

          <section className="glass-static rounded-2xl p-5">

            <div className="flex flex-wrap items-end justify-between gap-4">

              <div className="w-full max-w-md">

                <Label>
                  Tournament
                </Label>

                <Select
                  value={
                    selectedTournamentId
                  }
                  onValueChange={
                    setSelectedTournamentId
                  }
                >

                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Tournament" />
                  </SelectTrigger>

                  <SelectContent>

                    {tournaments.map(
                      (
                        tournament,
                      ) => (

                        <SelectItem
                          key={
                            tournament._id
                          }
                          value={
                            tournament._id
                          }
                        >
                          {
                            tournament.name
                          }
                        </SelectItem>

                      ),
                    )}

                  </SelectContent>

                </Select>

              </div>

              <div className="flex gap-2">

                <Button
                  variant="glass"
                  disabled={
                    !selectedTournamentId
                  }
                  onClick={
                    addLeaderboardRow
                  }
                >

                  <Plus className="mr-2 size-4" />

                  Add Team

                </Button>

                <Button
                  variant="hero"
                  disabled={
                    !selectedTournamentId ||
                    actionLoading ===
                      "leaderboard"
                  }
                  onClick={() =>
                    void saveLeaderboard()
                  }
                >

                  {actionLoading ===
                  "leaderboard" ? (

                    <Loader2 className="mr-2 size-4 animate-spin" />

                  ) : (

                    <Save className="mr-2 size-4" />

                  )}

                  Save Leaderboard

                </Button>

              </div>

            </div>

            <div className="mt-6 space-y-3">

              {leaderboard.map(
                (
                  row,
                  index,
                ) => (

                  <div
                    key={
                      row._id ||
                      index
                    }
                    className="grid gap-3 rounded-2xl border border-border bg-background/20 p-4 md:grid-cols-[80px_1fr_1fr_1fr_140px_44px]"
                  >

                    <div>

                      <Label>
                        Rank
                      </Label>

                      <Input
                        type="number"
                        min="1"
                        value={
                          row.rank
                        }
                        onChange={(
                          event,
                        ) =>
                          patchLeaderboardRow(
                            index,

                            "rank",

                            Number(
                              event.target
                                .value,
                            ),
                          )
                        }
                      />

                    </div>

                    <div>

                      <Label>
                        Team
                      </Label>

                      <Input
                        value={
                          row.team
                        }
                        onChange={(
                          event,
                        ) =>
                          patchLeaderboardRow(
                            index,

                            "team",

                            event.target
                              .value,
                          )
                        }
                      />

                    </div>

                    <div>

                      <Label>
                        Game
                      </Label>

                      <Input
                        value={
                          row.game
                        }
                        onChange={(
                          event,
                        ) =>
                          patchLeaderboardRow(
                            index,

                            "game",

                            event.target
                              .value,
                          )
                        }
                      />

                    </div>

                    <div>

                      <Label>
                        Streak
                      </Label>

                      <Input
                        placeholder="W5"
                        value={
                          row.streak
                        }
                        onChange={(
                          event,
                        ) =>
                          patchLeaderboardRow(
                            index,

                            "streak",

                            event.target
                              .value,
                          )
                        }
                      />

                    </div>

                    <div>

                      <Label>
                        Points
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        value={
                          row.points
                        }
                        onChange={(
                          event,
                        ) =>
                          patchLeaderboardRow(
                            index,

                            "points",

                            Number(
                              event.target
                                .value,
                            ),
                          )
                        }
                      />

                    </div>

                    <div className="flex items-end">

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-neon-red"
                        onClick={() =>
                          removeLeaderboardRow(
                            index,
                          )
                        }
                      >

                        <Minus className="size-4" />

                      </Button>

                    </div>

                  </div>

                ),
              )}

              {!leaderboard.length && (

                <div className="rounded-xl border border-dashed border-border p-12 text-center">

                  <Medal className="mx-auto size-8 text-muted-foreground" />

                  <p className="mt-4 text-sm text-muted-foreground">
                    No leaderboard rows yet. Click Add Team to create rankings.
                  </p>

                </div>

              )}

            </div>

          </section>

        </TabsContent>

      </Tabs>
    </>
  );
}