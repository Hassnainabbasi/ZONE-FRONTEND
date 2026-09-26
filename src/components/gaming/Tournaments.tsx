import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "motion/react";

import {
  CalendarDays,
  Loader2,
  Medal,
  Trophy,
  Users,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Reveal,
  SectionHeading,
} from "./Reveal";

import {
  tournamentApi,
  type Tournament,
} from "@/services/tournamentApi";

/* =========================================================
   COUNTDOWN
========================================================= */

function Countdown({
  tournament,
}: {
  tournament:
    Tournament;
}) {
  const target =
    useMemo(
      () => {
        return new Date(
          `${tournament.tournamentDate}T${tournament.startTime}:00`,
        ).getTime();
      },

      [
        tournament.tournamentDate,
        tournament.startTime,
      ],
    );

  const [
    left,
    setLeft,
  ] =
    useState(
      Math.max(
        0,

        target -
          Date.now(),
      ),
    );

  useEffect(() => {
    const tick =
      () => {
        setLeft(
          Math.max(
            0,

            target -
              Date.now(),
          ),
        );
      };

    tick();

    const id =
      window.setInterval(
        tick,

        1000,
      );

    return () =>
      window.clearInterval(
        id,
      );
  }, [
    target,
  ]);

  const units = [
    [
      String(
        Math.floor(
          left /
            86400000,
        ),
      ).padStart(
        2,

        "0",
      ),

      "Days",
    ],

    [
      String(
        Math.floor(
          (left /
            3600000) %
            24,
        ),
      ).padStart(
        2,

        "0",
      ),

      "Hrs",
    ],

    [
      String(
        Math.floor(
          (left /
            60000) %
            60,
        ),
      ).padStart(
        2,

        "0",
      ),

      "Min",
    ],

    [
      String(
        Math.floor(
          (left /
            1000) %
            60,
        ),
      ).padStart(
        2,

        "0",
      ),

      "Sec",
    ],
  ];

  return (
    <div className="mt-7 grid grid-cols-4 gap-2 sm:gap-3">

      {units.map(
        ([
          value,
          label,
        ]) => (

          <div
            key={
              label
            }
            className="glass-static rounded-xl px-2 py-3 text-center"
          >

            <p className="font-display text-xl font-black text-neon-cyan sm:text-2xl">
              {
                value
              }
            </p>

            <p className="mt-1 font-display text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
              {
                label
              }
            </p>

          </div>

        ),
      )}

    </div>
  );
}

/* =========================================================
   TOURNAMENTS
========================================================= */

