import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "@tanstack/react-router";

import {
  Bell,
  CalendarCheck,
  Coffee,
  Crown,
  Trophy,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  notificationApi,
  type AdminNotification,
} from "@/services/notificationApi";

/* =========================================================
   STORAGE
========================================================= */

const READ_KEY =
  "nexus_admin_notifications_read_at";

/* =========================================================
   ICON
========================================================= */

function NotificationIcon({
  type,
}: {
  type:
    AdminNotification["type"];
}) {
  if (
    type ===
    "booking"
  ) {
    return (
      <CalendarCheck className="size-4 text-neon-cyan" />
    );
  }

  if (
    type ===
    "cafe"
  ) {
    return (
      <Coffee className="size-4 text-gold" />
    );
  }

  if (
    type ===
    "membership"
  ) {
    return (
      <Crown className="size-4 text-secondary" />
    );
  }

  return (
    <Trophy className="size-4 text-neon-green" />
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export function AdminNotifications() {
  const navigate =
    useNavigate();

  const [
    notifications,
    setNotifications,
  ] =
    useState<
      AdminNotification[]
    >([]);

  const [
    unread,
    setUnread,
  ] =
    useState(
      0,
    );

  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );

  /* =======================================================
     LOAD INITIAL
  ======================================================= */

  async function initialLoad() {
    try {
      const response =
        await notificationApi.list();

      setNotifications(
        response.data,
      );

      const readAt =
        localStorage.getItem(
          READ_KEY,
        );

      if (!readAt) {
        /*
         * First ever visit:
         * don't suddenly show 50 old notifications unread.
         */

        localStorage.setItem(
          READ_KEY,
          response.serverTime,
        );

        setUnread(
          0,
        );

        return;
      }

      const readTime =
        new Date(
          readAt,
        ).getTime();

      setUnread(
        response.data.filter(
          (notification) =>
            new Date(
              notification.createdAt,
            ).getTime() >
            readTime,
        ).length,
      );
    } catch (
      error
    ) {
      console.error(
        "Notification load:",
        error,
      );
    }
  }

  /* =======================================================
     POLL FOR NEW ITEMS
  ======================================================= */

  useEffect(() => {
    void initialLoad();

    let lastPoll =
      new Date().toISOString();

    const timer =
      window.setInterval(
        async () => {
          try {
            const response =
              await notificationApi.list(
                lastPoll,
              );

            lastPoll =
              response.serverTime;

            if (
              !response.data.length
            ) {
              return;
            }

            setNotifications(
              (current) => {
                const map =
                  new Map<
                    string,
                    AdminNotification
                  >();

                for (
                  const item of
                    response.data
                ) {
                  map.set(
                    item.id,
                    item,
                  );
                }

                for (
                  const item of
                    current
                ) {
                  if (
                    !map.has(
                      item.id,
                    )
                  ) {
                    map.set(
                      item.id,
                      item,
                    );
                  }
                }

                return [
                  ...map.values(),
                ]
                  .sort(
                    (a, b) =>
                      new Date(
                        b.createdAt,
                      ).getTime() -
                      new Date(
                        a.createdAt,
                      ).getTime(),
                  )
                  .slice(
                    0,
                    50,
                  );
              },
            );

            setUnread(
              (current) =>
                current +
                response.data.length,
            );
          } catch (
            error
          ) {
            /*
             * Silent polling failure.
             * Don't annoy admin with toast every 10 seconds.
             */

            console.error(
              "Notification poll:",
              error,
            );
          }
        },

        10000,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, []);

  /* =======================================================
     OPEN / READ
  ======================================================= */

  function handleOpenChange(
    value:
      boolean,
  ) {
    setOpen(
      value,
    );

    if (
      value &&
      unread >
        0
    ) {
      localStorage.setItem(
        READ_KEY,
        new Date().toISOString(),
      );

      setUnread(
        0,
      );
    }
  }

  /* =======================================================
     OPEN NOTIFICATION
  ======================================================= */

  async function openNotification(
    notification:
      AdminNotification,
  ) {
    setOpen(
      false,
    );

    await navigate({
      to:
        notification.href,
    });
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Popover
      open={
        open
      }
      onOpenChange={
        handleOpenChange
      }
    >

      <PopoverTrigger
        asChild
      >

        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >

          <Bell className="size-5" />

          {unread >
            0 && (

            <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-neon-red px-1 text-[8px] font-bold text-white">

              {unread >
              99
                ? "99+"
                : unread}

            </span>

          )}

        </Button>

      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-96 max-w-[calc(100vw-24px)] p-0"
      >

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-border px-4 py-3">

          <div>

            <p className="font-display text-xs tracking-[0.18em] uppercase">
              Notifications
            </p>

            <p className="mt-0.5 text-[9px] text-muted-foreground">
              Auto refresh every 10 seconds
            </p>

          </div>

          <Badge
            variant="outline"
            className="text-[9px]"
          >

            {
              notifications.length
            }

          </Badge>

        </div>

        {/* LIST */}

        <div className="max-h-96 overflow-y-auto">

          {notifications.length ? (

            notifications.map(
              (
                notification,
              ) => (

                <button
                  key={
                    notification.id
                  }
                  type="button"
                  onClick={() =>
                    void openNotification(
                      notification,
                    )
                  }
                  className="flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/40"
                >

                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-background/50">

                    <NotificationIcon
                      type={
                        notification.type
                      }
                    />

                  </span>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-2">

                      <p className="text-xs font-semibold">

                        {
                          notification.title
                        }

                      </p>

                      <span className="shrink-0 text-[9px] text-muted-foreground">

                        {
                          notification.time
                        }

                      </span>

                    </div>

                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">

                      {
                        notification.body
                      }

                    </p>

                    <p className="mt-1 font-display text-[8px] tracking-[0.12em] text-primary uppercase">

                      {
                        notification.source
                      }

                    </p>

                  </div>

                </button>

              ),
            )

          ) : (

            <div className="p-8 text-center">

              <Bell className="mx-auto size-6 text-muted-foreground" />

              <p className="mt-3 text-xs text-muted-foreground">
                No notifications
              </p>

            </div>

          )}

        </div>

      </PopoverContent>

    </Popover>
  );
}