import {
  useEffect,
  useState,
} from "react";

import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  toast,
} from "sonner";

import {
  Ban,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Wallet,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Input,
} from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  cn,
} from "@/lib/utils";

import {
  PageHeader,
} from "@/components/admin/AdminShell";

import {
  bookingApi,
  type Booking,
  type BookingConfig,
  type CalendarSummary,
  type PaymentStatus,
  type PriceData,
} from "@/services/bookingApi";

import {
  gameApi,
  type Game,
} from "@/services/gameApi";

/*
|--------------------------------------------------------------------------
| META
|--------------------------------------------------------------------------
*/

const title =
  "Bookings & Reservations | Battle Hub Admin";

const description =
  "Manage bookings, payments, partial payments, confirmations and customer communication.";

export const Route =
  createFileRoute(
    "/admin/booking",
  )({
    head: () => ({
      meta: [
        {
          title,
        },

        {
          name:
            "description",

          content:
            description,
        },
      ],
    }),

    component:
      BookingsPage,
  });

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const PAGE_SIZE = 8;

const payTone: Record<
  PaymentStatus,
  string
> = {
  Paid:
    "bg-neon-green/15 text-neon-green",

  Partial:
    "bg-gold/15 text-gold",

  Unpaid:
    "bg-neon-red/15 text-neon-red",

  Refunded:
    "bg-secondary/15 text-secondary",
};

const bookingTone: Record<
  string,
  string
> = {
  Confirmed:
    "bg-neon-green/15 text-neon-green",

  Pending:
    "bg-gold/15 text-gold",

  Cancelled:
    "bg-neon-red/15 text-neon-red",

  Refunded:
    "bg-secondary/15 text-secondary",

  Completed:
    "bg-primary/15 text-neon-cyan",
};

