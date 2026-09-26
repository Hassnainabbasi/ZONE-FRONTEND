import {
  useEffect,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "motion/react";

import {
  Gamepad2,
  LogIn,
  LogOut,
  Menu,
  User,
  UserPlus,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  Button,
} from "@/components/ui/button";

import {
  useAuth,
} from "@/context/auth-context";

const links = [
  {
    id: "systems",
    label: "Systems",
  },

  {
    id: "booking",
    label: "Booking",
  },

  {
    id: "games",
    label: "Games",
  },

  {
    id: "rates",
    label: "Rates",
  },

  {
    id: "tournaments",
    label: "Tournaments",
  },

  {
    id: "membership",
    label: "Membership",
  },
];

export function Navbar() {
  const navigate =
    useNavigate();

  const {
    user,
    loading:
      authLoading,
    logout,
  } = useAuth();

  const [
    active,
    setActive,
  ] = useState(
    "systems",
  );

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  /* =======================================================
     SCROLL + ACTIVE SECTION
  ======================================================= */

  useEffect(() => {
    const onScroll =
      () =>
        setScrolled(
          window.scrollY >
            24,
        );

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      },
    );

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                setActive(
                  entry.target.id,
                );
              }
            },
          );
        },

        {
          rootMargin:
            "-45% 0px -50% 0px",
        },
      );

    links.forEach(
      ({
        id,
      }) => {
        const element =
          document.getElementById(
            id,
          );

        if (element) {
          observer.observe(
            element,
          );
        }
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll,
      );

      observer.disconnect();
    };
  }, []);

  /* =======================================================
     SECTION NAVIGATION
  ======================================================= */

  function go(
    id: string,
  ) {
    setOpen(false);

    const element =
      document.getElementById(
        id,
      );

    if (element) {
      element.scrollIntoView({
        behavior:
          "smooth",

        block:
          "start",
      });

      return;
    }

    /*
     * If user is on /account, /login etc.
     * first go home then scroll.
     */

    void navigate({
      to: "/",
    }).then(() => {
      window.setTimeout(
        () => {
          document
            .getElementById(
              id,
            )
            ?.scrollIntoView({
              behavior:
                "smooth",

              block:
                "start",
            });
        },
        100,
      );
    });
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    try {
      setLoggingOut(
        true,
      );

      await logout();

      setOpen(false);

      await navigate({
        to: "/",
      });
    } finally {
      setLoggingOut(
        false,
      );
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">

      <motion.nav
        initial={{
          y: -80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.8,

          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className={`glass-static mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-shadow duration-500 sm:px-6 ${
          scrolled
            ? "glow-cyan"
            : ""
        }`}
      >

        {/* LOGO */}

        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={() =>
            setOpen(false)
          }
        >

          <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <Gamepad2 className="size-5" />
          </span>

          <span className="font-display text-sm font-bold tracking-[0.2em] uppercase">

            Nexus

            <span className="text-neon-cyan">
              Arena
            </span>

          </span>

        </Link>

        {/* DESKTOP LINKS */}

        <div className="hidden items-center gap-1 lg:flex">

          {links.map(
            (link) => (

              <button
                key={
                  link.id
                }
                type="button"
                onClick={() =>
                  go(
                    link.id,
                  )
                }
                className="relative rounded-lg px-3 py-2 font-display text-[11px] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
              >

                {active ===
                link.id ? (

                  <motion.span
                    layoutId="nav-glow"
                    className="absolute inset-0 rounded-lg bg-primary/12 shadow-[0_0_20px_-4px_var(--neon-cyan)]"
                    transition={{
                      type:
                        "spring",

                      stiffness:
                        380,

                      damping:
                        32,
                    }}
                  />

                ) : null}

                <span
                  className={`relative ${
                    active ===
                    link.id
                      ? "text-neon-cyan"
                      : ""
                  }`}
                >
                  {
                    link.label
                  }
                </span>

              </button>

            ),
          )}

        </div>

        {/* RIGHT ACTIONS */}

        <div className="flex items-center gap-2">

          <Button
            variant="neon"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() =>
              go(
                "booking",
              )
            }
          >
            Book Slot
          </Button>

          {/* LOGGED OUT */}

          {!authLoading &&
            !user && (
              <div className="hidden items-center gap-2 lg:flex">

                {/* <Link to="/login">

                  <Button
                    variant="glass"
                    size="sm"
                  >
                    <LogIn className="mr-1.5 size-4" />

                    Login
                  </Button>

                </Link> */}

                <Link to="/signup">

                  <Button
                    variant="hero"
                    size="sm"
                  >
                    <UserPlus className="mr-1.5 size-4" />

                    Sign Up
                  </Button>

                </Link>

              </div>
            )}

          {/* LOGGED IN */}

          {!authLoading &&
            user && (
              <div className="hidden items-center gap-2 lg:flex">

                <Link to="/account">

                  <Button
                    variant="glass"
                    size="sm"
                    className="max-w-36"
                  >
                    <User className="mr-1.5 size-4 text-neon-cyan" />

                    <span className="truncate">
                      {
                        user.name
                      }
                    </span>
                  </Button>

                </Link>

                {/* <Button
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
                    "..."
                  ) : (
                    <>
                      <LogOut className="mr-1.5 size-4" />

                      Logout
                    </>
                  )}

                </Button> */}

              </div>
            )}

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() =>
              setOpen(
                (value) =>
                  !value,
              )
            }
            className="grid size-9 place-items-center rounded-xl border border-border text-foreground lg:hidden"
          >

            {open ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}

          </button>

        </div>

      </motion.nav>

      {/* MOBILE MENU */}

      <AnimatePresence>

        {open ? (

          <motion.div
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -12,
            }}
            transition={{
              duration:
                0.25,
            }}
            className="glass-static mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl p-2 lg:hidden"
          >

            {links.map(
              (link) => (

                <button
                  key={
                    link.id
                  }
                  type="button"
                  onClick={() =>
                    go(
                      link.id,
                    )
                  }
                  className="block w-full rounded-xl px-4 py-3 text-left font-display text-xs tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:bg-primary/10 hover:text-neon-cyan"
                >
                  {
                    link.label
                  }
                </button>

              ),
            )}

            <div className="my-2 border-t border-border" />

            {!authLoading &&
              !user && (
                <div className="grid gap-2 p-2">

                  <Link
                    to="/login"
                    onClick={() =>
                      setOpen(
                        false,
                      )
                    }
                  >

                    <Button
                      variant="glass"
                      className="w-full"
                    >
                      <LogIn className="mr-2 size-4" />

                      Login
                    </Button>

                  </Link>

                  <Link
                    to="/signup"
                    onClick={() =>
                      setOpen(
                        false,
                      )
                    }
                  >

                    <Button
                      variant="hero"
                      className="w-full"
                    >
                      <UserPlus className="mr-2 size-4" />

                      Sign Up
                    </Button>

                  </Link>

                </div>
              )}

            {!authLoading &&
              user && (
                <div className="grid gap-2 p-2">

                  <Link
                    to="/account"
                    onClick={() =>
                      setOpen(
                        false,
                      )
                    }
                  >

                    <Button
                      variant="glass"
                      className="w-full"
                    >
                      <User className="mr-2 size-4 text-neon-cyan" />

                      My Account ·{" "}
                      {
                        user.name
                      }
                    </Button>

                  </Link>

                  {/* <Button
                    variant="ghost"
                    className="w-full"
                    disabled={
                      loggingOut
                    }
                    onClick={() =>
                      void handleLogout()
                    }
                  >
                    <LogOut className="mr-2 size-4" />

                    Logout
                  </Button> */}

                </div>
              )}

          </motion.div>

        ) : null}

      </AnimatePresence>

    </header>
  );
}