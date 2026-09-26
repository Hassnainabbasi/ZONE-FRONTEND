import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  Coffee,
  Crown,
  Gamepad2,
  Loader2,
  RefreshCcw,
  Trophy,
  Wallet,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  PageHeader,
  StatCard,
} from "@/components/admin/AdminShell";

import {
  Button,
} from "@/components/ui/button";

import {
  revenueApi,
  type RevenueAnalytics,
} from "@/services/revenueApi";

/* =========================================================
   ROUTE
========================================================= */

const title =
  "Payments & Revenue Analytics | Nexus Arena Admin";

export const Route =
  createFileRoute(
    "/admin/revenue",
  )({
    head: () => ({
      meta: [
        {
          title,
        },
      ],
    }),

    component:
      RevenuePage,
  });

/* =========================================================
   MONEY
========================================================= */

function formatMoney(
  amount:
    number,
) {
  return `Rs ${Number(
    amount || 0,
  ).toLocaleString()}`;
}

/* =========================================================
   PAGE
========================================================= */

function RevenuePage() {
  const [
    analytics,
    setAnalytics,
  ] =
    useState<
      RevenueAnalytics | null
    >(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    );

  const [
    generatedAt,
    setGeneratedAt,
  ] =
    useState("");

  /* =======================================================
     LOAD
  ======================================================= */

  async function load(
    initial =
      false,
  ) {
    try {
      if (
        initial
      ) {
        setLoading(
          true,
        );
      } else {
        setRefreshing(
          true,
        );
      }

      const response =
        await revenueApi.analytics();

      setAnalytics(
        response.data,
      );

      setGeneratedAt(
        response.generatedAt,
      );
    } catch (
      error
    ) {
      console.error(
        "Revenue:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load revenue analytics",
      );
    } finally {
      setLoading(
        false,
      );

      setRefreshing(
        false,
      );
    }
  }

  useEffect(() => {
    void load(
      true,
    );

    /*
     * Revenue automatically refresh every minute.
     */

    const timer =
      window.setInterval(
        () => {
          void load(
            false,
          );
        },

        60000,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, []);

  /* =======================================================
     CHART MAX
  ======================================================= */

  const maxDaily =
    useMemo(
      () =>
        Math.max(
          ...(
            analytics?.daily ||
            []
          ).map(
            (
              row,
            ) =>
              row.total,
          ),

          1,
        ),

      [
        analytics,
      ],
    );

  const maxMonthly =
    useMemo(
      () =>
        Math.max(
          ...(
            analytics?.monthly ||
            []
          ).map(
            (
              row,
            ) =>
              row.revenue,
          ),

          1,
        ),

      [
        analytics,
      ],
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <>
        <PageHeader
          eyebrow="Finance"
          title="Payments & Revenue Analytics"
          subtitle="Loading live financial data..."
        />

        <div className="flex justify-center py-24">

          <Loader2 className="size-7 animate-spin text-neon-cyan" />

        </div>
      </>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (
    !analytics
  ) {
    return (
      <>
        <PageHeader
          eyebrow="Finance"
          title="Payments & Revenue Analytics"
          subtitle="Track actual payments received across Nexus Arena."
        />

        <div className="glass-static rounded-2xl p-12 text-center text-sm text-muted-foreground">
          Revenue analytics could not be loaded.
        </div>
      </>
    );
  }

  const {
    kpis,
    daily,
    revenueSplit,
    monthly,
  } =
    analytics;

  return (
    <>
      {/* =================================================
          HEADER
      ================================================= */}

      <PageHeader
        eyebrow="Finance"
        title="Payments & Revenue Analytics"
        subtitle="Actual received payments across gaming, cafe, memberships and tournaments."
        action={
          <div className="flex items-center gap-3">

            {generatedAt && (

              <span className="hidden text-[10px] text-muted-foreground sm:block">

                Updated{" "}

                {new Date(
                  generatedAt,
                ).toLocaleTimeString()}

              </span>

            )}

            <Button
              variant="glass"
              disabled={
                refreshing
              }
              onClick={() =>
                void load(
                  false,
                )
              }
            >

              <RefreshCcw
                className={`mr-2 size-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </Button>

          </div>
        }
      />

      {/* =================================================
          MAIN KPI
      ================================================= */}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Today Revenue"
          value={formatMoney(
            kpis.todayRevenue,
          )}
          delta={`${Math.abs(
            kpis.todayDelta,
          ).toFixed(
            1,
          )}% vs yesterday`}
          up={
            kpis.todayDelta >=
            0
          }
        />

        <StatCard
          label="This Month"
          value={formatMoney(
            kpis.monthRevenue,
          )}
        />

        <StatCard
          label="All Time Revenue"
          value={formatMoney(
            kpis.allTimeRevenue,
          )}
        />

        <StatCard
          label="Transactions"
          value={String(
            analytics.transactionCount,
          )}
        />

      </div>

      {/* =================================================
          SOURCE TOTALS
      ================================================= */}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <section className="glass-static rounded-2xl p-4">

          <div className="flex items-center gap-3">

            <span className="grid size-10 place-items-center rounded-xl bg-primary/10">

              <Gamepad2 className="size-5 text-neon-cyan" />

            </span>

            <div>

              <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                Gaming
              </p>

              <p className="mt-1 font-display text-lg font-black">

                {formatMoney(
                  kpis.gamingRevenue,
                )}

              </p>

            </div>

          </div>

        </section>

        <section className="glass-static rounded-2xl p-4">

          <div className="flex items-center gap-3">

            <span className="grid size-10 place-items-center rounded-xl bg-primary/10">

              <Coffee className="size-5 text-gold" />

            </span>

            <div>

              <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                Cafe
              </p>

              <p className="mt-1 font-display text-lg font-black">

                {formatMoney(
                  kpis.cafeRevenue,
                )}

              </p>

            </div>

          </div>

        </section>

        <section className="glass-static rounded-2xl p-4">

          <div className="flex items-center gap-3">

            <span className="grid size-10 place-items-center rounded-xl bg-primary/10">

              <Crown className="size-5 text-secondary" />

            </span>

            <div>

              <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                Membership
              </p>

              <p className="mt-1 font-display text-lg font-black">

                {formatMoney(
                  kpis.membershipRevenue,
                )}

              </p>

            </div>

          </div>

        </section>

        <section className="glass-static rounded-2xl p-4">

          <div className="flex items-center gap-3">

            <span className="grid size-10 place-items-center rounded-xl bg-primary/10">

              <Trophy className="size-5 text-neon-green" />

            </span>

            <div>

              <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                Tournament
              </p>

              <p className="mt-1 font-display text-lg font-black">

                {formatMoney(
                  kpis.tournamentRevenue,
                )}

              </p>

            </div>

          </div>

        </section>

      </div>

      <div className="grid gap-5 xl:grid-cols-2">

        {/* =================================================
            DAILY
        ================================================= */}

        <section className="glass-static rounded-2xl p-5">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <p className="font-display text-[9px] tracking-[0.18em] text-primary uppercase">
                Last 7 Days
              </p>

              <h2 className="mt-1 font-display text-sm font-bold tracking-[0.14em] uppercase">
                Daily Earnings
              </h2>

            </div>

            <Wallet className="size-5 text-muted-foreground" />

          </div>

          <div className="grid gap-4">

            {daily.map(
              (
                day,
              ) => {

                const width =
                  Math.max(
                    (
                      day.total /
                      maxDaily
                    ) *
                      100,

                    day.total >
                    0
                      ? 2
                      : 0,
                  );

                return (

                  <div
                    key={
                      day.date
                    }
                  >

                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">

                      <div>

                        <span className="font-display text-xs font-bold">

                          {
                            day.day
                          }

                        </span>

                        <span className="ml-2 text-[9px] text-muted-foreground">

                          {
                            day.date
                          }

                        </span>

                      </div>

                      <span className="font-medium">

                        {formatMoney(
                          day.total,
                        )}

                      </span>

                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">

                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width:
                            `${width}%`,
                        }}
                      />

                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-muted-foreground">

                      <span>

                        Gaming:{" "}

                        {formatMoney(
                          day.gaming,
                        )}

                      </span>

                      <span>

                        Cafe:{" "}

                        {formatMoney(
                          day.cafe,
                        )}

                      </span>

                      <span>

                        Other:{" "}

                        {formatMoney(
                          day.other,
                        )}

                      </span>

                    </div>

                  </div>

                );
              },
            )}

          </div>

        </section>

        {/* =================================================
            SPLIT
        ================================================= */}

        <section className="glass-static rounded-2xl p-5">

          <p className="font-display text-[9px] tracking-[0.18em] text-primary uppercase">
            Sources
          </p>

          <h2 className="mt-1 mb-5 font-display text-sm font-bold tracking-[0.14em] uppercase">
            Revenue Split
          </h2>

          <div className="grid gap-3">

            {revenueSplit.length ? (

              revenueSplit.map(
                (
                  item,
                ) => (

                  <div
                    key={
                      item.name
                    }
                    className="border-b border-border pb-3"
                  >

                    <div className="flex items-center justify-between gap-3 text-sm">

                      <span>

                        {
                          item.name
                        }

                      </span>

                      <div className="text-right">

                        <span className="block font-display font-bold text-primary">

                          {
                            item.value
                          }
                          %

                        </span>

                        <span className="block text-[9px] text-muted-foreground">

                          {formatMoney(
                            item.amount,
                          )}

                        </span>

                      </div>

                    </div>

                  </div>

                ),
              )

            ) : (

              <p className="py-6 text-center text-xs text-muted-foreground">
                No paid transactions yet.
              </p>

            )}

          </div>

        </section>

      </div>

      {/* =================================================
          MONTHLY
      ================================================= */}

      <section className="glass-static mt-5 rounded-2xl p-5">

        <div className="mb-6">

          <p className="font-display text-[9px] tracking-[0.18em] text-primary uppercase">
            Performance
          </p>

          <h2 className="mt-1 font-display text-sm font-bold tracking-[0.14em] uppercase">
            Monthly Revenue Trend
          </h2>

        </div>

        <div className="flex h-64 items-end gap-2">

          {monthly.map(
            (
              month,
            ) => {

              const percentage =
                month.revenue >
                0
                  ? Math.max(
                      (
                        month.revenue /
                        maxMonthly
                      ) *
                        100,

                      5,
                    )
                  : 2;

              return (

                <div
                  key={
                    month.key
                  }
                  className="group flex h-full flex-1 flex-col justify-end"
                >

                  <div className="mb-2 hidden text-center text-[9px] font-medium group-hover:block">

                    {formatMoney(
                      month.revenue,
                    )}

                  </div>

                  <div
                    className="w-full rounded-t-md bg-neon-cyan/70 transition-all hover:bg-neon-cyan"
                    style={{
                      height:
                        `${percentage}%`,
                    }}
                    title={`${month.month}: ${formatMoney(
                      month.revenue,
                    )}`}
                  />

                  <span className="mt-2 text-center text-[9px] text-muted-foreground">

                    {
                      month.month
                    }

                  </span>

                </div>

              );
            },
          )}

        </div>

      </section>
    </>
  );
}