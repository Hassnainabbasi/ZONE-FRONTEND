import {
  useEffect,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  Loader2,
  Users,
} from "lucide-react";

import {
  Reveal,
  SectionHeading,
} from "./Reveal";

import {
  gameApi,
  type Game,
  type GameCategory,
} from "@/services/gameApi";

const filters: (
  | "All"
  | GameCategory
)[] = [
  "All",
  "FPS",
  "Racing",
  "Sports",
  "Fighting",
  "Action",
  "Adventure",
  "Battle Royale",
  "Strategy",
];

export function GameLibrary() {
  const [
    filter,
    setFilter,
  ] =
    useState<
      "All" | GameCategory
    >("All");

  const [
    games,
    setGames,
  ] =
    useState<Game[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =======================================================
     LOAD GAMES
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadGames() {
      try {
        setLoading(true);

        const response =
          await gameApi.publicList({
            category:
              filter,
          });

        if (
          mounted
        ) {
          setGames(
            response.data,
          );
        }
      } catch (error) {
        console.error(
          "Game library error:",
          error,
        );

        if (
          mounted
        ) {
          setGames([]);
        }
      } finally {
        if (
          mounted
        ) {
          setLoading(
            false,
          );
        }
      }
    }

    loadGames();

    return () => {
      mounted = false;
    };
  }, [filter]);

  return (
    <section
      id="games"
      className="relative scroll-mt-28 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <SectionHeading
          eyebrow="Library"
          title={
            <>
              Gaming{" "}
              <span className="text-gradient">
                Library
              </span>
            </>
          }
          subtitle="Pre-installed, patched and ready. Filter by genre and jump straight into a lobby."
        />

        {/* FILTERS */}

        <Reveal
          delay={0.1}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >

          {filters.map(
            (item) => (

              <button
                key={
                  item
                }
                type="button"
                onClick={() =>
                  setFilter(
                    item,
                  )
                }
                className={`rounded-full border px-5 py-2 font-display text-[10px] tracking-[0.22em] uppercase transition-all ${
                  filter ===
                  item
                    ? "border-primary/60 bg-primary/15 text-neon-cyan shadow-[0_0_22px_-6px_var(--neon-cyan)]"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {
                  item
                }
              </button>

            ),
          )}

        </Reveal>

        {/* LOADING */}

        {loading ? (

          <div className="flex justify-center py-20">

            <Loader2 className="size-7 animate-spin text-neon-cyan" />

          </div>

        ) : (

          <motion.div
            layout
            className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >

            <AnimatePresence mode="popLayout">

              {games.map(
                (
                  game,
                  index,
                ) => (

                  <motion.article
                    key={
                      game._id
                    }
                    layout
                    initial={{
                      opacity: 0,

                      scale:
                        0.92,
                    }}
                    animate={{
                      opacity: 1,

                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,

                      scale:
                        0.92,
                    }}
                    transition={{
                      duration:
                        0.45,

                      delay:
                        index *
                        0.04,

                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className="glass group relative overflow-hidden rounded-2xl p-0"
                  >

                    <div className="relative aspect-[3/4] overflow-hidden">

                      {game.poster ? (

                        <img
                          src={
                            game.poster
                          }
                          alt={`${game.title} key art`}
                          loading="lazy"
                          width={
                            768
                          }
                          height={
                            1024
                          }
                          className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                        />

                      ) : (

                        <div className="flex size-full items-center justify-center bg-surface-2">

                          <span className="font-display text-xs text-muted-foreground">
                            No Poster
                          </span>

                        </div>

                      )}

                      <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--background)_5%,transparent_60%)]" />

                      {/* CATEGORY */}

                      <span className="absolute top-3 left-3 rounded-full bg-background/70 px-2.5 py-1 font-display text-[9px] tracking-[0.2em] text-neon-cyan uppercase backdrop-blur">
                        {
                          game.category
                        }
                      </span>

                      {/* PLATFORM */}

                      <span className="absolute top-3 right-3 rounded-full bg-background/70 px-2.5 py-1 font-display text-[9px] tracking-[0.15em] uppercase backdrop-blur">
                        {
                          game.platform
                        }
                      </span>

                      {/* INFO */}

                      <div className="absolute inset-x-3 bottom-3">

                        <h3 className="font-display text-sm font-bold">
                          {
                            game.title
                          }
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">

                          <Users className="size-3" />

                          {
                            game.players
                          }

                        </p>

                        {game.rate >
                          0 && (

                          <p className="mt-1 text-[10px] text-neon-green">

                            Rs{" "}
                            {game.rate.toLocaleString()}
                            /hr

                          </p>

                        )}

                      </div>

                    </div>

                  </motion.article>

                ),
              )}

            </AnimatePresence>

          </motion.div>

        )}

        {!loading &&
          !games.length && (

          <div className="py-16 text-center text-sm text-muted-foreground">

            No games available in this category.

          </div>

        )}

      </div>
    </section>
  );
}