function formatBookingTime(time: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);

  if (!match) {
    return time;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    return time;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${match[2]} ${period}`;
}

/*
|--------------------------------------------------------------------------
| WHATSAPP
|--------------------------------------------------------------------------
*/

function openWhatsApp(
  booking: Booking,
) {
  let phone =
    booking.customer.phone.replace(
      /\D/g,
      "",
    );

  /*
   * Pakistan:
   * 03001234567 -> 923001234567
   */

  if (
    phone.startsWith("0")
  ) {
    phone =
      "92" +
      phone.substring(1);
  }

  if (
    !phone.startsWith("92")
  ) {
    phone =
      "92" + phone;
  }

  const prefix =
    booking.systemType ===
    "PC"
      ? "PC"
      : "PS";

  const stations =
    booking.stations
      .slice()
      .sort(
        (a, b) =>
          a - b,
      )
      .map(
        (station) =>
          `${prefix}-${String(
            station,
          ).padStart(
            2,
            "0",
          )}`,
      )
      .join(", ");

  const platform =
    booking.systemType ===
    "PS5"
      ? "PlayStation 5"
      : "Gaming PC";

  const message =
`🎮 *Battle Hub BOOKING CONFIRMED*

Hi ${booking.customer.name},

Your booking has been confirmed successfully.

🆔 *Booking ID:* ${booking.bookingId}
📅 *Date:* ${booking.bookingDate}
⏰ *Start Time:* ${formatBookingTime(booking.startTime)}
⌛ *Duration:* ${booking.duration} hour${booking.duration > 1 ? "s" : ""}
🖥️ *Platform:* ${platform}
🎮 *Game:* ${booking.game}
💺 *Station:* ${stations}

💰 *Total Amount:* Rs ${booking.totalAmount.toLocaleString()}
✅ *Received:* Rs ${booking.paidAmount.toLocaleString()}
⏳ *Due:* Rs ${booking.dueAmount.toLocaleString()}
💳 *Payment Status:* ${booking.paymentStatus}

Please arrive 10 minutes before your booking time.

Thank you,
*Battle Hub*`;

  const url =
    `https://wa.me/${phone}?text=${encodeURIComponent(
      message,
    )}`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer",
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function BookingsPage() {
  /*
  |--------------------------------------------------------------------------
  | FILTERS
  |--------------------------------------------------------------------------
  */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [
    system,
    setSystem,
  ] = useState("all");

  const [
    payment,
    setPayment,
  ] = useState("all");

  const [
    type,
    setType,
  ] = useState("all");

  const [
    bookingStatus,
    setBookingStatus,
  ] = useState("all");

  const [
    page,
    setPage,
  ] = useState(1);

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const [
    bookings,
    setBookings,
  ] =
    useState<Booking[]>([]);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    pages,
    setPages,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState<string | null>(
      null,
    );

  /*
  |--------------------------------------------------------------------------
  | MANUAL BOOKING
  |--------------------------------------------------------------------------
  */

  const [
    manualOpen,
    setManualOpen,
  ] = useState(false);

  const [
    manualConfig,
    setManualConfig,
  ] =
    useState<BookingConfig | null>(
      null,
    );

  const [
    manualGames,
    setManualGames,
  ] =
    useState<Game[]>([]);

  const [
    manualGamesLoading,
    setManualGamesLoading,
  ] = useState(false);

  const [
    manualAvailabilityLoading,
    setManualAvailabilityLoading,
  ] = useState(false);

  const [
    manualPricingLoading,
    setManualPricingLoading,
  ] = useState(false);

  const [
    manualPricing,
    setManualPricing,
  ] =
    useState<PriceData | null>(
      null,
    );

  const [
    manualOccupied,
    setManualOccupied,
  ] =
    useState<number[]>([]);

  const [
    manualSubmitting,
    setManualSubmitting,
  ] = useState(false);

  const [
    manualName,
    setManualName,
  ] = useState("");

  const [
    manualPhone,
    setManualPhone,
  ] = useState("");

  const [
    manualEmail,
    setManualEmail,
  ] = useState("");

  const [
    manualDate,
    setManualDate,
  ] = useState("");

  const [
    manualTime,
    setManualTime,
  ] = useState("");

  const [
    manualDuration,
    setManualDuration,
  ] = useState(1);

  const [
    manualSystem,
    setManualSystem,
  ] = useState("");

  const [
    manualGameId,
    setManualGameId,
  ] = useState("");

  const [
    manualStations,
    setManualStations,
  ] =
    useState<number[]>([]);

  const [
    manualPaymentMethod,
    setManualPaymentMethod,
  ] = useState("Cash");

  const [
    manualReceived,
    setManualReceived,
  ] = useState("");

  const [
    manualNotes,
    setManualNotes,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | CALENDAR
  |--------------------------------------------------------------------------
  */

  const [
    calendar,
    setCalendar,
  ] =
    useState<
      CalendarSummary[]
    >([]);

  const [
    calendarLoading,
    setCalendarLoading,
  ] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | SEARCH DEBOUNCE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setDebouncedSearch(
            search.trim(),
          );

          setPage(1);
        },

        350,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [search]);

  /*
  |--------------------------------------------------------------------------
  | LOAD BOOKINGS
  |--------------------------------------------------------------------------
  */

  async function loadBookings() {
    try {
      setLoading(true);

      const response =
        await bookingApi.list({
          search:
            debouncedSearch,

          systemType:
            system,

          paymentStatus:
            payment,

          bookingType:
            type,

          bookingStatus,

          page,

          limit:
            PAGE_SIZE,

          sort:
            "-createdAt",
        });

      setBookings(
        response.data,
      );

      setTotal(
        response.pagination
          .total,
      );

      setPages(
        Math.max(
          response.pagination
            .pages,

          1,
        ),
      );
    } catch (error) {
      console.error(
        "Load bookings error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load bookings",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, [
    debouncedSearch,
    system,
    payment,
    type,
    bookingStatus,
    page,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CALENDAR
  |--------------------------------------------------------------------------
  */

  async function loadCalendar() {
    try {
      setCalendarLoading(
        true,
      );

      const response =
        await bookingApi.getCalendarSummary();

      setCalendar(
        response.data,
      );
    } catch (error) {
      console.error(
        "Calendar error:",
        error,
      );

      toast.error(
        "Unable to load calendar",
      );
    } finally {
      setCalendarLoading(
        false,
      );
    }
  }

  useEffect(() => {
    loadCalendar();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD MANUAL BOOKING CONFIG
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function loadManualConfig() {
      try {
        const response =
          await bookingApi.getConfig();

        if (!mounted) {
          return;
        }

        const config =
          response.data;

        setManualConfig(
          config,
        );

        const firstSystem =
          Array.isArray(
            config.systems,
          )
            ? config.systems[0]
            : undefined;

        const firstDuration =
          Array.isArray(
            config.durations,
          )
            ? config.durations[0]
            : undefined;

        const firstPayment =
          Array.isArray(
            config.paymentMethods,
          )
            ? config.paymentMethods[0]
            : undefined;

        setManualSystem(
          firstSystem?.name ||
            "PC",
        );

        setManualDuration(
          firstDuration ||
            1,
        );

        setManualPaymentMethod(
          firstPayment ||
            "Cash",
        );

        setManualTime(
          config.openingTime ||
            "11:00",
        );
      } catch (error) {
        console.error(
          "Manual booking config error:",
          error,
        );
      }
    }

    void loadManualConfig();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD GAMES FOR MANUAL BOOKING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function loadManualGames() {
      if (!manualSystem) {
        setManualGames([]);
        setManualGameId("");
        return;
      }

      try {
        setManualGamesLoading(
          true,
        );

        const response =
          await gameApi.publicList({
            platform:
              manualSystem,
          });

        if (!mounted) {
          return;
        }

        const games =
          Array.isArray(
            response.data,
          )
            ? response.data
            : [];

        setManualGames(
          games,
        );

        setManualGameId(
          (current) => {
            const exists =
              games.some(
                (game) =>
                  game._id ===
                  current,
              );

            return exists
              ? current
              : games[0]?._id ||
                  "";
          },
        );

        setManualStations(
          [],
        );

        setManualOccupied(
          [],
        );

        setManualPricing(
          null,
        );
      } catch (error) {
        console.error(
          "Manual games error:",
          error,
        );

        if (mounted) {
          setManualGames([]);
          setManualGameId("");
        }
      } finally {
        if (mounted) {
          setManualGamesLoading(
            false,
          );
        }
      }
    }

    void loadManualGames();

    return () => {
      mounted = false;
    };
  }, [
    manualSystem,
  ]);

  /*
  |--------------------------------------------------------------------------
  | MANUAL BOOKING AVAILABILITY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function checkAvailability() {
      if (
        !manualDate ||
        !manualTime ||
        !manualDuration ||
        !manualSystem
      ) {
        setManualOccupied(
          [],
        );

        return;
      }

      try {
        setManualAvailabilityLoading(
          true,
        );

        const response =
          await bookingApi.getAvailability(
            {
              date:
                manualDate,

              startTime:
                manualTime,

              hours:
                manualDuration,

              systemType:
                manualSystem,
            },
          );

        if (!mounted) {
          return;
        }

        const occupied =
          Array.isArray(
            response.data
              .occupiedStations,
          )
            ? response.data
                .occupiedStations
            : [];

        setManualOccupied(
          occupied,
        );

        setManualStations(
          (current) =>
            current.filter(
              (station) =>
                !occupied.includes(
                  station,
                ),
            ),
        );
      } catch (error) {
        console.error(
          "Manual availability error:",
          error,
        );

        if (mounted) {
          setManualOccupied(
            [],
          );
        }
      } finally {
        if (mounted) {
          setManualAvailabilityLoading(
            false,
          );
        }
      }
    }

    void checkAvailability();

    return () => {
      mounted = false;
    };
  }, [
    manualDate,
    manualTime,
    manualDuration,
    manualSystem,
  ]);

  /*
  |--------------------------------------------------------------------------
  | MANUAL BOOKING PRICE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function calculateManualPrice() {
      if (
        !manualStations.length ||
        !manualSystem ||
        !manualGameId
      ) {
        setManualPricing(
          null,
        );

        return;
      }

      try {
        setManualPricingLoading(
          true,
        );

        const response =
          await bookingApi.calculate(
            manualDuration,
            manualStations,
            manualSystem,
            manualGameId,
          );

        if (mounted) {
          setManualPricing(
            response.data,
          );
        }
      } catch (error) {
        console.error(
          "Manual pricing error:",
          error,
        );

        if (mounted) {
          setManualPricing(
            null,
          );
        }
      } finally {
        if (mounted) {
          setManualPricingLoading(
            false,
          );
        }
      }
    }

    void calculateManualPrice();

    return () => {
      mounted = false;
    };
  }, [
    manualDuration,
    manualStations,
    manualSystem,
    manualGameId,
  ]);

  function toggleManualStation(
    station: number,
  ) {
    if (
      manualOccupied.includes(
        station,
      )
    ) {
      return;
    }

    setManualStations(
      (current) =>
        current.includes(
          station,
        )
          ? current.filter(
              (value) =>
                value !==
                station,
            )
          : [
              ...current,
              station,
            ],
    );
  }

  function resetManualBooking() {
    setManualName("");
    setManualPhone("");
    setManualEmail("");
    setManualDate("");
    setManualStations([]);
    setManualOccupied([]);
    setManualPricing(null);
    setManualReceived(0);
    setManualNotes("");

    if (!manualConfig) {
      return;
    }

    const firstSystem =
      Array.isArray(
        manualConfig.systems,
      )
        ? manualConfig.systems[0]
        : undefined;

    const firstDuration =
      Array.isArray(
        manualConfig.durations,
      )
        ? manualConfig.durations[0]
        : undefined;

    const firstPayment =
      Array.isArray(
        manualConfig.paymentMethods,
      )
        ? manualConfig.paymentMethods[0]
        : undefined;

    setManualSystem(
      firstSystem?.name ||
        "PC",
    );

    setManualDuration(
      firstDuration ||
        1,
    );

    setManualTime(
      manualConfig.openingTime ||
        "11:00",
    );

    setManualPaymentMethod(
      firstPayment ||
        "Cash",
    );

    setManualGameId("");
  }

  async function handleCreateManualBooking() {
    if (
      !manualName.trim()
    ) {
      toast.error(
        "Customer name is required",
      );

      return;
    }

    if (
      !manualPhone.trim()
    ) {
      toast.error(
        "Customer phone is required",
      );

      return;
    }

    if (!manualDate) {
      toast.error(
        "Select booking date",
      );

      return;
    }

    if (!manualTime) {
      toast.error(
        "Select start time",
      );

      return;
    }

    if (!manualSystem) {
      toast.error(
        "Select platform",
      );

      return;
    }

    if (!manualGameId) {
      toast.error(
        "Select game",
      );

      return;
    }

    if (
      !manualStations.length
    ) {
      toast.error(
        "Select at least one station",
      );

      return;
    }

    if (!manualPricing) {
      toast.error(
        "Booking price is not ready yet",
      );

      return;
    }

    const received =
      Number(
        manualReceived,
      ) || 0;

    if (received < 0) {
      toast.error(
        "Received amount cannot be negative",
      );

      return;
    }

    if (
      received >
      manualPricing.totalAmount
    ) {
      toast.error(
        `Received amount cannot exceed Rs ${manualPricing.totalAmount.toLocaleString()}`,
      );

      return;
    }

    try {
      setManualSubmitting(
        true,
      );

      /*
       * Re-check availability immediately
       * before creating the booking.
       */
      const availability =
        await bookingApi.getAvailability(
          {
            date:
              manualDate,

            startTime:
              manualTime,

            hours:
              manualDuration,

            systemType:
              manualSystem,
          },
        );

      const occupied =
        Array.isArray(
          availability.data
            .occupiedStations,
        )
          ? availability.data
              .occupiedStations
          : [];

      const conflict =
        manualStations.some(
          (station) =>
            occupied.includes(
              station,
            ),
        );

      if (conflict) {
        setManualOccupied(
          occupied,
        );

        setManualStations(
          (current) =>
            current.filter(
              (station) =>
                !occupied.includes(
                  station,
                ),
            ),
        );

        toast.error(
          "One of the selected stations has just been booked. Please select another station.",
        );

        return;
      }

      const response =
        await bookingApi.create({
          customer: {
            name:
              manualName.trim(),

            phone:
              manualPhone.trim(),

            email:
              manualEmail.trim() ||
              undefined,
          },

          bookingDate:
            manualDate,

          startTime:
            manualTime,

          duration:
            manualDuration,

          stations:
            manualStations,

          systemType:
            manualSystem,

          gameId:
            manualGameId,

          bookingType:
            "Walk-in",

          paymentMethod:
            manualPaymentMethod,

          notes:
            manualNotes.trim(),
        });

      const created =
        response.data;

      /*
       * Admin-created bookings are
       * confirmed immediately.
       */
      await bookingApi.confirm(
        created._id,
      );

      /*
       * Optional initial payment.
       */
      if (received > 0) {
        await bookingApi.addPayment(
          created._id,
          {
            amount:
              received,

            method:
              manualPaymentMethod,

            note:
              "Payment received during admin booking creation",
          },
        );
      }

      toast.success(
        `Booking created · ${created.bookingId}`,
      );

      resetManualBooking();

      setManualOpen(
        false,
      );

      setPage(1);

      await refreshAll();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create booking",
      );
    } finally {
      setManualSubmitting(
        false,
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  async function refreshAll() {
    await Promise.all([
      loadBookings(),
      loadCalendar(),
    ]);
  }

  /*
  |--------------------------------------------------------------------------
  | CONFIRM BOOKING
  |--------------------------------------------------------------------------
  */

  async function handleConfirm(
    booking: Booking,
  ) {
    const confirmed =
      window.confirm(
        `Confirm booking ${booking.bookingId}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        booking._id,
      );

      await bookingApi.confirm(
        booking._id,
      );

      toast.success(
        `Booking confirmed · ${booking.bookingId}`,
      );

      await refreshAll();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to confirm booking",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RECEIVE PAYMENT
  |--------------------------------------------------------------------------
  */

