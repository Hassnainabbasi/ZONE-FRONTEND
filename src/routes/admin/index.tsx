import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  Settings2,
  Trash2,
  Wrench,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  PageHeader,
  StatCard,
} from "@/components/admin/AdminShell";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Switch,
} from "@/components/ui/switch";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  systemApi,
  type GamingSystem,
} from "@/services/systemApi";

const title =
  "Systems & Live Monitor | Nexus Arena Admin";

export const Route =
  createFileRoute(
    "/admin/",
  )({
    head: () => ({
      meta: [
        {
          title,
        },
      ],
    }),

    component:
      SystemsAdmin,
  });

function SystemsAdmin() {
  const [
    systems,
    setSystems,
  ] =
    useState<
      GamingSystem[]
    >([]);

  const [
    monitor,
    setMonitor,
  ] =
    useState<
      GamingSystem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    busy,
    setBusy,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(
      false,
    );

  /* CREATE FORM */

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    label,
    setLabel,
  ] =
    useState("");

  const [
    stations,
    setStations,
  ] =
    useState(
      "1",
    );

  const [
    rate,
    setRate,
  ] =
    useState(
      "0",
    );

  const [
    tag,
    setTag,
  ] =
    useState("");

  const [
    specs,
    setSpecs,
  ] =
    useState("");

  /* =======================================================
     LOAD
  ======================================================= */

  async function load() {
    try {
      setLoading(
        true,
      );

      const [
        systemsResponse,
        monitorResponse,
      ] =
        await Promise.all([
          systemApi.adminList(),

          systemApi.liveMonitor(),
        ]);

      setSystems(
        systemsResponse.data ||
          [],
      );

      setMonitor(
        monitorResponse.data ||
          [],
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load systems",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(() => {
    void load();

    const timer =
      window.setInterval(
        () => {
          void systemApi
            .liveMonitor()
            .then(
              (response) =>
                setMonitor(
                  response.data ||
                    [],
                ),
            )
            .catch(
              console.error,
            );
        },

        15000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, []);

  /* =======================================================
     CREATE
  ======================================================= */

  async function createSystem() {
    if (
      !name.trim() ||
      !label.trim()
    ) {
      toast.error(
        "System name and label are required",
      );

      return;
    }

    try {
      setBusy(
        "create",
      );

      const response =
        await systemApi.create({
          name:
            name.trim(),

          label:
            label.trim(),

          totalStations:
            Number(
              stations,
            ),

          pricePerHour:
            Number(
              rate,
            ),

          tag:
            tag.trim(),

          specs:
            specs
              .split(
                "|",
              )
              .map(
                (value) =>
                  value.trim(),
              )
              .filter(Boolean),

          active:
            true,

          publicVisible:
            true,

          sortOrder:
            systems.length +
            1,
        });

      toast.success(
        response.message,
      );

      setCreateOpen(
        false,
      );

      setName("");
      setLabel("");
      setStations("1");
      setRate("0");
      setTag("");
      setSpecs("");

      await load();
    } catch (
      error
    ) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create system",
      );
    } finally {
      setBusy(
        null,
      );
    }
  }

  /* =======================================================
     PATCH
  ======================================================= */

  function patchSystem(
    id:
      string,

    key:
      keyof GamingSystem,

    value:
      unknown,
  ) {
    setSystems(
      (current) =>
        current.map(
          (system) =>
            system._id ===
            id
              ? {
                  ...system,

                  [key]:
                    value,
                }
              : system,
        ),
    );
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function saveSystem(
    system:
      GamingSystem,
  ) {
    try {
      setBusy(
        system._id,
      );

      const response =
        await systemApi.update(
          system._id,

          {
            label:
              system.label,

            totalStations:
              Number(
                system.totalStations,
              ),

            pricePerHour:
              Number(
                system.pricePerHour,
              ),

            tag:
              system.tag,

            specs:
              system.specs,

            active:
              system.active,

            publicVisible:
              system.publicVisible,

            sortOrder:
              Number(
                system.sortOrder,
              ),
          },
        );

      toast.success(
        response.message,
      );

      await load();
    } catch (
      error
    ) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update system",
      );
    } finally {
      setBusy(
        null,
      );
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deleteSystem(
    system:
      GamingSystem,
  ) {
    if (
      !window.confirm(
        `Delete ${system.label}?`,
      )
    ) {
      return;
    }

    try {
      setBusy(
        system._id,
      );

      const response =
        await systemApi.remove(
          system._id,
        );

      toast.success(
        response.message,
      );

      await load();
    } catch (
      error
    ) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete system",
      );
    } finally {
      setBusy(
        null,
      );
    }
  }

  /* =======================================================
     MAINTENANCE
  ======================================================= */

  async function toggleMaintenance(
    system:
      GamingSystem,

    stationNumber:
      number,

    current:
      boolean,
  ) {
    try {
      const key =
        `${system._id}-${stationNumber}`;

      setBusy(
        key,
      );

      const response =
        await systemApi.setMaintenance(
          system._id,

          stationNumber,

          !current,
        );

      toast.success(
        response.message,
      );

      await load();
    } catch (
      error
    ) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to change maintenance",
      );
    } finally {
      setBusy(
        null,
      );
    }
  }

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(
      () => {
        let total =
          0;

        let free =
          0;

        let occupied =
          0;

        let reserved =
          0;

        for (
          const system of
          monitor
        ) {
          total +=
            system.stats?.total ||
            0;

          free +=
            system.stats?.available ||
            0;

          occupied +=
            system.stats?.occupied ||
            0;

          reserved +=
            system.stats?.reserved ||
            0;
        }

        return {
          total,
          free,
          occupied,
          reserved,
        };
      },

      [
        monitor,
      ],
    );

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Gaming Systems"
        subtitle="Create systems here once. They automatically appear in booking, public hardware, pricing compatibility and the live monitor."
        action={
          <div className="flex gap-2">

            <Button
              variant="glass"
              onClick={() =>
                void load()
              }
            >

              <RefreshCcw className="mr-2 size-4" />

              Refresh

            </Button>

            <Dialog
              open={
                createOpen
              }
              onOpenChange={
                setCreateOpen
              }
            >

              <DialogTrigger
                asChild
              >

                <Button variant="hero">

                  <Plus className="mr-2 size-4" />

                  Add System

                </Button>

              </DialogTrigger>

              <DialogContent>

                <DialogHeader>

                  <DialogTitle>
                    Create Gaming System
                  </DialogTitle>

                  <DialogDescription>
                    This system will automatically become available in booking.
                  </DialogDescription>

                </DialogHeader>

                <div className="grid gap-4">

                  <div>

                    <Label>
                      System Name / Code
                    </Label>

                    <Input
                      value={
                        name
                      }
                      onChange={(event) =>
                        setName(
                          event.target.value,
                        )
                      }
                      placeholder="PC"
                    />

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Keep this short, e.g. PC, PS5, SIM.
                    </p>

                  </div>

                  <div>

                    <Label>
                      Public Label
                    </Label>

                    <Input
                      value={
                        label
                      }
                      onChange={(event) =>
                        setLabel(
                          event.target.value,
                        )
                      }
                      placeholder="PC Arena"
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div>

                      <Label>
                        Total Stations
                      </Label>

                      <Input
                        type="number"
                        min="1"
                        value={
                          stations
                        }
                        onChange={(event) =>
                          setStations(
                            event.target.value,
                          )
                        }
                      />

                    </div>

                    <div>

                      <Label>
                        Default Rate / Hour
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        value={
                          rate
                        }
                        onChange={(event) =>
                          setRate(
                            event.target.value,
                          )
                        }
                      />

                    </div>

                  </div>

                  <div>

                    <Label>
                      Tag
                    </Label>

                    <Input
                      value={
                        tag
                      }
                      onChange={(event) =>
                        setTag(
                          event.target.value,
                        )
                      }
                      placeholder="RTX Elite"
                    />

                  </div>

                  <div>

                    <Label>
                      Specs
                    </Label>

                    <Input
                      value={
                        specs
                      }
                      onChange={(event) =>
                        setSpecs(
                          event.target.value,
                        )
                      }
                      placeholder="RTX 5080 | Ryzen 9 | 32GB RAM | 360Hz"
                    />

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Separate specs using |
                    </p>

                  </div>

                  <Button
                    variant="hero"
                    disabled={
                      busy ===
                      "create"
                    }
                    onClick={() =>
                      void createSystem()
                    }
                  >

                    {busy ===
                    "create" ? (

                      <Loader2 className="mr-2 size-4 animate-spin" />

                    ) : (

                      <Plus className="mr-2 size-4" />

                    )}

                    Create System

                  </Button>

                </div>

              </DialogContent>

            </Dialog>

          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total Stations"
          value={String(
            stats.total,
          )}
        />

        <StatCard
          label="Available"
          value={String(
            stats.free,
          )}
        />

        <StatCard
          label="In Use"
          value={String(
            stats.occupied,
          )}
        />

        <StatCard
          label="Reserved"
          value={String(
            stats.reserved,
          )}
        />

      </div>

      <Tabs
        defaultValue="systems"
      >

        <TabsList>

          <TabsTrigger value="systems">
            System Setup
          </TabsTrigger>

          <TabsTrigger value="monitor">
            Live Monitor
          </TabsTrigger>

        </TabsList>

        {/* =================================================
            SYSTEM SETUP
        ================================================= */}

        <TabsContent
          value="systems"
          className="mt-5"
        >

          {loading ? (

            <div className="flex justify-center py-20">

              <Loader2 className="size-7 animate-spin text-neon-cyan" />

            </div>

          ) : (

            <div className="grid gap-5 xl:grid-cols-2">

              {systems.map(
                (
                  system,
                ) => (

                  <section
                    key={
                      system._id
                    }
                    className="glass-static rounded-2xl p-5"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <Badge variant="outline">

                          {
                            system.name
                          }

                        </Badge>

                        <h2 className="mt-2 font-display text-lg font-black">

                          {
                            system.label
                          }

                        </h2>

                      </div>

                      <Settings2 className="size-5 text-muted-foreground" />

                    </div>

                    <div className="mt-5 grid gap-4">

                      <div>

                        <Label>
                          Public Label
                        </Label>

                        <Input
                          value={
                            system.label
                          }
                          onChange={(event) =>
                            patchSystem(
                              system._id,

                              "label",

                              event.target.value,
                            )
                          }
                        />

                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <div>

                          <Label>
                            Stations
                          </Label>

                          <Input
                            type="number"
                            min="1"
                            value={
                              system.totalStations
                            }
                            onChange={(event) =>
                              patchSystem(
                                system._id,

                                "totalStations",

                                Number(
                                  event.target.value,
                                ),
                              )
                            }
                          />

                        </div>

                        <div>

                          <Label>
                            Rate / Hour
                          </Label>

                          <Input
                            type="number"
                            min="0"
                            value={
                              system.pricePerHour
                            }
                            onChange={(event) =>
                              patchSystem(
                                system._id,

                                "pricePerHour",

                                Number(
                                  event.target.value,
                                ),
                              )
                            }
                          />

                        </div>

                      </div>

                      <div>

                        <Label>
                          Tag
                        </Label>

                        <Input
                          value={
                            system.tag
                          }
                          onChange={(event) =>
                            patchSystem(
                              system._id,

                              "tag",

                              event.target.value,
                            )
                          }
                        />

                      </div>

                      <div>

                        <Label>
                          Specs
                        </Label>

                        <Input
                          value={
                            system.specs.join(
                              " | ",
                            )
                          }
                          onChange={(event) =>
                            patchSystem(
                              system._id,

                              "specs",

                              event.target.value
                                .split(
                                  "|",
                                )
                                .map(
                                  (value) =>
                                    value.trim(),
                                )
                                .filter(Boolean),
                            )
                          }
                        />

                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <div className="flex items-center justify-between rounded-xl border border-border p-3">

                          <Label>
                            Active
                          </Label>

                          <Switch
                            checked={
                              system.active
                            }
                            onCheckedChange={(value) =>
                              patchSystem(
                                system._id,

                                "active",

                                value,
                              )
                            }
                          />

                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border p-3">

                          <Label>
                            Public
                          </Label>

                          <Switch
                            checked={
                              system.publicVisible
                            }
                            onCheckedChange={(value) =>
                              patchSystem(
                                system._id,

                                "publicVisible",

                                value,
                              )
                            }
                          />

                        </div>

                      </div>

                      <div className="flex gap-2">

                        <Button
                          variant="hero"
                          className="flex-1"
                          disabled={
                            busy ===
                            system._id
                          }
                          onClick={() =>
                            void saveSystem(
                              system,
                            )
                          }
                        >

                          {busy ===
                          system._id ? (

                            <Loader2 className="mr-2 size-4 animate-spin" />

                          ) : (

                            <Save className="mr-2 size-4" />

                          )}

                          Save System

                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() =>
                            void deleteSystem(
                              system,
                            )
                          }
                        >

                          <Trash2 className="size-4" />

                        </Button>

                      </div>

                    </div>

                  </section>

                ),
              )}

            </div>

          )}

        </TabsContent>

        {/* =================================================
            LIVE MONITOR
        ================================================= */}

        <TabsContent
          value="monitor"
          className="mt-5"
        >

          <div className="grid gap-5">

            {monitor.map(
              (
                system,
              ) => (

                <section
                  key={
                    system._id
                  }
                  className="glass-static rounded-2xl p-5"
                >

                  <div className="mb-4 flex flex-wrap justify-between gap-3">

                    <div>

                      <h2 className="font-display font-black">

                        {
                          system.label
                        }

                      </h2>

                      <p className="text-[10px] text-muted-foreground">

                        {
                          system.totalStations
                        }{" "}

                        stations · Rs{" "}

                        {
                          system.pricePerHour
                        }

                        /hr

                      </p>

                    </div>

                    <div className="flex gap-2">

                      <Badge className="bg-neon-green/10 text-neon-green">

                        {
                          system.stats?.available ||
                          0
                        }{" "}

                        Free

                      </Badge>

                      <Badge className="bg-destructive/10 text-destructive">

                        {
                          system.stats?.occupied ||
                          0
                        }{" "}

                        In Use

                      </Badge>

                      <Badge className="bg-gold/10 text-gold">

                        {
                          system.stats?.reserved ||
                          0
                        }{" "}

                        Reserved

                      </Badge>

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">

                    {(system.stations ||
                      []).map(
                      (
                        station,
                      ) => {

                        const underMaintenance =
                          station.status ===
                          "maintenance";

                        return (

                          <div
                            key={
                              station.stationId
                            }
                            className="rounded-xl border border-border p-3"
                          >

                            <div className="flex justify-between">

                              <strong className="font-display text-xs">

                                {
                                  station.stationId
                                }

                              </strong>

                              <span
                                className={
                                  station.status ===
                                  "available"
                                    ? "size-2 rounded-full bg-neon-green"
                                    : station.status ===
                                        "occupied"
                                      ? "size-2 rounded-full bg-destructive"
                                      : station.status ===
                                          "reserved"
                                        ? "size-2 rounded-full bg-gold"
                                        : "size-2 rounded-full bg-muted-foreground"
                                }
                              />

                            </div>

                            <p className="mt-2 text-[10px]">

                              {station.status ===
                              "occupied"
                                ? `In Use · ${station.minutesLeft || 0}m`
                                : station.status ===
                                    "reserved"
                                  ? "Reserved"
                                  : station.status ===
                                      "maintenance"
                                    ? "Maintenance"
                                    : "Available"}

                            </p>

                            {station.currentBooking && (

                              <div className="mt-2 text-[9px] text-muted-foreground">

                                <p>

                                  {
                                    station.currentBooking.customerName
                                  }

                                </p>

                                <p>

                                  {
                                    station.currentBooking.game
                                  }

                                </p>

                                <p>

                                  {
                                    station.currentBooking.bookingId
                                  }

                                </p>

                              </div>

                            )}

                            {station.nextBooking &&
                              !station.currentBooking && (

                              <div className="mt-2 text-[9px] text-muted-foreground">

                                <p>

                                  Next:{" "}

                                  {
                                    station.nextBooking.customerName
                                  }

                                </p>

                                <p>

                                  {
                                    station.nextBooking.bookingDate
                                  }{" "}

                                  {
                                    station.nextBooking.startTime
                                  }

                                </p>

                              </div>

                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-3 w-full px-1 text-[9px]"
                              disabled={
                                busy ===
                                `${system._id}-${station.stationNumber}`
                              }
                              onClick={() =>
                                void toggleMaintenance(
                                  system,

                                  station.stationNumber,

                                  underMaintenance,
                                )
                              }
                            >

                              <Wrench className="mr-1 size-3" />

                              {underMaintenance
                                ? "Enable"
                                : "Maintenance"}

                            </Button>

                          </div>

                        );
                      },
                    )}

                  </div>

                </section>

              ),
            )}

          </div>

        </TabsContent>

      </Tabs>
    </>
  );
}