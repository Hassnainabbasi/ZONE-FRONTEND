import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import {
  motion,
} from "motion/react";

import {
  Bell,
  Search,
  ChevronLeft,
  MonitorPlay,
  CalendarCheck,
  Wallet,
  Gamepad2,
  Trophy,
  Crown,
  Coffee,
  Settings,
  Zap,
  LogOut,
  UserCog,
  Menu,
  Loader2,
  ShieldCheck,
  ExternalLink,
  BadgeDollarSign,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Switch,
} from "@/components/ui/switch";

import {
  Badge,
} from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  cn,
} from "@/lib/utils";

import {
  AdminNotifications,
} from "./AdminNotification";

import {
  useAuth,
} from "@/context/auth-context";

/* =========================================================
   ADMIN NAVIGATION
========================================================= */

const nav = [
  {
    to: "/admin",
    label: "Live Systems",
    icon: MonitorPlay,
  },

  {
    to: "/admin/booking",
    label: "Bookings",
    icon: CalendarCheck,
  },

  {
    to: "/admin/revenue",
    label: "Revenue",
    icon: Wallet,
  },

  {
    to: "/admin/games",
    label: "Games & Pricing",
    icon: Gamepad2,
  },

  {
    to: "/admin/tournament",
    label: "Tournaments",
    icon: Trophy,
  },

  {
    to: "/admin/members",
    label: "Memberships",
    icon: Crown,
  },

  {
    to: "/admin/cafe",
    label: "Cafe Orders",
    icon: Coffee,
  },

  {
    to: "/admin/setting",
    label: "Settings",
    icon: Settings,
  },
  {
  to: "/admin/games",
  label: "Games",
  icon: Gamepad2,
},

{
  to: "/admin/pricing",
  label: "Pricing & Packages",
  icon: BadgeDollarSign,
},
] as const;

/* =========================================================
   NAV LIST
========================================================= */

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;

  onNavigate?: () => void;
}) {
  const path =
    useRouterState({
      select:
        (state) =>
          state.location.pathname,
    });

  return (
    <nav className="flex flex-col gap-1 px-2">

      {nav.map(
        (item) => {
          const active =
            item.to ===
            "/admin"
              ? path ===
                "/admin"
              : path.startsWith(
                  item.to,
                );

          const Icon =
            item.icon;

          return (
            <Link
              key={
                item.to
              }
              to={
                item.to
              }
              onClick={
                onNavigate
              }
              title={
                collapsed
                  ? item.label
                  : undefined
              }
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",

                active
                  ? "bg-primary/12 text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >

              {active && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-primary"
                />
              )}

              <Icon
                className={cn(
                  "size-[18px] shrink-0",

                  active
                    ? "text-primary"
                    : "opacity-80",
                )}
              />

              {!collapsed && (
                <span className="truncate font-medium">
                  {
                    item.label
                  }
                </span>
              )}

            </Link>
          );
        },
      )}

    </nav>
  );
}

/* =========================================================
   BRAND
========================================================= */

