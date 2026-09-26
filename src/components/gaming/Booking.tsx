import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Clock,
  CreditCard,
  Gamepad2,
  Grid3x3,
  Loader2,
  Monitor,
  Moon,
  PackageCheck,
  Smartphone,
  User,
  Wallet,
  X,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  Checkbox,
} from "@/components/ui/checkbox";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Reveal,
  SectionHeading,
} from "./Reveal";

/*
 * IMPORTANT:
 *
 * Gaming frontend ka correct context.
 *
 * Purana:
 * ../../context/booking-context
 *
 * use nahi karna.
 */
import {
  useBooking,
} from "../../context/booking-context";

import {
  ApiError,
  bookingApi,
} from "@/services/bookingApi";

import {
  gameApi,
  type Game,
} from "@/services/gameApi";

import {
  useAuth,
} from "@/context/auth-context";

/* =========================================================
   PAYMENT ICONS
========================================================= */

const paymentIcons: Record<
  string,
  typeof Wallet
> = {
  Cash:
    Wallet,

  Easypaisa:
    Smartphone,

  JazzCash:
    Wallet,

  Card:
    CreditCard,
};

/* =========================================================
   STEP HEADER
========================================================= */

function StepHeader({
  step,
  icon: Icon,
  title,
}: {
  step: number;

  icon: typeof Clock;

  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 font-display text-xs font-bold text-neon-cyan">
        0{step}
      </span>

      <div className="flex items-center gap-2">
        <Icon className="size-4 text-neon-cyan" />

        <h3 className="font-display text-xs tracking-[0.22em] uppercase">
          {title}
        </h3>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING
========================================================= */

export function Booking() {
  const {
    date,
    setDate,

    startTime,
    setStartTime,

    hours,
    setHours,

    seats,
    toggleSeat,
    clearSeats,

    payment,
    setPayment,

    systemType,
    setSystemType,

    selectedGameId,
    setSelectedGameId,

    customer,
    setCustomer,

    selectedPricingPlan,
    clearPricingPlan,

    usePoints,
    setUsePoints,

    total,
    pricing,
    config,

    occupiedPCs,

    configLoading,
    availabilityLoading,
    pricingLoading,

    refreshAvailability,
    resetBooking,
  } =
    useBooking();

  const {
    user,
  } =
    useAuth();

  const [
    games,
    setGames,
  ] =
    useState<Game[]>(
      [],
    );

  const [
    gamesLoading,
    setGamesLoading,
  ] =
    useState(
      false,
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    lastBookingId,
    setLastBookingId,
  ] =
    useState("");

  /* =======================================================
     CUSTOMER PREFILL
  ======================================================= */

  useEffect(() => {
    if (!user) {
      return;
    }

    setCustomer(
      (
        current,
      ) => ({
        name:
          current.name ||
          user.name ||
          "",

        phone:
          current.phone ||
          user.phone ||
          "",

        email:
          current.email ||
          user.email ||
          "",
      }),
    );
  }, [
    user?._id,
  ]);

  /* =======================================================
     LOAD GAMES
  ======================================================= */

  useEffect(() => {
    if (!systemType) {
      setGames([]);

      setSelectedGameId(
        "",
      );

      return;
    }

    let mounted =
      true;

    async function loadGames() {
      try {
        setGamesLoading(
          true,
        );

        /*
         * Correct gameApi call.
         */
        const response =
          await gameApi.publicList({
            platform:
              systemType,
          });

        if (!mounted) {
          return;
        }

        const list =
          Array.isArray(
            response.data,
          )
            ? response.data
            : [];

        setGames(
          list,
        );

        setSelectedGameId(
          (
            current,
          ) =>
            list.some(
              (
                game,
              ) =>
                game._id ===
                current,
            )
              ? current
              : list[0]?._id ||
                "",
        );
      } catch (
        error
      ) {
        console.error(
          "Games load error:",
          error,
        );

        if (mounted) {
          setGames([]);

          setSelectedGameId(
            "",
          );
        }
      } finally {
        if (mounted) {
          setGamesLoading(
            false,
          );
        }
      }
    }

    void loadGames();

    return () => {
      mounted =
        false;
    };
  }, [
    systemType,
  ]);

  /* =======================================================
     CURRENT SYSTEM
  ======================================================= */

  const currentSystem =
    useMemo(
      () =>
        config?.systems.find(
          (
            system,
          ) =>
            system.name ===
            systemType,
        ) ||
        null,

      [
        config,
        systemType,
      ],
    );

  const totalStations =
    Number(
      currentSystem
        ?.totalStations ||
        currentSystem
          ?.stations ||
        currentSystem
          ?.stationCount ||
        0,
    );

  const stations =
    Array.from(
      {
        length:
          totalStations,
      },

      (
        _,
        index,
      ) =>
        index +
        1,
    );

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateBooking() {
    if (
      !customer.name.trim()
    ) {
      toast.error(
        "Enter your full name",
      );

      return false;
    }

    if (
      !customer.phone.trim()
    ) {
      toast.error(
        "Enter your phone number",
      );

      return false;
    }

    if (!date) {
      toast.error(
        "Select booking date",
      );

      return false;
    }

    if (!systemType) {
      toast.error(
        "Select gaming platform",
      );

      return false;
    }

    if (
      games.length >
        0 &&
      !selectedGameId
    ) {
      toast.error(
        "Select a game",
      );

      return false;
    }

    if (!startTime) {
      toast.error(
        "Select start time",
      );

      return false;
    }

    if (!hours) {
      toast.error(
        "Select booking duration",
      );

      return false;
    }

    if (
      !seats.length
    ) {
      toast.error(
        "Select at least one station",
      );

      return false;
    }

    if (!payment) {
      toast.error(
        "Select payment method",
      );

      return false;
    }

    return true;
  }

  /* =======================================================
     CREATE BOOKING
  ======================================================= */

  async function handleConfirmBooking() {
    if (
      !validateBooking()
    ) {
      return;
    }

    try {
      setSubmitting(
        true,
      );

      /*
       * Availability fresh check before submission.
       */
      await refreshAvailability();

      const response =
        await bookingApi.create({
          customer: {
            name:
              customer.name.trim(),

            phone:
              customer.phone.trim(),

            email:
              customer.email.trim() ||
              undefined,
          },

          bookingDate:
            date,

          /*
           * Package mode mein backend MongoDB plan
           * values ko source of truth rakhega.
           */
          startTime,

          duration:
            hours,

          stations:
            seats,

          systemType,

          gameId:
            selectedGameId ||
            null,

          pricingPlanId:
            selectedPricingPlan?._id ||
            null,

          bookingType:
            "Online",

          paymentMethod:
            payment,

          usePoints,
        });

      setLastBookingId(
        response.data
          .bookingId,
      );

      toast.success(
        `Booking request submitted — ${response.data.bookingId}`,
      );

      resetBooking();
    } catch (
      error
    ) {
      console.error(
        "Booking error:",
        error,
      );

      if (
        error instanceof
          ApiError &&
        error.status ===
          409
      ) {
        toast.error(
          error.message ||
            "One or more selected stations are unavailable.",
        );

        await refreshAvailability();

        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create booking",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    configLoading
  ) {
    return (
      <section
        id="booking"
        className="relative scroll-mt-28 py-20 lg:py-28"
      >
        <div className="mx-auto flex max-w-6xl justify-center px-4 py-20">
          <Loader2 className="size-7 animate-spin text-neon-cyan" />
        </div>
      </section>
    );
  }

  if (!config) {
    return (
      <section
        id="booking"
        className="relative scroll-mt-28 py-20 lg:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 text-center text-muted-foreground">
          Booking configuration could not be loaded.
        </div>
      </section>
    );
  }

  if (
    !config.bookingEnabled
  ) {
    return (
      <section
        id="booking"
        className="relative scroll-mt-28 py-20 lg:py-28"
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="glass rounded-2xl p-10 text-center">
            <h2 className="font-display text-xl font-black">
              Online Booking Currently Unavailable
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Please check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section
      id="booking"
      className="relative scroll-mt-28 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Reserve"
          title={
            <>
              Live Slot{" "}
              <span className="text-gradient">
                Booking
              </span>
            </>
          }
          subtitle="Book normal hourly gaming or select a Cyber Xtream day/night package."
        />

        {/* =================================================
            SUCCESS
        ================================================= */}

        {lastBookingId && (
          <div className="mx-auto mt-8 max-w-xl rounded-xl border border-neon-green/30 bg-neon-green/10 p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Booking request submitted
            </p>

            <p className="mt-1 font-display text-lg font-black text-neon-green">
              {
                lastBookingId
              }
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Your booking is awaiting admin confirmation.
            </p>
          </div>
        )}

        {/* =================================================
            PACKAGE SELECTED
        ================================================= */}

        {selectedPricingPlan && (
          <Reveal className="mt-8">
            <div className="glass-static rounded-2xl border border-secondary/30 bg-secondary/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-secondary/15">
                    {selectedPricingPlan.packageType ===
                    "Night" ? (
                      <Moon className="size-5 text-secondary" />
                    ) : (
                      <PackageCheck className="size-5 text-neon-cyan" />
                    )}
                  </div>

                  <div>
                    <p className="font-display text-[10px] tracking-[0.2em] text-secondary uppercase">
                      Selected Package
                    </p>

                    <h3 className="mt-1 font-display text-lg font-black">
                      {
                        selectedPricingPlan.name
                      }
                    </h3>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {
                        selectedPricingPlan.systemType
                      }

                      {" · "}

                      {
                        selectedPricingPlan.durationHours
                      }{" "}

                      Hours

                      {selectedPricingPlan.startTime
                        ? ` · ${selectedPricingPlan.startTime}`
                        : ""}

                      {selectedPricingPlan.endTime
                        ? ` – ${selectedPricingPlan.endTime}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="font-display text-xl font-black text-gradient">
                    Rs{" "}

                    {Number(
                      selectedPricingPlan.price,
                    ).toLocaleString()}
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Remove package"
                    onClick={
                      clearPricingPlan
                    }
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-[10px] leading-5 text-muted-foreground">
                Package price is per selected station. Package timing, duration and final price are validated again by the backend.
              </p>
            </div>
          </Reveal>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-5">
            {/* CUSTOMER */}

            <Reveal className="glass rounded-2xl p-6">
              <StepHeader
                step={1}
                icon={User}
                title="Your Details"
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>
                    Full Name
                  </Label>

                  <Input
                    className="mt-1"
                    value={
                      customer.name
                    }
                    onChange={(event) =>
                      setCustomer(
                        (
                          current,
                        ) => ({
                          ...current,

                          name:
                            event.target.value,
                        }),
                      )
                    }
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <Label>
                    Phone
                  </Label>

                  <Input
                    className="mt-1"
                    value={
                      customer.phone
                    }
                    onChange={(event) =>
                      setCustomer(
                        (
                          current,
                        ) => ({
                          ...current,

                          phone:
                            event.target.value,
                        }),
                      )
                    }
                    placeholder="03XXXXXXXXX"
                  />
                </div>

                <div>
                  <Label>
                    Email
                  </Label>

                  <Input
                    className="mt-1"
                    type="email"
                    value={
                      customer.email
                    }
                    onChange={(event) =>
                      setCustomer(
                        (
                          current,
                        ) => ({
                          ...current,

                          email:
                            event.target.value,
                        }),
                      )
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
            </Reveal>

            {/* DATE / TIME */}

            <Reveal className="glass rounded-2xl p-6">
              <StepHeader
                step={2}
                icon={
                  CalendarDays
                }
                title="Date & Time"
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>
                    Booking Date
                  </Label>

                  <Input
                    type="date"
                    className="mt-1"
                    value={
                      date
                    }
                    min={
                      new Date()
                        .toISOString()
                        .split(
                          "T",
                        )[0]
                    }
                    onChange={(event) =>
                      setDate(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div>
                  <Label>
                    Start Time
                  </Label>

                  <Input
                    type="time"
                    className="mt-1"
                    value={
                      startTime
                    }
                    disabled={
                      Boolean(
                        selectedPricingPlan?.startTime,
                      )
                    }
                    onChange={(event) =>
                      setStartTime(
                        event.target.value,
                      )
                    }
                  />

                  {selectedPricingPlan?.startTime && (
                    <p className="mt-1 text-[9px] text-muted-foreground">
                      Fixed by selected package.
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Duration
                  </Label>

                  {selectedPricingPlan ? (
                    <>
                      <Input
                        className="mt-1"
                        disabled
                        value={`${hours} Hours`}
                      />

                      <p className="mt-1 text-[9px] text-muted-foreground">
                        Fixed by selected package.
                      </p>
                    </>
                  ) : (
                    <Select
                      value={
                        String(
                          hours,
                        )
                      }
                      onValueChange={(value) =>
                        setHours(
                          Number(
                            value,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {config.durations.map(
                          (
                            duration,
                          ) => (
                            <SelectItem
                              key={
                                duration
                              }
                              value={
                                String(
                                  duration,
                                )
                              }
                            >
                              {
                                duration
                              }{" "}

                              Hour
                              {duration ===
                              1
                                ? ""
                                : "s"}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {!selectedPricingPlan && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Arena hours:{" "}
                  {
                    config.openingTime
                  }{" "}
                  –{" "}
                  {
                    config.closingTime
                  }
                </p>
              )}
            </Reveal>

            {/* PLATFORM */}

            <Reveal
              delay={0.08}
              className="glass rounded-2xl p-6"
            >
              <StepHeader
                step={3}
                icon={Monitor}
                title="Choose Gaming Platform"
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {config.systems.map(
                  (
                    system,
                  ) => {
                    const selected =
                      systemType ===
                      system.name;

                    const packageLocked =
                      Boolean(
                        selectedPricingPlan &&
                          selectedPricingPlan.systemType !==
                            "Other",
                      );

                    const disabled =
                      packageLocked &&
                      !selected;

                    return (
                      <button
                        key={
                          system.name
                        }
                        type="button"
                        disabled={
                          disabled
                        }
                        onClick={() => {
                          if (
                            packageLocked
                          ) {
                            return;
                          }

                          clearSeats();

                          setSystemType(
                            system.name,
                          );
                        }}
                        className={`rounded-xl border p-5 text-left transition-all ${
                          selected
                            ? "border-primary/60 bg-primary/15 text-neon-cyan"
                            : "border-border bg-surface-2/30 text-muted-foreground hover:border-primary/40"
                        } ${
                          disabled
                            ? "cursor-not-allowed opacity-40"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Monitor className="size-5" />

                          <div>
                            <p className="font-display text-sm font-bold">
                              {
                                system.label ||
                                system.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {Number(
                                system.totalStations ||
                                  system.stations ||
                                  system.stationCount ||
                                  0,
                              )}{" "}
                              stations

                              {!selectedPricingPlan && (
                                <>
                                  {" · "}Rs{" "}

                                  {Number(
                                    system.pricePerHour ||
                                      system.rate ||
                                      0,
                                  ).toLocaleString()}

                                  /hr default
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </Reveal>

            {/* GAME */}

            <Reveal
              delay={0.1}
              className="glass rounded-2xl p-6"
            >
              <StepHeader
                step={4}
                icon={
                  Gamepad2
                }
                title="Select A Game"
              />

              {gamesLoading ? (
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />

                  Loading available games...
                </div>
              ) : games.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {games.map(
                    (
                      game,
                    ) => {
                      const selected =
                        selectedGameId ===
                        game._id;

                      const displayRate =
                        Number(
                          game.rate ||
                            currentSystem?.pricePerHour ||
                            currentSystem?.rate ||
                            0,
                        );

                      return (
                        <button
                          key={
                            game._id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedGameId(
                              game._id,
                            )
                          }
                          className={`overflow-hidden rounded-xl border text-left transition-all ${
                            selected
                              ? "border-neon-green/70 bg-neon-green/15 shadow-[0_0_20px_-6px_var(--neon-green)]"
                              : "border-border bg-surface-2/30 hover:border-primary/40"
                          }`}
                        >
                          {game.poster && (
                            <div className="aspect-[16/7] overflow-hidden">
                              <img
                                src={
                                  game.poster
                                }
                                alt={
                                  game.title
                                }
                                loading="lazy"
                                className="size-full object-cover"
                              />
                            </div>
                          )}

                          <div className="p-4">
                            <div className="flex items-center gap-2">
                              <Gamepad2
                                className={`size-4 ${
                                  selected
                                    ? "text-neon-green"
                                    : "text-muted-foreground"
                                }`}
                              />

                              <span
                                className={`font-display text-xs font-bold ${
                                  selected
                                    ? "text-neon-green"
                                    : ""
                                }`}
                              >
                                {
                                  game.title
                                }
                              </span>
                            </div>

                            <p className="mt-2 text-[10px] text-muted-foreground">
                              {
                                game.category
                              }

                              {game.players
                                ? ` · ${game.players}`
                                : ""}
                            </p>

                            {!selectedPricingPlan && (
                              <p className="mt-2 text-[10px] font-medium text-neon-cyan">
                                Rs{" "}
                                {displayRate.toLocaleString()}
                                /hr
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No active games available for this platform.
                </div>
              )}
            </Reveal>

            {/* STATIONS */}

            <Reveal
              delay={0.12}
              className="glass rounded-2xl p-6"
            >
              <StepHeader
                step={5}
                icon={
                  Grid3x3
                }
                title="Select Stations"
              />

              {availabilityLoading && (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />

                  Checking live availability...
                </div>
              )}

              {stations.length ? (
                <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                  {stations.map(
                    (
                      station,
                    ) => {
                      const occupied =
                        occupiedPCs.includes(
                          station,
                        );

                      const selected =
                        seats.includes(
                          station,
                        );

                      return (
                        <button
                          key={
                            station
                          }
                          type="button"
                          disabled={
                            occupied
                          }
                          onClick={() =>
                            toggleSeat(
                              station,
                            )
                          }
                          className={`rounded-xl border px-2 py-3 text-xs font-bold transition-all ${
                            occupied
                              ? "cursor-not-allowed border-neon-red/20 bg-neon-red/10 text-neon-red/40"
                              : selected
                                ? "border-primary bg-primary/15 text-neon-cyan"
                                : "border-border bg-surface-2/30 hover:border-primary/40"
                          }`}
                        >
                          {
                            systemType
                          }{" "}
                          {
                            station
                          }
                        </button>
                      );
                    },
                  )}
                </div>
              ) : (
                <p className="mt-5 text-xs text-muted-foreground">
                  No stations configured for this platform.
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
                <span>
                  Selected:{" "}
                  {
                    seats.length
                  }
                </span>

                <span>
                  Occupied:{" "}
                  {
                    occupiedPCs.length
                  }
                </span>
              </div>
            </Reveal>

            {/* PAYMENT */}

            <Reveal
              delay={0.14}
              className="glass rounded-2xl p-6"
            >
              <StepHeader
                step={6}
                icon={
                  Wallet
                }
                title="Payment Method"
              />

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {config.paymentMethods.map(
                  (
                    method,
                  ) => {
                    const Icon =
                      paymentIcons[
                        method
                      ] ||
                      Wallet;

                    return (
                      <Button
                        key={
                          method
                        }
                        type="button"
                        variant={
                          payment ===
                          method
                            ? "hero"
                            : "glass"
                        }
                        onClick={() =>
                          setPayment(
                            method,
                          )
                        }
                      >
                        <Icon className="mr-2 size-4" />

                        {
                          method
                        }
                      </Button>
                    );
                  },
                )}
              </div>
            </Reveal>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <Reveal>
            <aside className="glass-static sticky top-24 rounded-2xl p-6">
              <StepHeader
                step={7}
                icon={
                  Gamepad2
                }
                title="Booking Summary"
              />

              <div className="mt-5 space-y-3 text-sm">
                {selectedPricingPlan && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Package
                    </span>

                    <strong className="text-right text-secondary">
                      {
                        selectedPricingPlan.name
                      }
                    </strong>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    Platform
                  </span>

                  <strong>
                    {
                      systemType ||
                      "—"
                    }
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    Date
                  </span>

                  <strong>
                    {
                      date ||
                      "—"
                    }
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    Start
                  </span>

                  <strong>
                    {
                      startTime ||
                      "—"
                    }
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    Duration
                  </span>

                  <strong>
                    {
                      hours
                    }h
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    Stations
                  </span>

                  <strong>
                    {
                      seats.length
                    }
                  </strong>
                </div>
              </div>

              <div className="neon-divider my-5" />

              {pricingLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-5 animate-spin text-neon-cyan" />
                </div>
              ) : pricing ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal
                    </span>

                    <span>
                      Rs{" "}

                      {Number(
                        pricing.subtotal,
                      ).toLocaleString()}
                    </span>
                  </div>

                  {pricing.discountAmount >
                    0 && (
                    <div className="flex justify-between gap-3 text-neon-green">
                      <span>
                        {selectedPricingPlan
                          ? "Package Discount"
                          : "Duration Discount"}
                      </span>

                      <span>
                        - Rs{" "}

                        {Number(
                          pricing.discountAmount,
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {pricing.membershipDiscountAmount >
                    0 && (
                    <div className="flex justify-between gap-3 text-neon-green">
                      <span>
                        {
                          pricing.membershipTierName
                        }{" "}

                        Membership{" "}

                        {
                          pricing.membershipDiscountPercentage
                        }
                        %
                      </span>

                      <span>
                        - Rs{" "}

                        {Number(
                          pricing.membershipDiscountAmount,
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {user &&
                    pricing.pointsAvailable >
                      0 && (
                      <div className="mt-4 rounded-xl border border-border bg-background/20 p-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="booking-points"
                            checked={
                              usePoints
                            }
                            onCheckedChange={(checked) =>
                              setUsePoints(
                                checked ===
                                  true,
                              )
                            }
                          />

                          <Label
                            htmlFor="booking-points"
                            className="cursor-pointer"
                          >
                            Use Loyalty Points
                          </Label>
                        </div>

                        <p className="mt-2 text-[10px] text-muted-foreground">
                          Available:{" "}

                          {Number(
                            pricing.pointsAvailable,
                          ).toLocaleString()}{" "}

                          points · 1 point = Rs 1
                        </p>
                      </div>
                    )}

                  {pricing.pointsDiscount >
                    0 && (
                    <div className="flex justify-between gap-3 text-neon-green">
                      <span>
                        Loyalty Points
                      </span>

                      <span>
                        - Rs{" "}

                        {Number(
                          pricing.pointsDiscount,
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="neon-divider my-4" />

                  <div className="flex items-end justify-between gap-3">
                    <span className="font-display text-xs tracking-[0.15em] text-muted-foreground uppercase">
                      Final Total
                    </span>

                    <strong className="font-display text-3xl font-black text-gradient">
                      Rs{" "}

                      {Number(
                        total,
                      ).toLocaleString()}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Select booking date and station(s) to calculate your total.
                </p>
              )}

              <Button
                variant="hero"
                size="xl"
                className="mt-6 w-full"
                disabled={
                  submitting ||
                  pricingLoading ||
                  !pricing
                }
                onClick={() =>
                  void handleConfirmBooking()
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />

                    Booking...
                  </>
                ) : selectedPricingPlan ? (
                  `Book ${selectedPricingPlan.name}`
                ) : (
                  "Confirm Booking"
                )}
              </Button>

              {selectedPricingPlan && (
                <p className="mt-3 text-center text-[9px] leading-4 text-muted-foreground">
                  Package price, duration, platform and timing are validated by the backend when the booking is submitted.
                </p>
              )}
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}