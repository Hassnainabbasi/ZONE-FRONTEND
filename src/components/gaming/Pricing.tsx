import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "motion/react";

import {
  Check,
  Clock3,
  Loader2,
  Moon,
  Sparkles,
  Sun,
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
  Reveal,
  SectionHeading,
} from "./Reveal";

import {
  pricingApi,
  type PricingPlan,
} from "@/services/pricingApi";

import {
  useBooking,
} from "../../context/booking-context";

/* =========================================================
   ICON
========================================================= */

function PackageIcon({
  type,
}: {
  type:
    PricingPlan["packageType"];
}) {
  if (
    type ===
    "Night"
  ) {
    return (
      <Moon className="size-4 text-secondary" />
    );
  }

  if (
    type ===
    "Day"
  ) {
    return (
      <Sun className="size-4 text-gold" />
    );
  }

  return (
    <Clock3 className="size-4 text-neon-cyan" />
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export function Pricing() {
  const {
    selectPricingPlan,
  } =
    useBooking();

  const [
    plans,
    setPlans,
  ] =
    useState<
      PricingPlan[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  useEffect(() => {
    async function load() {
      try {
        const response =
          await pricingApi.publicList();

        setPlans(
          Array.isArray(
            response.data,
          )
            ? response.data
            : [],
        );
      } catch (
        error
      ) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load packages",
        );
      } finally {
        setLoading(
          false,
        );
      }
    }

    void load();
  }, []);

  function choosePlan(
    plan:
      PricingPlan,
  ) {
    selectPricingPlan(
      plan,
    );

    toast.success(
      `${plan.name} selected`,
    );

    window.setTimeout(
      () => {
        document
          .getElementById(
            "booking",
          )
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start",
          });
      },

      50,
    );
  }

  return (
    <section
      id="rates"
      className="relative scroll-mt-28 py-20 lg:py-28"
    >

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <SectionHeading
          eyebrow="Rates"
          title={
            <>
              Pricing{" "}

              <span className="text-gradient">
                Packages
              </span>
            </>
          }
          subtitle="Choose hourly gaming, day packages and night packages."
        />

        {loading ? (

          <div className="flex justify-center py-16">

            <Loader2 className="size-7 animate-spin text-neon-cyan" />

          </div>

        ) : plans.length ? (

          <div className="mt-12 grid gap-5 lg:grid-cols-3">

            {plans.map(
              (
                plan,
                index,
              ) => (

                <Reveal
                  key={
                    plan._id
                  }
                  delay={
                    index *
                    0.08
                  }
                >

                  <motion.div
                    whileHover={{
                      y:
                        -10,
                    }}
                    transition={{
                      type:
                        "spring",

                      stiffness:
                        260,

                      damping:
                        22,
                    }}
                    className={`glass relative h-full overflow-hidden rounded-2xl p-7 ${
                      plan.highlight
                        ? "glow-purple"
                        : ""
                    }`}
                  >

                    <div className="flex flex-wrap gap-2">

                      <Badge variant="outline">
                        {
                          plan.systemType
                        }
                      </Badge>

                      <Badge
                        variant="outline"
                        className="gap-1.5"
                      >

                        <PackageIcon
                          type={
                            plan.packageType
                          }
                        />

                        {
                          plan.packageType
                        }

                      </Badge>

                    </div>

                    {plan.highlight && (

                      <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-2.5 py-1 font-display text-[9px] tracking-[0.2em] uppercase">

                        <Sparkles className="size-3 text-neon-cyan" />

                        Popular

                      </span>

                    )}

                    <h3 className="mt-5 font-display text-lg font-black">

                      {
                        plan.name
                      }

                    </h3>

                    {plan.description && (

                      <p className="mt-2 text-xs leading-5 text-muted-foreground">

                        {
                          plan.description
                        }

                      </p>

                    )}

                    <p className="mt-6">

                      <span className="font-display text-4xl font-black text-gradient">

                        Rs{" "}

                        {Number(
                          plan.price,
                        ).toLocaleString()}

                      </span>

                      {plan.unit && (

                        <span className="ml-2 text-xs text-muted-foreground">

                          {
                            plan.unit
                          }

                        </span>

                      )}

                    </p>

                    <div className="mt-5 space-y-2 text-xs text-muted-foreground">

                      <div className="flex items-center gap-2">

                        <Clock3 className="size-4 text-neon-cyan" />

                        {
                          plan.durationHours
                        }{" "}

                        Hours

                      </div>

                      {(plan.startTime ||
                        plan.endTime) && (

                        <div className="flex items-center gap-2">

                          <PackageIcon
                            type={
                              plan.packageType
                            }
                          />

                          {
                            plan.startTime ||
                            "--"
                          }

                          {" – "}

                          {
                            plan.endTime ||
                            "--"
                          }

                        </div>

                      )}

                      {plan.discountPercent >
                        0 && (

                        <p className="font-medium text-neon-green">

                          {
                            plan.discountPercent
                          }
                          % Package Discount

                        </p>

                      )}

                    </div>

                    <div className="neon-divider my-6" />

                    <ul className="space-y-3">

                      {(plan.perks ||
                        []).map(
                        (
                          perk,
                          index,
                        ) => (

                          <li
                            key={`${plan._id}-${index}`}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >

                            <Check className="mt-0.5 size-4 shrink-0 text-neon-green" />

                            {
                              perk
                            }

                          </li>

                        ),
                      )}

                    </ul>

                    <Button
                      variant={
                        plan.highlight
                          ? "hero"
                          : "neon"
                      }
                      size="xl"
                      className="mt-8 w-full"
                      onClick={() =>
                        choosePlan(
                          plan,
                        )
                      }
                    >

                      Book{" "}

                      {
                        plan.name
                      }

                    </Button>

                  </motion.div>

                </Reveal>

              ),
            )}

          </div>

        ) : (

          <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No packages currently available.
          </div>

        )}

      </div>

    </section>
  );
}