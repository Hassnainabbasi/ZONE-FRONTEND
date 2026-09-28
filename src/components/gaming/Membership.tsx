import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "@tanstack/react-router";

import {
  Check,
  Clock3,
  Crown,
  Gamepad2,
  Loader2,
  LockKeyhole,
  Sparkles,
  Star,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";

import {
  toast,
} from "sonner";

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
  Reveal,
  SectionHeading,
} from "./Reveal";

import {
  useAuth,
} from "@/context/auth-context";

import {
  membershipApi,
  type MembershipRequest,
  type MembershipTier,
} from "@/services/membershipApi";

/* =========================================================
   STYLES
========================================================= */

function getTierIcon(
  accent:
    MembershipTier["accent"],
) {
  if (
    accent ===
    "vip"
  ) {
    return Crown;
  }

  if (
    accent ===
    "gold"
  ) {
    return Trophy;
  }

  return Star;
}

function getTierClasses(
  accent:
    MembershipTier["accent"],
) {
  if (
    accent ===
    "vip"
  ) {
    return {
      card:
        "border-secondary/40 bg-secondary/5",

      icon:
        "bg-secondary/15 text-secondary",

      title:
        "text-secondary",

      glow:
        "shadow-[0_0_45px_-20px_var(--neon-purple)]",
    };
  }

  if (
    accent ===
    "gold"
  ) {
    return {
      card:
        "border-yellow-400/30 bg-yellow-400/5",

      icon:
        "bg-yellow-400/10 text-yellow-300",

      title:
        "text-yellow-300",

      glow:
        "shadow-[0_0_45px_-20px_rgba(250,204,21,0.45)]",
    };
  }

  return {
    card:
      "border-primary/30 bg-primary/5",

    icon:
      "bg-primary/10 text-neon-cyan",

    title:
      "text-neon-cyan",

    glow:
      "shadow-[0_0_45px_-20px_var(--neon-cyan)]",
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export function Membership() {
  const navigate =
    useNavigate();

  const {
    user,
    refresh,
  } =
    useAuth();

  const [
    tiers,
    setTiers,
  ] =
    useState<
      MembershipTier[]
    >([]);

  const [
    request,
    setRequest,
  ] =
    useState<
      MembershipRequest | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    requestingTierId,
    setRequestingTierId,
  ] =
    useState<
      string | null
    >(null);

  async function loadData() {
    try {
      setLoading(
        true,
      );

      const tierResponse =
        await membershipApi.publicTiers();

      setTiers(
        Array.isArray(
          tierResponse.data,
        )
          ? tierResponse.data
          : [],
      );

      if (user) {
        const requestResponse =
          await membershipApi.myRequest();

        setRequest(
          requestResponse.data ||
          null,
        );
      } else {
        setRequest(
          null,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load memberships",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(() => {
    void loadData();
  }, [
    user?._id,
  ]);

  async function handleRequest(
    tier:
      MembershipTier,
  ) {
    if (!user) {
      sessionStorage.setItem(
        "selectedMembershipTier",

        tier._id,
      );

      await navigate({
        to:
          "/signup",
      });

      return;
    }

    try {
      setRequestingTierId(
        tier._id,
      );

      const response =
        await membershipApi.requestMembership(
          tier._id,
        );

      toast.success(
        response.message,
      );

      setRequest(
        response.data,
      );

      await refresh();

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit request",
      );
    } finally {
      setRequestingTierId(
        null,
      );
    }
  }

  const currentTierName =
    user?.member
      ?.membershipStatus ===
      "Active"
      ? user.member
          .membershipTierName
      : "";

  function requestForTier(
    tier:
      MembershipTier,
  ) {
    if (!request) {
      return false;
    }

    const requestTierId =
      typeof request.tierId ===
      "string"
        ? request.tierId
        : request.tierId._id;

    return (
      requestTierId ===
      tier._id
    );
  }

  if (loading) {
    return (
      <section
        id="membership"
        className="py-24"
      >
        <div className="flex justify-center">
          <Loader2 className="size-7 animate-spin text-neon-cyan" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="membership"
      className="relative scroll-mt-28 overflow-hidden py-20 lg:py-28"
    >

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[10%] top-[20%] size-[400px] rounded-full bg-primary/5 blur-[140px]" />

        <div className="absolute bottom-[10%] right-[10%] size-[400px] rounded-full bg-secondary/5 blur-[140px]" />

      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">

        <SectionHeading
          eyebrow="CX Rewards"
          title={
            <>
              Choose Your{" "}

              <span className="text-gradient">
                Membership
              </span>
            </>
          }
          subtitle="Submit a membership request. Battle Hub will confirm payment and activate your selected plan."
        />

        {/* STATUS */}

        {user ? (

          <Reveal className="mx-auto mt-8 max-w-3xl">

            <div className="glass-static flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-5">

              <div className="flex items-center gap-3">

                <div className="grid size-11 place-items-center rounded-xl bg-primary/10">

                  <Users className="size-5 text-neon-cyan" />

                </div>

                <div>

                  <p className="font-display text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                    Signed In
                  </p>

                  <p className="mt-1 font-medium">
                    {user.name}
                  </p>

                </div>

              </div>

              {currentTierName ? (

                <Badge className="bg-neon-green/15 text-neon-green">

                  <Check className="mr-1 size-3" />

                  {currentTierName} Active

                </Badge>

              ) : request?.status ===
                "Pending" ? (

                <Badge className="bg-gold/15 text-gold">

                  <Clock3 className="mr-1 size-3" />

                  Pending Approval

                </Badge>

              ) : request?.status ===
                "Denied" ? (

                <Badge className="bg-neon-red/15 text-neon-red">

                  <XCircle className="mr-1 size-3" />

                  Request Denied

                </Badge>

              ) : (

                <Badge variant="outline">
                  No Active Membership
                </Badge>

              )}

            </div>

          </Reveal>

        ) : (

          <Reveal className="mx-auto mt-8 max-w-3xl">

            <div className="glass-static flex items-center gap-4 rounded-2xl p-5">

              <LockKeyhole className="size-5 text-neon-cyan" />

              <p className="text-sm text-muted-foreground">
                Login or create an account to request membership.
              </p>

            </div>

          </Reveal>

        )}

        {/* TIERS */}

        <div className="mt-10 grid gap-5 lg:grid-cols-3">

          {tiers.map(
            (
              tier,
              index,
            ) => {

              const Icon =
                getTierIcon(
                  tier.accent,
                );

              const styles =
                getTierClasses(
                  tier.accent,
                );

              const active =
                currentTierName
                  ?.toLowerCase() ===
                tier.name.toLowerCase();

              const sameRequest =
                requestForTier(
                  tier,
                );

              const pending =
                sameRequest &&
                request?.status ===
                  "Pending";

              const denied =
                sameRequest &&
                request?.status ===
                  "Denied";

              const requesting =
                requestingTierId ===
                tier._id;

              return (

                <Reveal
                  key={
                    tier._id
                  }
                  delay={
                    index *
                    0.08
                  }
                >

                  <article
                    className={`glass-static relative h-full rounded-3xl border p-6 ${styles.card} ${styles.glow}`}
                  >

                    <div
                      className={`grid size-12 place-items-center rounded-2xl ${styles.icon}`}
                    >

                      <Icon className="size-6" />

                    </div>

                    <h3
                      className={`mt-5 font-display text-2xl font-black ${styles.title}`}
                    >
                      {tier.name}
                    </h3>

                    <p className="mt-3 font-display text-3xl font-black">

                      {Number(
                        tier.price,
                      ) ===
                      0
                        ? "FREE"
                        : `Rs ${Number(
                            tier.price,
                          ).toLocaleString()}`}

                    </p>

                    {/* BENEFITS */}

                    <div className="mt-6 grid grid-cols-2 gap-3">

                      <div className="rounded-xl border border-border p-3">

                        <Gamepad2 className="size-4 text-neon-cyan" />

                        <p className="mt-2 font-display text-lg font-bold">

                          {
                            tier.gamingDiscountPercent
                          }
                          %

                        </p>

                        <p className="text-[10px] text-muted-foreground">
                          Gaming Discount
                        </p>

                      </div>

                      <div className="rounded-xl border border-border p-3">

                        <Sparkles className="size-4 text-neon-green" />

                        <p className="mt-2 font-display text-lg font-bold">
                          {
                            tier.pointsPerHour
                          }
                        </p>

                        <p className="text-[10px] text-muted-foreground">
                          Points / Hour
                        </p>

                      </div>

                    </div>

                    <div className="mt-3 rounded-xl border border-border p-3">

                      <p className="text-[10px] text-muted-foreground">
                        Required Gaming Hours
                      </p>

                      <p className="mt-1 font-display text-lg font-bold">
                        {
                          tier.minHours
                        }
                      </p>

                    </div>

                    {/* PERKS */}

                    <div className="mt-5 space-y-3">

                      {(
                        tier.perks ||
                        []
                      ).map(
                        (
                          perk,
                          perkIndex,
                        ) => (

                          <div
                            key={`${tier._id}-${perkIndex}`}
                            className="flex gap-2"
                          >

                            <Check className="mt-0.5 size-3.5 shrink-0 text-neon-green" />

                            <span className="text-xs text-muted-foreground">
                              {perk}
                            </span>

                          </div>

                        ),
                      )}

                    </div>

                    {/* REQUEST STATUS */}

                    {pending && (

                      <div className="mt-5 rounded-xl border border-gold/30 bg-gold/10 p-3">

                        <p className="font-display text-xs font-bold text-gold">
                          Pending Approval
                        </p>

                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Admin will contact you for payment.
                        </p>

                        {request?.paymentStatus ===
                          "Paid" && (

                          <Badge className="mt-2 bg-neon-green/15 text-neon-green">
                            Payment Confirmed
                          </Badge>

                        )}

                      </div>

                    )}

                    {denied && (

                      <div className="mt-5 rounded-xl border border-neon-red/30 bg-neon-red/10 p-3">

                        <p className="font-display text-xs font-bold text-neon-red">
                          Request Denied
                        </p>

                        {request?.adminNote && (

                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {
                              request.adminNote
                            }
                          </p>

                        )}

                      </div>

                    )}

                    {/* BUTTON */}

                    <Button
                      variant={
                        active ||
                        pending
                          ? "glass"
                          : "hero"
                      }
                      className="mt-7 w-full"
                      disabled={
                        active ||
                        pending ||
                        requesting ||
                        Boolean(
                          request &&
                            request.status ===
                              "Pending" &&
                            !sameRequest,
                        )
                      }
                      onClick={() =>
                        void handleRequest(
                          tier,
                        )
                      }
                    >

                      {requesting ? (

                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Sending...
                        </>

                      ) : active ? (

                        <>
                          <Check className="mr-2 size-4" />
                          Active Membership
                        </>

                      ) : pending ? (

                        <>
                          <Clock3 className="mr-2 size-4" />
                          Pending Approval
                        </>

                      ) : denied ? (

                        "Request Again"

                      ) : user ? (

                        `Request ${tier.name}`

                      ) : (

                        `Sign Up for ${tier.name}`

                      )}

                    </Button>

                  </article>

                </Reveal>

              );
            },
          )}

        </div>

      </div>

    </section>
  );
}