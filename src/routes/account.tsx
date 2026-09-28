import {
  useEffect,
  useState,
} from "react";

import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  CalendarDays,
  Clock3,
  Crown,
  Gamepad2,
  Gift,
  Loader2,
  LogOut,
  Star,
  User,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Progress,
} from "@/components/ui/progress";

import {
  useAuth,
} from "@/context/auth-context";

import {
  membershipApi,
  type MemberDetails,
} from "@/services/membershipApi";

const title =
  "My Account | Battle Hub";

const description =
  "View your Battle Hub membership, loyalty points, gaming hours and booking history.";

export const Route =
  createFileRoute(
    "/account",
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
      AccountPage,
  });

function AccountPage() {
  const navigate =
    useNavigate();

  const {
    user,
    loading:
      authLoading,
    logout,
  } = useAuth();

  const [
    member,
    setMember,
  ] =
    useState<
      MemberDetails | null
    >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  useEffect(() => {
    if (
      !authLoading &&
      !user
    ) {
      void navigate({
        to: "/login",
      });
    }
  }, [
    authLoading,
    user,
    navigate,
  ]);

  useEffect(() => {
    let mounted = true;

    async function loadMember() {
      if (
        !user?.member?._id
      ) {
        if (mounted) {
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);

        const response =
          await membershipApi.getMember(
            user.member._id,
          );

        if (mounted) {
          setMember(
            response.data,
          );
        }
      } catch (error) {
        console.error(
          "Account load error:",
          error,
        );

        if (mounted) {
          setMember(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      void loadMember();
    }

    return () => {
      mounted = false;
    };
  }, [
    authLoading,
    user,
  ]);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await logout();

      await navigate({
        to: "/",
      });
    } finally {
      setLoggingOut(false);
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-7 animate-spin text-neon-cyan" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const membershipName =
    member
      ?.membershipTierName ||
    user.member
      ?.membershipTierName ||
    "No Membership";

  const membershipStatus =
    member
      ?.membershipStatus ||
    user.member
      ?.membershipStatus ||
    "Inactive";

  const points =
    member?.points ??
    user.member?.points ??
    0;

  const hours =
    member?.hoursPlayed ??
    user.member
      ?.hoursPlayed ??
    0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-5 sm:px-6 sm:py-8">

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[8%] size-[450px] rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute bottom-[8%] right-[8%] size-[420px] rounded-full bg-secondary/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">

        <div className="glass-static flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-6">

          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-neon-cyan">
              <Gamepad2 className="size-5" />
            </span>

            <span className="font-display text-sm font-bold tracking-[0.2em] uppercase">
              Cyber
              <span className="text-neon-cyan">
               Xtream
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">

            <Link to="/">
              <Button
                variant="glass"
                size="sm"
              >
                Back Home
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              disabled={
                loggingOut
              }
              onClick={() =>
                void handleLogout()
              }
            >
              {loggingOut ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 size-4" />
              )}

              Logout
            </Button>

          </div>

        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">

          <div className="space-y-5">

            <div className="glass-static rounded-2xl p-6">

              <div className="flex flex-wrap items-start justify-between gap-5">

                <div className="flex items-center gap-4">

                  <div className="grid size-16 place-items-center rounded-2xl border border-primary/30 bg-primary/10">
                    <User className="size-7 text-neon-cyan" />
                  </div>

                  <div>

                    <p className="font-display text-[10px] tracking-[0.2em] text-primary uppercase">
                      My Account
                    </p>

                    <h1 className="mt-1 font-display text-2xl font-black">
                      {user.name}
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {user.email}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {user.phone}
                    </p>

                    {member?.memberId && (
                      <p className="mt-2 font-display text-[10px] tracking-[0.14em] text-neon-cyan uppercase">
                        Member ID · {member.memberId}
                      </p>
                    )}

                  </div>

                </div>

                <Badge
                  variant="outline"
                  className={
                    membershipStatus ===
                    "Active"
                      ? "border-neon-green/30 bg-neon-green/10 text-neon-green"
                      : "border-border text-muted-foreground"
                  }
                >
                  {membershipStatus}
                </Badge>

              </div>

            </div>

            <div className="grid gap-3 sm:grid-cols-3">

              <div className="glass-static rounded-2xl p-5">
                <Clock3 className="size-5 text-neon-cyan" />

                <p className="mt-3 text-xs text-muted-foreground">
                  Gaming Hours
                </p>

                <p className="mt-1 font-display text-2xl font-black">
                  {hours}
                </p>
              </div>

              <div className="glass-static rounded-2xl p-5">
                <Star className="size-5 text-gold" />

                <p className="mt-3 text-xs text-muted-foreground">
                  Loyalty Points
                </p>

                <p className="mt-1 font-display text-2xl font-black text-gradient">
                  {points.toLocaleString()}
                </p>
              </div>

              <div className="glass-static rounded-2xl p-5">
                <Crown className="size-5 text-neon-purple" />

                <p className="mt-3 text-xs text-muted-foreground">
                  Membership
                </p>

                <p className="mt-1 font-display text-lg font-black">
                  {membershipName}
                </p>
              </div>

            </div>

            <div className="glass-static rounded-2xl p-5">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="font-display text-[10px] tracking-[0.18em] text-primary uppercase">
                    Activity
                  </p>

                  <h2 className="mt-1 font-display text-lg font-black">
                    Booking History
                  </h2>
                </div>

                <CalendarDays className="size-5 text-neon-cyan" />

              </div>

              <div className="mt-5 grid gap-3">

                {member?.bookings
                  ?.length ? (

                  member.bookings
                    .slice(
                      0,
                      10,
                    )
                    .map(
                      (
                        booking,
                      ) => (

                        <div
                          key={
                            booking._id
                          }
                          className="rounded-xl border border-border bg-surface-2/30 p-4"
                        >

                          <div className="flex flex-wrap items-start justify-between gap-3">

                            <div>

                              <p className="font-display text-sm font-bold">
                                {booking.game}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {booking.systemType}
                                {" · "}
                                {booking.bookingDate}
                                {" · "}
                                {booking.startTime}
                              </p>

                              <p className="mt-1 text-[10px] text-muted-foreground">
                                {booking.duration} hour
                                {booking.duration > 1
                                  ? "s"
                                  : ""}
                              </p>

                            </div>

                            <div className="text-right">

                              <p className="text-sm font-medium">
                                Rs{" "}
                                {booking.totalAmount.toLocaleString()}
                              </p>

                              <Badge
                                variant="outline"
                                className="mt-2"
                              >
                                {booking.bookingStatus}
                              </Badge>

                            </div>

                          </div>

                        </div>

                      ),
                    )

                ) : (

                  <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <Gamepad2 className="mx-auto size-6 text-muted-foreground" />

                    <p className="mt-3 text-sm text-muted-foreground">
                      No bookings yet.
                    </p>

                    <Link
                      to="/"
                      className="mt-3 inline-block text-xs text-neon-cyan"
                    >
                      Book your first gaming session
                    </Link>
                  </div>

                )}

              </div>

            </div>

          </div>

          <aside className="glass-static h-fit rounded-2xl p-5">

            <Gift className="size-6 text-neon-green" />

            <p className="mt-4 font-display text-[10px] tracking-[0.18em] text-primary uppercase">
              Loyalty Profile
            </p>

            <h2 className="mt-1 font-display text-xl font-black">
              {membershipName}
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {membershipStatus ===
              "Active"
                ? "Your Battle Hub membership is active."
                : "Choose a membership plan to unlock rewards and benefits."}
            </p>

            {member && (
              <div className="mt-5">

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Tier Progress
                  </span>

                  <span>
                    {member.tierProgress ?? 0}%
                  </span>
                </div>

                <Progress
                  value={
                    member.tierProgress ??
                    0
                  }
                  className="mt-2"
                />

                {member.nextTier && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {
                      member.nextTier
                        .hoursRemaining
                    }{" "}
                    hours remaining to{" "}
                    {
                      member.nextTier
                        .name
                    }
                  </p>
                )}

              </div>
            )}

            <Link to="/">
              <Button
                variant="hero"
                className="mt-6 w-full"
              >
                {membershipStatus ===
                "Active"
                  ? "Membership Benefits"
                  : "Choose Membership"}
              </Button>
            </Link>

          </aside>

        </section>

      </div>

    </main>
  );
}