export function Tournaments() {
  const [
    tournaments,
    setTournaments,
  ] =
    useState<
      Tournament[]
    >([]);

  const [
    selected,
    setSelected,
  ] =
    useState<
      Tournament | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    teamName,
    setTeamName,
  ] =
    useState("");

  const [
    captainName,
    setCaptainName,
  ] =
    useState("");

  const [
    captainGameId,
    setCaptainGameId,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  async function load() {
    try {
      const response =
        await tournamentApi.publicList();

      setTournaments(
        response.data ||
        [],
      );
    } catch (error) {
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
    void load();
  }, []);

  async function submitTeam() {
    if (!selected) {
      return;
    }

    try {
      setSubmitting(
        true,
      );

      const response =
        await tournamentApi.register({
          tournamentId:
            selected._id,

          teamName,

          captainName,

          captainGameId,

          phone,

          email:
            email ||
            undefined,
        });

      toast.success(
        response.message,
      );

      setSelected(
        null,
      );

      setTeamName("");
      setCaptainName("");
      setCaptainGameId("");
      setPhone("");
      setEmail("");

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to register team",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  const featured =
    tournaments.find(
      (
        tournament,
      ) =>
        tournament.status ===
        "Upcoming" &&
        tournament.registrationStatus ===
        "Open",
    ) ||
    tournaments[0];

  const leaderboard =
    featured?.leaderboard ||
    [];

  return (
    <section
      id="tournaments"
      className="relative scroll-mt-28 py-20 lg:py-28"
    >

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <SectionHeading
          eyebrow="Compete"
          title={
            <>
              Tournaments &amp;{" "}

              <span className="text-gradient">
                Leaderboard
              </span>
            </>
          }
          subtitle="Live Nexus Arena tournaments, registrations, prize pools and arena rankings."
        />

        {loading ? (

          <div className="flex justify-center py-20">

            <Loader2 className="size-7 animate-spin text-neon-cyan" />

          </div>

        ) : featured ? (

          <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1.25fr]">

            {/* FEATURED EVENT */}

            <Reveal>

              <div className="glass glow-purple relative h-full overflow-hidden rounded-2xl p-7">

                <div
                  className="cyber-grid absolute inset-0 opacity-40"
                  aria-hidden
                />

                <div className="relative">

                  <span className="inline-flex items-center gap-2 rounded-full bg-destructive/15 px-3 py-1 font-display text-[9px] tracking-[0.24em] text-destructive uppercase">

                    <span className="live-dot size-1.5 rounded-full bg-destructive" />

                    Registration{" "}
                    {
                      featured.registrationStatus
                    }

                  </span>

                  <h3 className="mt-5 font-display text-2xl font-black uppercase sm:text-3xl">

                    {
                      featured.name
                    }

                  </h3>

                  <p className="mt-3 text-sm text-muted-foreground">

                    {
                      featured.description ||
                      `${featured.teamSize}v${featured.teamSize} · ${featured.format} · ${featured.maxTeams} team cap · ${featured.finalsFormat} finals.`
                    }

                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">

                    <span className="glass-static inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-display text-xs">

                      <Trophy className="size-4 text-gold" />

                      Rs{" "}

                      {Number(
                        featured.prizePool,
                      ).toLocaleString()}{" "}

                      Pool

                    </span>

                    <span className="glass-static inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-display text-xs">

                      <Users className="size-4 text-neon-green" />

                      {
                        featured.approvedTeams ||
                        0
                      }{" "}
                      /{" "}
                      {
                        featured.maxTeams
                      }{" "}
                      Teams

                    </span>

                    <span className="glass-static inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-display text-xs">

                      <CalendarDays className="size-4 text-neon-cyan" />

                      {
                        featured.tournamentDate
                      }{" "}
                      ·{" "}
                      {
                        featured.startTime
                      }

                    </span>

                  </div>

                  <Countdown
                    tournament={
                      featured
                    }
                  />

                  <Dialog
                    open={
                      Boolean(
                        selected,
                      )
                    }
                    onOpenChange={(
                      open,
                    ) => {
                      if (!open) {
                        setSelected(
                          null,
                        );
                      }
                    }}
                  >

                    <DialogTrigger
                      asChild
                    >

                      <Button
                        variant="hero"
                        size="xl"
                        className="mt-7 w-full"
                        disabled={
                          featured.registrationStatus !==
                          "Open"
                        }
                        onClick={() =>
                          setSelected(
                            featured,
                          )
                        }
                      >

                        Register Team · Rs{" "}

                        {Number(
                          featured.entryFee,
                        ).toLocaleString()}

                      </Button>

                    </DialogTrigger>

                    <DialogContent className="glass-static border-border sm:max-w-md">

                      <DialogHeader>

                        <DialogTitle className="font-display uppercase">
                          Register Your Team
                        </DialogTitle>

                        <DialogDescription>

                          {
                            selected?.name
                          }

                          {" · "}

                          Entry Fee Rs{" "}

                          {Number(
                            selected?.entryFee ||
                              0,
                          ).toLocaleString()}

                        </DialogDescription>

                      </DialogHeader>

                      <div className="mt-2 space-y-4">

                        <div className="space-y-2">

                          <Label>
                            Team Name
                          </Label>

                          <Input
                            value={
                              teamName
                            }
                            onChange={(event) =>
                              setTeamName(
                                event.target.value,
                              )
                            }
                            placeholder="PHANTOM SIX"
                          />

                        </div>

                        <div className="space-y-2">

                          <Label>
                            Captain Name
                          </Label>

                          <Input
                            value={
                              captainName
                            }
                            onChange={(event) =>
                              setCaptainName(
                                event.target.value,
                              )
                            }
                          />

                        </div>

                        <div className="space-y-2">

                          <Label>
                            Captain Game / Riot ID
                          </Label>

                          <Input
                            value={
                              captainGameId
                            }
                            onChange={(event) =>
                              setCaptainGameId(
                                event.target.value,
                              )
                            }
                            placeholder="captain#PK1"
                          />

                        </div>

                        <div className="space-y-2">

                          <Label>
                            Contact Number
                          </Label>

                          <Input
                            value={
                              phone
                            }
                            onChange={(event) =>
                              setPhone(
                                event.target.value,
                              )
                            }
                            type="tel"
                            placeholder="03xx xxx xxxx"
                          />

                        </div>

                        <div className="space-y-2">

                          <Label>
                            Email
                          </Label>

                          <Input
                            value={
                              email
                            }
                            onChange={(event) =>
                              setEmail(
                                event.target.value,
                              )
                            }
                            type="email"
                            placeholder="Optional"
                          />

                        </div>

                        <Button
                          variant="hero"
                          size="xl"
                          className="w-full"
                          disabled={
                            submitting
                          }
                          onClick={() =>
                            void submitTeam()
                          }
                        >

                          {submitting && (

                            <Loader2 className="mr-2 size-4 animate-spin" />

                          )}

                          Submit Registration

                        </Button>

                      </div>

                    </DialogContent>

                  </Dialog>

                </div>

              </div>

            </Reveal>

            {/* LEADERBOARD */}

            <Reveal delay={0.1}>

              <div className="glass h-full overflow-hidden rounded-2xl p-6 sm:p-7">

                <div className="flex items-center gap-2">

                  <Medal className="size-4 text-gold" />

                  <h3 className="font-display text-xs tracking-[0.26em] uppercase">
                    Arena Rankings
                  </h3>

                </div>

                <div className="mt-6 space-y-2">

                  {leaderboard.length ? (

                    leaderboard
                      .slice()
                      .sort(
                        (
                          a,
                          b,
                        ) =>
                          a.rank -
                          b.rank,
                      )
                      .map(
                        (
                          row,
                          index,
                        ) => (

                          <motion.div
                            key={`${row.team}-${row.rank}`}
                            initial={{
                              opacity:
                                0,

                              x:
                                26,
                            }}
                            whileInView={{
                              opacity:
                                1,

                              x:
                                0,
                            }}
                            viewport={{
                              once:
                                true,
                            }}
                            transition={{
                              duration:
                                0.5,

                              delay:
                                index *
                                0.07,
                            }}
                            className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-2/40 px-3 py-3"
                          >

                            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 font-display text-xs font-bold">

                              {
                                row.rank
                              }

                            </span>

                            <div className="min-w-0 flex-1">

                              <p className="truncate font-display text-sm font-bold">
                                {
                                  row.team
                                }
                              </p>

                              <p className="text-[11px] text-muted-foreground">
                                {
                                  row.game ||
                                  featured.game
                                }
                              </p>

                            </div>

                            {row.streak && (

                              <span className="hidden rounded-full bg-neon-green/12 px-2.5 py-1 font-display text-[9px] text-neon-green sm:inline">

                                {
                                  row.streak
                                }

                              </span>

                            )}

                            <span className="font-display text-sm font-bold text-neon-cyan">

                              {Number(
                                row.points,
                              ).toLocaleString()}

                            </span>

                          </motion.div>

                        ),
                      )

                  ) : (

                    <div className="rounded-xl border border-dashed border-border p-10 text-center">

                      <Medal className="mx-auto size-6 text-muted-foreground" />

                      <p className="mt-3 text-sm text-muted-foreground">
                        Leaderboard will appear when tournament rankings are published.
                      </p>

                    </div>

                  )}

                </div>

              </div>

            </Reveal>

          </div>

        ) : (

          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">

            <Trophy className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-4 text-sm text-muted-foreground">
              No tournaments are currently available.
            </p>

          </div>

        )}

      </div>

    </section>
  );
}