async function handleAddPayment(
  booking: Booking,
) {
  if (
    booking.paymentStatus ===
    "Refunded"
  ) {
    toast.error(
      "Refunded booking cannot receive payment",
    );

    return;
  }

  if (
    booking.dueAmount <= 0
  ) {
    toast.success(
      "This booking is already fully paid",
    );

    return;
  }

  const amountValue =
    window.prompt(
      `RECEIVE PAYMENT

Booking: ${booking.bookingId}

Total: Rs ${booking.totalAmount.toLocaleString()}
Received: Rs ${booking.paidAmount.toLocaleString()}
Due: Rs ${booking.dueAmount.toLocaleString()}

Enter amount received:`,

      String(
        booking.dueAmount,
      ),
    );

  if (
    amountValue === null
  ) {
    return;
  }

  const amount =
    Number(
      amountValue,
    );

  if (
    !Number.isFinite(
      amount,
    ) ||
    amount <= 0
  ) {
    toast.error(
      "Enter a valid payment amount",
    );

    return;
  }

  if (
    amount >
    booking.dueAmount
  ) {
    toast.error(
      `Maximum due amount is Rs ${booking.dueAmount.toLocaleString()}`,
    );

    return;
  }

  const method =
    window.prompt(
      `PAYMENT METHOD

Enter exactly one:

Cash
Easypaisa
JazzCash`,

      booking.paymentMethod ||
        "Cash",
    );

  if (!method) {
    return;
  }

  const normalizedMethod =
    method.trim();

  const allowedMethods = [
    "Cash",
    "Easypaisa",
    "JazzCash",
  ];

  if (
    !allowedMethods.includes(
      normalizedMethod,
    )
  ) {
    toast.error(
      "Payment method must be Cash, Easypaisa or JazzCash",
    );

    return;
  }

  const note =
    window.prompt(
      "Payment note (optional):",
      "",
    );

  if (
    note === null
  ) {
    return;
  }

  try {
    setActionLoading(
      booking._id,
    );

    const response =
      await bookingApi.addPayment(
        booking._id,
        {
          amount,

          method:
            normalizedMethod,

          note,
        },
      );

    toast.success(
      response.message,
    );

    await refreshAll();
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "Unable to receive payment",
    );
  } finally {
    setActionLoading(
      null,
    );
  }
}

  /*
  |--------------------------------------------------------------------------
  | CANCEL
  |--------------------------------------------------------------------------
  */

  async function handleCancel(
    booking: Booking,
  ) {
    const reason =
      window.prompt(
        "Cancellation reason:",

        "Cancelled by admin",
      );

    if (
      reason === null
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Cancel booking ${booking.bookingId}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        booking._id,
      );

      await bookingApi.cancel(
        booking._id,

        reason,
      );

      toast.success(
        `Booking cancelled · ${booking.bookingId}`,
      );

      await refreshAll();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to cancel booking",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | REFUND
  |--------------------------------------------------------------------------
  */

  async function handleRefund(
    booking: Booking,
  ) {
    if (
      booking.paidAmount <= 0
    ) {
      toast.error(
        "No received payment available to refund",
      );

      return;
    }

    const amountValue =
      window.prompt(
        `REFUND

Received: Rs ${booking.paidAmount.toLocaleString()}

Enter refund amount:`,

        String(
          booking.paidAmount,
        ),
      );

    if (
      amountValue === null
    ) {
      return;
    }

    const amount =
      Number(
        amountValue,
      );

    if (
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {
      toast.error(
        "Invalid refund amount",
      );

      return;
    }

    if (
      amount >
      booking.paidAmount
    ) {
      toast.error(
        `Refund cannot exceed Rs ${booking.paidAmount.toLocaleString()}`,
      );

      return;
    }

    const reason =
      window.prompt(
        "Refund reason:",

        "Refunded by admin",
      );

    if (
      reason === null
    ) {
      return;
    }

    if (
      !window.confirm(
        `Refund Rs ${amount.toLocaleString()} for ${booking.bookingId}?`,
      )
    ) {
      return;
    }

    try {
      setActionLoading(
        booking._id,
      );

      await bookingApi.refund(
        booking._id,

        {
          amount,
          reason,
        },
      );

      toast.success(
        `Refund processed · ${booking.bookingId}`,
      );

      await refreshAll();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to process refund",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PRINT
  |--------------------------------------------------------------------------
  */

  function handlePrint(booking: Booking) {
  const prefix = booking.systemType === "PC" ? "PC" : "PS";

  const stations = booking.stations
    .slice()
    .sort((a, b) => a - b)
    .map((station) => `${prefix}-${String(station).padStart(2, "0")}`)
    .join(", ");

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    toast.error("Please allow popups");
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
    <head>
      <title>${booking.bookingId}</title>
      <style>
        * {
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          max-width: 480px;
          margin: 0 auto;
          padding: 0;
          color: #1a1a1a;
          background: #fff;
        }

        .receipt {
          border: 1px solid #eaeaea;
          border-radius: 12px;
          overflow: hidden;
          margin: 30px 16px;
        }

        .header {
          background: linear-gradient(135deg, #1e1b4b, #4338ca);
          color: #fff;
          padding: 28px 30px 22px;
          text-align: center;
        }

        .header h1 {
          margin: 0;
          font-size: 24px;
          letter-spacing: 0.5px;
          font-weight: 700;
        }

        .header .sub {
          margin-top: 4px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          opacity: 0.85;
        }

        .booking-id {
          text-align: center;
          padding: 14px 20px;
          background: #f8f8fb;
          border-bottom: 1px dashed #ddd;
          font-size: 13px;
          color: #555;
        }

        .booking-id strong {
          color: #1e1b4b;
          font-size: 15px;
          letter-spacing: 0.5px;
        }

        .details {
          padding: 20px 30px 6px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
        }

        .row:last-child {
          border-bottom: none;
        }

        .row span {
          color: #888;
        }

        .row strong {
          text-align: right;
          font-weight: 600;
          color: #222;
        }

        .payment-box {
          margin: 16px 30px 24px;
          padding: 18px 20px;
          background: #f8f8fb;
          border-radius: 10px;
          border: 1px solid #eee;
        }

        .payment-box .row {
          border-bottom: 1px solid #eee;
        }

        .payment-box .row:last-child {
          border-bottom: none;
        }

        .total strong {
          font-size: 22px;
          font-weight: 800;
          color: #1e1b4b;
        }

        .received strong {
          color: #16a34a;
        }

        .due strong {
          color: #d97706;
        }

        .status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          background: #eef2ff;
          color: #4338ca;
        }

        .footer {
          text-align: center;
          padding: 18px 20px 26px;
          font-size: 11px;
          color: #aaa;
          letter-spacing: 0.3px;
        }

        @media print {
          body {
            margin: 0;
          }
          .receipt {
            margin: 0;
            border: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>Battle Hub</h1>
          <div class="sub">Booking Receipt</div>
        </div>

        <div class="booking-id">
          Booking ID &nbsp; <strong>${booking.bookingId}</strong>
        </div>

        <div class="details">
          <div class="row">
            <span>Customer</span>
            <strong>${booking.customer.name}</strong>
          </div>
          <div class="row">
            <span>Phone</span>
            <strong>${booking.customer.phone}</strong>
          </div>
          <div class="row">
            <span>Date</span>
            <strong>${booking.bookingDate}</strong>
          </div>
          <div class="row">
            <span>Start Time</span>
            <strong>${formatBookingTime(booking.startTime)}</strong>
          </div>
          <div class="row">
            <span>Duration</span>
            <strong>${booking.duration} hrs</strong>
          </div>
          <div class="row">
            <span>Platform</span>
            <strong>${booking.systemType}</strong>
          </div>
          <div class="row">
            <span>Game</span>
            <strong>${booking.game}</strong>
          </div>
          <div class="row">
            <span>Stations</span>
            <strong>${stations}</strong>
          </div>
        </div>

        <div class="payment-box">
          <div class="row total">
            <span>Total</span>
            <strong>Rs ${booking.totalAmount.toLocaleString()}</strong>
          </div>
          <div class="row received">
            <span>Received</span>
            <strong>Rs ${booking.paidAmount.toLocaleString()}</strong>
          </div>
          <div class="row due">
            <span>Due</span>
            <strong>Rs ${booking.dueAmount.toLocaleString()}</strong>
          </div>
          <div class="row">
            <span>Payment Status</span>
            <strong><span class="status-badge">${booking.paymentStatus}</span></strong>
          </div>
        </div>

        <div class="footer">
          Thank you for choosing Battle Hub &mdash; Game on!
        </div>
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

  /*
  |--------------------------------------------------------------------------
  | JSX
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Bookings & Reservations"
        subtitle="Manage PC and PlayStation bookings, partial payments, due amounts and customer confirmations."
      />

      <div className="mb-5 flex flex-wrap justify-end gap-2">
        <Button
          variant="hero"
          onClick={() =>
            setManualOpen(
              (current) =>
                !current,
            )
          }
        >
          <Plus className="mr-2 size-4" />

          Create Booking
        </Button>
      </div>

      {manualOpen && (
        <section className="glass-static mb-6 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-bold tracking-[0.14em] uppercase">
                Create Manual Booking
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Admin-created bookings are saved as Walk-in and confirmed automatically.
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetManualBooking();
                setManualOpen(
                  false,
                );
              }}
            >
              Close
            </Button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Input
              value={
                manualName
              }
              onChange={(event) =>
                setManualName(
                  event.target.value,
                )
              }
              placeholder="Customer name"
            />

            <Input
              value={
                manualPhone
              }
              onChange={(event) =>
                setManualPhone(
                  event.target.value,
                )
              }
              placeholder="Phone number"
            />

            <Input
              type="email"
              value={
                manualEmail
              }
              onChange={(event) =>
                setManualEmail(
                  event.target.value,
                )
              }
              placeholder="Email (optional)"
            />

            <Input
              type="date"
              value={
                manualDate
              }
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(event) =>
                setManualDate(
                  event.target.value,
                )
              }
            />

            <Input
              type="time"
              value={
                manualTime
              }
              min={
                manualConfig?.openingTime ||
                "11:00"
              }
              max={
                manualConfig?.closingTime ||
                "23:00"
              }
              onChange={(event) =>
                setManualTime(
                  event.target.value,
                )
              }
            />

            <Select
              value={
                manualSystem
              }
              onValueChange={
                setManualSystem
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>

              <SelectContent>
                {(Array.isArray(
                  manualConfig?.systems,
                )
                  ? manualConfig.systems
                  : []
                ).map(
                  (item) => (
                    <SelectItem
                      key={
                        item.name
                      }
                      value={
                        item.name
                      }
                    >
                      {
                        item.label
                      }
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select
              value={String(
                manualDuration,
              )}
              onValueChange={(
                value,
              ) =>
                setManualDuration(
                  Number(value),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>

              <SelectContent>
                {(Array.isArray(
                  manualConfig?.durations,
                )
                  ? manualConfig.durations
                  : []
                ).map(
                  (duration) => (
                    <SelectItem
                      key={
                        duration
                      }
                      value={String(
                        duration,
                      )}
                    >
                      {duration} hour
                      {duration >
                      1
                        ? "s"
                        : ""}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select
              value={
                manualGameId
              }
              onValueChange={
                setManualGameId
              }
              disabled={
                manualGamesLoading ||
                !manualGames.length
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    manualGamesLoading
                      ? "Loading games..."
                      : "Select game"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {manualGames.map(
                  (game) => (
                    <SelectItem
                      key={
                        game._id
                      }
                      value={
                        game._id
                      }
                    >
                      {game.title} · Rs{" "}
                      {Number(
                        game.rate ||
                          0,
                      ).toLocaleString()}
                      /hr
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select
              value={
                manualPaymentMethod
              }
              onValueChange={
                setManualPaymentMethod
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>

              <SelectContent>
                {(Array.isArray(
                  manualConfig?.paymentMethods,
                )
                  ? manualConfig.paymentMethods
                  : [
                      "Cash",
                      "Easypaisa",
                      "JazzCash",
                    ]
                ).map(
                  (method) => (
                    <SelectItem
                      key={
                        method
                      }
                      value={
                        method
                      }
                    >
                      {
                        method
                      }
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Input
  type="text"
  value={manualReceived}
  onChange={(event) => {
    const val = event.target.value;
    // Sirf valid non-negative numbers aur ek optional decimal dot allow karega
    if (/^\d*\.?\d*$/.test(val)) {
      setManualReceived(val);
    }
  }}
  placeholder="Amount received"
/>

            <Input
              value={
                manualNotes
              }
              onChange={(event) =>
                setManualNotes(
                  event.target.value,
                )
              }
              placeholder="Notes (optional)"
            />
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-xs font-bold tracking-[0.14em] uppercase">
                  Select Stations
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {manualAvailabilityLoading
                    ? "Checking availability..."
                    : "Red stations are already occupied."}
                </p>
              </div>

              {manualPricingLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />

                  Calculating...
                </div>
              ) : manualPricing ? (
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Total
                  </p>

                  <p className="font-display text-xl font-black text-neon-cyan">
                    Rs{" "}
                    {manualPricing.totalAmount.toLocaleString()}
                  </p>

                  {manualPricing.discountPercentage >
                    0 && (
                    <p className="text-[10px] text-neon-green">
                      {
                        manualPricing.discountPercentage
                      }
                      % discount applied
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
              {Array.from(
                {
                  length:
                    Number(
                      (
                        Array.isArray(
                          manualConfig?.systems,
                        )
                          ? manualConfig.systems
                          : []
                      ).find(
                        (item) =>
                          item.name ===
                          manualSystem,
                      )
                        ?.totalStations ||
                        0,
                    ),
                },
                (_, index) =>
                  index + 1,
              ).map(
                (station) => {
                  const occupied =
                    manualOccupied.includes(
                      station,
                    );

                  const selected =
                    manualStations.includes(
                      station,
                    );

                  const prefix =
                    manualSystem ===
                    "PS5"
                      ? "PS"
                      : "PC";

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
                        toggleManualStation(
                          station,
                        )
                      }
                      className={cn(
                        "h-10 rounded-lg border font-display text-[10px] font-bold transition-colors",

                        occupied
                          ? "cursor-not-allowed border-destructive/30 bg-destructive/10 text-destructive"
                          : selected
                            ? "border-neon-green/60 bg-neon-green/15 text-neon-green"
                            : "border-border bg-background/30 text-muted-foreground hover:border-primary/50 hover:text-neon-cyan",
                      )}
                    >
                      {prefix}-
                      {String(
                        station,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <div className="text-xs text-muted-foreground">
              <span>
                Stations:{" "}
                {
                  manualStations.length
                }
              </span>

              <span className="mx-2">
                ·
              </span>

              <span>
                Received: Rs{" "}
                {Number(
                  manualReceived ||
                    0,
                ).toLocaleString()}
              </span>

              <span className="mx-2">
                ·
              </span>

              <span>
                Due: Rs{" "}
                {Math.max(
                  Number(
                    manualPricing
                      ?.totalAmount ||
                      0,
                  ) -
                    Number(
                      manualReceived ||
                        0,
                    ),
                  0,
                ).toLocaleString()}
              </span>
            </div>

            <Button
              variant="hero"
              disabled={
                manualSubmitting ||
                manualGamesLoading ||
                manualAvailabilityLoading ||
                manualPricingLoading ||
                !manualPricing
              }
              onClick={
                handleCreateManualBooking
              }
            >
              {manualSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />

                  Creating...
                </>
              ) : (
                "Create & Confirm Booking"
              )}
            </Button>
          </div>
        </section>
      )}

      <Tabs defaultValue="table">

        <TabsList className="mb-4">

          <TabsTrigger value="table">
            Table View
          </TabsTrigger>

          <TabsTrigger value="calendar">
            Calendar View
          </TabsTrigger>

        </TabsList>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <TabsContent value="table">

          <div className="glass-static rounded-2xl p-4 sm:p-5">

            {/* FILTERS */}

            <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">

              <div className="relative">

                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={
                    search
                  }
                  onChange={(e) =>
                    setSearch(
                      e.target.value,
                    )
                  }
                  placeholder="Search booking / customer / game"
                  className="pl-9"
                />

              </div>

              {/* PLATFORM */}

              <Select
                value={system}
                onValueChange={(
                  value,
                ) => {
                  setSystem(
                    value,
                  );

                  setPage(1);
                }}
              >

                <SelectTrigger>
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">
                    All Platforms
                  </SelectItem>

                  <SelectItem value="PC">
                    Gaming PC
                  </SelectItem>

                  <SelectItem value="PS5">
                    PlayStation 5
                  </SelectItem>

                </SelectContent>

              </Select>

              {/* PAYMENT */}

              <Select
                value={
                  payment
                }
                onValueChange={(
                  value,
                ) => {
                  setPayment(
                    value,
                  );

                  setPage(1);
                }}
              >

                <SelectTrigger>
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">
                    All Payments
                  </SelectItem>

                  <SelectItem value="Unpaid">
                    Unpaid
                  </SelectItem>

                  <SelectItem value="Partial">
                    Partial
                  </SelectItem>

                  <SelectItem value="Paid">
                    Paid
                  </SelectItem>

                  <SelectItem value="Refunded">
                    Refunded
                  </SelectItem>

                </SelectContent>

              </Select>

              {/* TYPE */}

              <Select
                value={type}
                onValueChange={(
                  value,
                ) => {
                  setType(
                    value,
                  );

                  setPage(1);
                }}
              >

                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">
                    All Types
                  </SelectItem>

                  <SelectItem value="Online">
                    Online
                  </SelectItem>

                  <SelectItem value="Walk-in">
                    Walk-in
                  </SelectItem>

                </SelectContent>

              </Select>

              {/* STATUS */}

              <Select
                value={
                  bookingStatus
                }
                onValueChange={(
                  value,
                ) => {
                  setBookingStatus(
                    value,
                  );

                  setPage(1);
                }}
              >

                <SelectTrigger>
                  <SelectValue placeholder="Booking Status" />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">
                    All Status
                  </SelectItem>

                  <SelectItem value="Pending">
                    Pending
                  </SelectItem>

                  <SelectItem value="Confirmed">
                    Confirmed
                  </SelectItem>

                  <SelectItem value="Cancelled">
                    Cancelled
                  </SelectItem>

                  <SelectItem value="Completed">
                    Completed
                  </SelectItem>

                  <SelectItem value="Refunded">
                    Refunded
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    {[
                      "Booking",
                      "Customer",
                      "Platform",
                      "Game",
                      "Date / Time",
                      "Station",
                      "Total",
                      "Received",
                      "Due",
                      "Payment",
                      "Status",
                      "Type",
                      "Actions",
                    ].map(
                      (
                        heading,
                      ) => (
                        <TableHead
                          key={
                            heading
                          }
                          className="whitespace-nowrap text-[10px] tracking-[0.12em] uppercase"
                        >
                          {
                            heading
                          }
                        </TableHead>
                      ),
                    )}

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {loading ? (

                    <TableRow>

                      <TableCell
                        colSpan={
                          13
                        }
                        className="py-16 text-center"
                      >

                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">

                          <Loader2 className="size-4 animate-spin" />

                          Loading bookings...

                        </div>

                      </TableCell>

                    </TableRow>

                  ) : (
                    <>
                      {bookings.map(
                        (
                          booking,
                        ) => {
                          const busy =
                            actionLoading ===
                            booking._id;

                          const prefix =
                            booking.systemType ===
                            "PC"
                              ? "PC"
                              : "PS";

                          const stations =
                            booking.stations
                              .slice()
                              .sort(
                                (
                                  a,
                                  b,
                                ) =>
                                  a -
                                  b,
                              )
                              .map(
                                (
                                  station,
                                ) =>
                                  `${prefix}-${String(
                                    station,
                                  ).padStart(
                                    2,
                                    "0",
                                  )}`,
                              )
                              .join(
                                ", ",
                              );

                          return (
                            <TableRow
                              key={
                                booking._id
                              }
                            >

                              {/* BOOKING */}

                              <TableCell>

                                <span className="block whitespace-nowrap font-display text-xs font-bold">
                                  {
                                    booking.bookingId
                                  }
                                </span>

                                <span className="mt-1 block whitespace-nowrap text-[9px] text-muted-foreground">
                                  {new Date(
                                    booking.createdAt,
                                  ).toLocaleString()}
                                </span>

                              </TableCell>

                              {/* CUSTOMER */}

                              <TableCell>

                                <span className="block whitespace-nowrap text-sm">
                                  {
                                    booking.customer.name
                                  }
                                </span>

                                <span className="block whitespace-nowrap text-[11px] text-muted-foreground">
                                  {
                                    booking.customer.phone
                                  }
                                </span>

                              </TableCell>

                              {/* PLATFORM */}

                              <TableCell>

                                <Badge variant="outline">
                                  {booking.systemType ===
                                  "PS5"
                                    ? "PS5"
                                    : "PC"}
                                </Badge>

                              </TableCell>

                              {/* GAME */}

                              <TableCell className="whitespace-nowrap text-xs text-neon-cyan">
                                {
                                  booking.game
                                }
                              </TableCell>

                              {/* DATE / TIME */}

                              <TableCell>

                                <span className="block whitespace-nowrap text-sm">
                                  {
                                    booking.bookingDate
                                  }
                                </span>

                                <span className="block whitespace-nowrap text-[11px] text-muted-foreground">
                                  {
                                    formatBookingTime(booking.startTime)
                                  }{" "}
                                  ·{" "}
                                  {
                                    booking.duration
                                  }{" "}
                                  hrs
                                </span>

                              </TableCell>

                              {/* STATION */}

                              <TableCell className="whitespace-nowrap font-display text-xs text-neon-green">
                                {
                                  stations
                                }
                              </TableCell>

                              {/* TOTAL */}

                              <TableCell className="whitespace-nowrap">

                                <span className="font-medium">
                                  Rs{" "}
                                  {booking.totalAmount.toLocaleString()}
                                </span>

                                {booking.discountPercentage >
                                  0 && (

                                  <span className="mt-1 block text-[9px] text-neon-green">
                                    -
                                    {
                                      booking.discountPercentage
                                    }
                                    %
                                  </span>

                                )}

                              </TableCell>

                              {/* RECEIVED */}

                              <TableCell className="whitespace-nowrap">

                                <span className="font-semibold text-neon-green">
                                  Rs{" "}
                                  {booking.paidAmount.toLocaleString()}
                                </span>

                                {!!booking.paymentHistory?.length && (

                                  <div className="mt-1 space-y-0.5">

                                    {booking.paymentHistory
                                      .slice(-2)
                                      .reverse()
                                      .map(
                                        (
                                          item,
                                        ) => (

                                          <p
                                            key={
                                              item._id ||
                                              item.receivedAt
                                            }
                                            className="text-[9px] text-muted-foreground"
                                          >
                                            Rs{" "}
                                            {item.amount.toLocaleString()}
                                            {" · "}
                                            {
                                              item.method
                                            }
                                          </p>

                                        ),
                                      )}

                                  </div>

                                )}

                              </TableCell>

                              {/* DUE */}

                              <TableCell className="whitespace-nowrap">

                                <span
                                  className={
                                    booking.dueAmount >
                                    0
                                      ? "font-semibold text-gold"
                                      : "font-semibold text-neon-green"
                                  }
                                >
                                  Rs{" "}
                                  {booking.dueAmount.toLocaleString()}
                                </span>

                              </TableCell>

                              {/* PAYMENT STATUS */}

                              <TableCell>

                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "whitespace-nowrap border-transparent",

                                    payTone[
                                      booking.paymentStatus
                                    ],
                                  )}
                                >
                                  {
                                    booking.paymentStatus
                                  }
                                </Badge>

                                <span className="mt-1 block whitespace-nowrap text-[9px] text-muted-foreground">
                                  Preferred:{" "}
                                  {
                                    booking.paymentMethod
                                  }
                                </span>

                              </TableCell>

                              {/* BOOKING STATUS */}

                              <TableCell>

                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "whitespace-nowrap border-transparent",

                                    bookingTone[
                                      booking.bookingStatus
                                    ] ||
                                      "",
                                  )}
                                >
                                  {
                                    booking.bookingStatus
                                  }
                                </Badge>

                              </TableCell>

                              {/* TYPE */}

                              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                {
                                  booking.bookingType
                                }
                              </TableCell>

                              {/* ACTIONS */}

                              <TableCell>

                                <div className="flex min-w-max gap-1">

                                  {/* CONFIRM */}

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Confirm booking"
                                    className="size-8"
                                    disabled={
                                      busy ||
                                      booking.bookingStatus ===
                                        "Confirmed" ||
                                      booking.bookingStatus ===
                                        "Cancelled" ||
                                      booking.bookingStatus ===
                                        "Refunded"
                                    }
                                    onClick={() =>
                                      handleConfirm(
                                        booking,
                                      )
                                    }
                                  >

                                    {busy ? (

                                      <Loader2 className="size-4 animate-spin" />

                                    ) : (

                                      <CheckCircle2 className="size-4 text-neon-green" />

                                    )}

                                  </Button>

                                  {/* RECEIVE PAYMENT */}

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Receive payment"
                                    className="size-8"
                                    disabled={
                                      busy ||
                                      booking.paymentStatus ===
                                        "Paid" ||
                                      booking.paymentStatus ===
                                        "Refunded"
                                    }
                                    onClick={() =>
                                      handleAddPayment(
                                        booking,
                                      )
                                    }
                                  >

                                    <Wallet className="size-4 text-gold" />

                                  </Button>

                                  {/* WHATSAPP */}

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Open customer WhatsApp"
                                    className="size-8"
                                    onClick={() =>
                                      openWhatsApp(
                                        booking,
                                      )
                                    }
                                  >

                                    <MessageCircle className="size-4 text-neon-green" />

                                  </Button>

                                  {/* CANCEL */}

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Cancel booking"
                                    className="size-8"
                                    disabled={
                                      busy ||
                                      booking.bookingStatus ===
                                        "Cancelled" ||
                                      booking.bookingStatus ===
                                        "Refunded"
                                    }
                                    onClick={() =>
                                      handleCancel(
                                        booking,
                                      )
                                    }
                                  >

                                    <Ban className="size-4 text-destructive" />

                                  </Button>

                                  {/* REFUND */}

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Refund payment"
                                    className="size-8"
                                    disabled={
                                      busy ||
                                      booking.paidAmount <=
                                        0 ||
                                      booking.paymentStatus ===
                                        "Refunded"
                                    }
                                    onClick={() =>
                                      handleRefund(
                                        booking,
                                      )
                                    }
                                  >

                                    <RotateCcw className="size-4" />

                                  </Button>

                                  {/* PRINT */}

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Print booking"
                                    className="size-8"
                                    onClick={() =>
                                      handlePrint(
                                        booking,
                                      )
                                    }
                                  >

                                    <Printer className="size-4" />

                                  </Button>

                                </div>

                              </TableCell>

                            </TableRow>
                          );
                        },
                      )}

                      {!bookings.length && (

                        <TableRow>

                          <TableCell
                            colSpan={
                              13
                            }
                            className="py-12 text-center text-muted-foreground"
                          >
                            No bookings found.
                          </TableCell>

                        </TableRow>

                      )}

                    </>
                  )}

                </TableBody>

              </Table>

            </div>

            {/* PAGINATION */}

            <div className="mt-4 flex items-center justify-between gap-3">

              <p className="text-xs text-muted-foreground">
                {total} bookings · page{" "}
                {page} of {pages}
              </p>

              <div className="flex gap-2">

                <Button
                  variant="glass"
                  size="sm"
                  disabled={
                    page <= 1 ||
                    loading
                  }
                  onClick={() =>
                    setPage(
                      Math.max(
                        1,
                        page - 1,
                      ),
                    )
                  }
                >
                  Previous
                </Button>

                <Button
                  variant="glass"
                  size="sm"
                  disabled={
                    page >=
                      pages ||
                    loading
                  }
                  onClick={() =>
                    setPage(
                      Math.min(
                        pages,
                        page + 1,
                      ),
                    )
                  }
                >
                  Next
                </Button>

              </div>

            </div>

          </div>

        </TabsContent>

        {/* =====================================================
            CALENDAR
        ===================================================== */}

        <TabsContent value="calendar">

          <div className="glass-static rounded-2xl p-4 sm:p-5">

            {calendarLoading ? (

              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">

                <Loader2 className="size-4 animate-spin" />

                Loading calendar...

              </div>

            ) : (

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">

                {calendar.map(
                  (
                    item,
                  ) => (

                    <div
                      key={
                        item.date
                      }
                      className="glass rounded-xl p-4"
                    >

                      <p className="font-display text-xs tracking-[0.14em] text-muted-foreground uppercase">
                        {
                          item.date
                        }
                      </p>

                      <p className="mt-2 font-display text-2xl font-black text-gradient">
                        {
                          item.count
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">
                        reservations
                      </p>

                      <p className="mt-2 text-xs text-neon-green">
                        Rs{" "}
                        {item.revenue.toLocaleString()}
                      </p>

                    </div>

                  ),
                )}

              </div>

            )}

          </div>

        </TabsContent>

      </Tabs>
    </>
  );
}