function Brand({
  collapsed,
}: {
  collapsed: boolean;
}) {
  return (
    <Link
      to="/admin"
      className="flex items-center gap-2.5 px-4 py-5"
    >

      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">

        <Zap className="size-[18px]" />

      </span>

      {!collapsed && (
        <div className="min-w-0">

          <p className="font-display text-sm font-black tracking-widest text-gradient">
            Arcadium
          </p>

          <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            Admin Console
          </p>

        </div>
      )}

    </Link>
  );
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  name?: string,
) {
  if (!name) {
    return "NA";
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(
        0,
        2,
      )
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
}

/* =========================================================
   ADMIN SHELL
========================================================= */

export function AdminShell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    collapsed,
    setCollapsed,
  ] =
    useState(false);

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    storeOpen,
    setStoreOpen,
  ] =
    useState(true);

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);

  /* =======================================================
     USER DETAILS
  ======================================================= */

  const initials =
    useMemo(
      () =>
        getInitials(
          user?.name,
        ),
      [
        user?.name,
      ],
    );

  const adminName =
    user?.name ||
    "CX Admin";

  const adminEmail =
    user?.email ||
    "";

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    if (
      loggingOut
    ) {
      return;
    }

    try {
      setLoggingOut(
        true,
      );

      await logout();

      toast.success(
        "Signed out successfully",
      );

      await navigate({
        to:
          "/admin/login",
      });
    } catch (error) {
      console.error(
        "Admin logout:",
        error,
      );

      toast.error(
        "Unable to sign out",
      );
    } finally {
      setLoggingOut(
        false,
      );
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-background">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 hero-glow opacity-60" />

      {/* ===================================================
          DESKTOP SIDEBAR
      =================================================== */}

      <motion.aside
        animate={{
          width:
            collapsed
              ? 76
              : 244,
        }}
        transition={{
          duration:
            0.35,

          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="glass-static fixed inset-y-0 left-0 z-40 hidden flex-col border-r lg:flex"
      >

        <Brand
          collapsed={
            collapsed
          }
        />

        <div className="neon-divider mx-4 mb-3" />

        <div className="flex-1 overflow-y-auto pb-4">

          <NavList
            collapsed={
              collapsed
            }
          />

        </div>

        {/* SIDEBAR USER */}

        {!collapsed && (
          <div className="mx-3 mb-2 rounded-xl border border-border bg-background/20 p-3">

            <div className="flex items-center gap-3">

              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/20 font-display text-[11px] font-bold text-secondary-foreground">

                {
                  initials
                }

              </span>

              <div className="min-w-0">

                <p className="truncate text-xs font-semibold">
                  {
                    adminName
                  }
                </p>

                <div className="mt-0.5 flex items-center gap-1">

                  <ShieldCheck className="size-3 text-neon-green" />

                  <span className="text-[9px] text-neon-green">
                    Administrator
                  </span>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* COLLAPSE */}

        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (current) =>
                !current,
            )
          }
          className="m-3 flex items-center justify-center gap-2 rounded-xl border border-border py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >

          <ChevronLeft
            className={cn(
              "size-4 transition-transform",

              collapsed &&
                "rotate-180",
            )}
          />

          {!collapsed &&
            "Collapse"}

        </button>

      </motion.aside>

      {/* ===================================================
          CONTENT WRAPPER
      =================================================== */}

      <div className="transition-[padding] duration-300">

        <div
          className={cn(
            "lg:pl-[244px]",

            collapsed &&
              "lg:pl-[76px]",
          )}
        >

          {/* =================================================
              TOP NAVBAR
          ================================================= */}

          <header className="glass-static sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-3 sm:px-5">

            {/* MOBILE SIDEBAR */}

            <Sheet
              open={
                open
              }
              onOpenChange={
                setOpen
              }
            >

              <SheetTrigger
                asChild
              >

                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                >

                  <Menu className="size-5" />

                </Button>

              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[260px] p-0"
              >

                <Brand
                  collapsed={
                    false
                  }
                />

                <div className="neon-divider mx-4 mb-3" />

                <NavList
                  collapsed={
                    false
                  }
                  onNavigate={() =>
                    setOpen(
                      false,
                    )
                  }
                />

                {/* MOBILE ADMIN INFO */}

                <div className="mx-3 mt-5 rounded-xl border border-border p-3">

                  <div className="flex items-center gap-3">

                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/20 font-display text-xs font-bold">

                      {
                        initials
                      }

                    </span>

                    <div className="min-w-0">

                      <p className="truncate text-xs font-semibold">
                        {
                          adminName
                        }
                      </p>

                      <p className="truncate text-[10px] text-muted-foreground">
                        {
                          adminEmail
                        }
                      </p>

                    </div>

                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full justify-start text-destructive"
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

                    Sign Out

                  </Button>

                </div>

              </SheetContent>

            </Sheet>

            {/* SEARCH */}

            <div className="relative hidden max-w-md flex-1 items-center md:flex">

              <Search className="absolute left-3 size-4 text-muted-foreground" />

              <Input
                placeholder="Search user, booking ID or PC #"
                className="h-10 rounded-xl border-input bg-muted/30 pl-9 text-sm"
              />

            </div>

            {/* =================================================
                NAVBAR RIGHT
            ================================================= */}

          <div className="ml-auto flex items-center gap-2 sm:gap-3">

  {/* STORE STATUS */}

  <div className="hidden items-center gap-2 rounded-xl border border-border px-3 py-2 sm:flex">
    <span
      className={cn(
        "live-dot size-2 rounded-full",

        storeOpen
          ? "bg-neon-green"
          : "bg-neon-red",
      )}
    />

    <span className="text-xs font-medium">
      {storeOpen
        ? "Open"
        : "Closed"}
    </span>

    <Switch
      checked={
        storeOpen
      }
      onCheckedChange={
        setStoreOpen
      }
    />
  </div>

  {/* LIVE NOTIFICATIONS */}

  <AdminNotifications />

  {/* ADMIN PROFILE */}

  <DropdownMenu>
    {/* existing profile code same */}  
  </DropdownMenu>

</div>

          </header>

          {/* =================================================
              PAGE CONTENT
          ================================================= */}

          <main className="relative z-10 px-3 pb-16 pt-5 sm:px-5 lg:px-7">

            {
              children
            }

          </main>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PAGE HEADER
========================================================= */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow:
    string;

  title:
    string;

  subtitle?:
    string;

  action?:
    React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">

      <div>

        <p className="font-display text-[10px] tracking-[0.26em] text-primary uppercase">

          {
            eyebrow
          }

        </p>

        <h1 className="mt-1.5 font-display text-2xl font-black sm:text-3xl">

          {
            title
          }

        </h1>

        {subtitle && (

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">

            {
              subtitle
            }

          </p>

        )}

      </div>

      {
        action
      }

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

export function StatCard({
  label,
  value,
  delta,
  up,
}: {
  label:
    string;

  value:
    string;

  delta?:
    string;

  up?:
    boolean;
}) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5">

      <p className="font-display text-[10px] tracking-[0.2em] text-muted-foreground uppercase">

        {
          label
        }

      </p>

      <p className="mt-2 font-display text-2xl font-black">

        {
          value
        }

      </p>

      {delta && (

        <Badge
          variant="outline"
          className={cn(
            "mt-3 border-transparent text-[11px]",

            up
              ? "bg-neon-green/15 text-neon-green"
              : "bg-neon-red/15 text-neon-red",
          )}
        >

          {
            delta
          }{" "}

          vs last week

        </Badge>

      )}

    </div>
  );
}