import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  Check,
  Cpu,
  Loader2,
} from "lucide-react";

import {
  Reveal,
  SectionHeading,
} from "./Reveal";

import {
  systemApi,
  type GamingSystem,
} from "@/services/systemApi";

export function Systems() {
  const [
    systems,
    setSystems,
  ] =
    useState<
      GamingSystem[]
    >([]);

  const [
    activeId,
    setActiveId,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  async function load() {
    try {
      const response =
        await systemApi.publicList();

      const list =
        response.data ||
        [];

      setSystems(
        list,
      );

      setActiveId(
        (current) =>
          list.some(
            (system) =>
              system._id ===
              current,
          )
            ? current
            : list[0]?._id ||
              "",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(() => {
    void load();

    const interval =
      window.setInterval(
        () => {
          void load();
        },
        30000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, []);

  const current =
    useMemo(
      () =>
        systems.find(
          (system) =>
            system._id ===
            activeId,
        ) ||
        null,

      [
        systems,
        activeId,
      ],
    );

  return (
    <section
      id="systems"
      className="relative scroll-mt-28 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <SectionHeading
          eyebrow="Hardware"
          title={
            <>
              Gaming Systems &amp;{" "}

              <span className="text-gradient">
                Specs
              </span>
            </>
          }
          subtitle="Systems and live availability managed directly from the Arcadium admin panel."
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-7 animate-spin text-neon-cyan" />
          </div>
        ) : (
          <>
            <Reveal className="mt-10 flex justify-center">

              <div className="glass-static inline-flex flex-wrap gap-1 rounded-2xl p-1.5">

                {systems.map(
                  (system) => {
                    const selected =
                      activeId ===
                      system._id;

                    return (
                      <button
                        type="button"
                        key={
                          system._id
                        }
                        onClick={() =>
                          setActiveId(
                            system._id,
                          )
                        }
                        className="relative rounded-xl px-5 py-2.5 font-display text-[11px] tracking-[0.18em] uppercase"
                      >
                        {selected && (
                          <motion.span
                            layoutId="system-pill"
                            className="absolute inset-0 rounded-xl bg-[image:var(--gradient-cyber)]"
                          />
                        )}

                        <span
                          className={`relative ${
                            selected
                              ? "text-primary-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {
                            system.label
                          }
                        </span>
                      </button>
                    );
                  },
                )}

              </div>

            </Reveal>

            {current && (
              <>
                <div className="mt-8 grid gap-3 sm:grid-cols-4">

                  <div className="glass-static rounded-xl p-4">

                    <p className="text-[10px] text-muted-foreground uppercase">
                      Stations
                    </p>

                    <p className="mt-1 font-display text-xl font-black">
                      {
                        current.totalStations
                      }
                    </p>

                  </div>

                  <div className="glass-static rounded-xl p-4">

                    <p className="text-[10px] text-muted-foreground uppercase">
                      Available
                    </p>

                    <p className="mt-1 font-display text-xl font-black text-neon-green">
                      {
                        current.stats?.available ||
                        0
                      }
                    </p>

                  </div>

                  <div className="glass-static rounded-xl p-4">

                    <p className="text-[10px] text-muted-foreground uppercase">
                      In Use
                    </p>

                    <p className="mt-1 font-display text-xl font-black text-destructive">
                      {
                        current.stats?.occupied ||
                        0
                      }
                    </p>

                  </div>

                  <div className="glass-static rounded-xl p-4">

                    <p className="text-[10px] text-muted-foreground uppercase">
                      Rate
                    </p>

                    <p className="mt-1 font-display text-xl font-black text-neon-cyan">
                      Rs{" "}
                      {Number(
                        current.pricePerHour,
                      ).toLocaleString()}
                      /hr
                    </p>

                  </div>

                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                  <AnimatePresence mode="popLayout">

                    {(current.stations ||
                      []).map(
                      (
                        station,
                        index,
                      ) => (
                        <motion.article
                          key={
                            station.stationId
                          }
                          initial={{
                            opacity:
                              0,

                            x:
                              30,
                          }}
                          animate={{
                            opacity:
                              1,

                            x:
                              0,
                          }}
                          exit={{
                            opacity:
                              0,
                          }}
                          transition={{
                            delay:
                              index *
                              0.03,
                          }}
                          className="glass rounded-2xl p-5"
                        >

                          <div className="flex justify-between">

                            <Cpu className="size-5 text-neon-cyan" />

                            <span
                              className={
                                station.status ===
                                "available"
                                  ? "text-xs text-neon-green"
                                  : station.status ===
                                      "occupied"
                                    ? "text-xs text-destructive"
                                    : station.status ===
                                        "maintenance"
                                      ? "text-xs text-muted-foreground"
                                      : "text-xs text-gold"
                              }
                            >

                              {station.status ===
                              "available"
                                ? "Available"
                                : station.status ===
                                    "occupied"
                                  ? "In Use"
                                  : station.status ===
                                      "maintenance"
                                    ? "Maintenance"
                                    : "Reserved"}

                            </span>

                          </div>

                          <h3 className="mt-5 font-display text-lg font-black">

                            {
                              station.stationId
                            }

                          </h3>

                          <p className="mt-1 text-[10px] text-muted-foreground uppercase">

                            {
                              current.tag
                            }

                          </p>

                          {station.minutesLeft !==
                            null && (

                            <p className="mt-3 text-xs text-destructive">
                              {
                                station.minutesLeft
                              }{" "}
                              minutes left
                            </p>

                          )}

                          <ul className="mt-5 space-y-2">

                            {current.specs.map(
                              (
                                spec,
                              ) => (

                                <li
                                  key={
                                    spec
                                  }
                                  className="flex gap-2 text-xs text-muted-foreground"
                                >

                                  <Check className="size-3.5 shrink-0 text-neon-cyan" />

                                  {
                                    spec
                                  }

                                </li>

                              ),
                            )}

                          </ul>

                        </motion.article>
                      ),
                    )}

                  </AnimatePresence>

                </div>
              </>
            )}
          </>
        )}

      </div>
    </section>
  );
}