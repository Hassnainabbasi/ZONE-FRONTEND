import {
  useEffect,
  useState,
} from "react";

import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  Loader2,
  Moon,
  Plus,
  Save,
  Sun,
  Trash2,
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
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Switch,
} from "@/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  PageHeader,
  StatCard,
} from "@/components/admin/AdminShell";

import {
  pricingApi,
  type PricingPackageType,
  type PricingPlan,
  type PricingSystemType,
} from "@/services/pricingApi";

export const Route =
  createFileRoute(
    "/admin/pricing",
  )({
    component:
      PricingAdminPage,
  });

function PricingAdminPage() {
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
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState<
      string | null
    >(null);

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  /* CREATE */

  const [
    newName,
    setNewName,
  ] =
    useState("");

  const [
    newSystem,
    setNewSystem,
  ] =
    useState<
      PricingSystemType
    >("PC");

  const [
    newType,
    setNewType,
  ] =
    useState<
      PricingPackageType
    >("Hourly");

  const [
    newPrice,
    setNewPrice,
  ] =
    useState("0");

  const [
    newDuration,
    setNewDuration,
  ] =
    useState("1");

  /* =======================================================
     LOAD
  ======================================================= */

  async function load() {
    try {
      setLoading(
        true,
      );

      const response =
        await pricingApi.adminList();

      setPlans(
        Array.isArray(
          response.data,
        )
          ? response.data
          : [],
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load pricing plans",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

  /* =======================================================
     PATCH
  ======================================================= */

  function patchPlan(
    id: string,

    key:
      keyof PricingPlan,

    value:
      unknown,
  ) {
    setPlans(
      (current) =>
        current.map(
          (plan) =>
            plan._id ===
            id
              ? {
                  ...plan,

                  [key]:
                    value,
                }
              : plan,
        ),
    );
  }

  /* =======================================================
     CREATE
  ======================================================= */

  async function createPlan() {
    if (
      !newName.trim()
    ) {
      toast.error(
        "Plan name is required",
      );

      return;
    }

    try {
      setActionLoading(
        "create",
      );

      const response =
        await pricingApi.create({
          name:
            newName.trim(),

          systemType:
            newSystem,

          packageType:
            newType,

          price:
            Number(
              newPrice,
            ),

          durationHours:
            Number(
              newDuration,
            ),

          unit:
            newType ===
            "Hourly"
              ? "/ hour"
              : "/ package",

          active:
            true,

          highlight:
            false,

          sortOrder:
            plans.length +
            1,

          perks:
            [],
        });

      toast.success(
        response.message,
      );

      setCreateOpen(
        false,
      );

      setNewName("");
      setNewSystem("PC");
      setNewType("Hourly");
      setNewPrice("0");
      setNewDuration("1");

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create pricing plan",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function savePlan(
    plan:
      PricingPlan,
  ) {
    try {
      setActionLoading(
        `save-${plan._id}`,
      );

      const response =
        await pricingApi.update(
          plan._id,

          {
            name:
              plan.name,

            systemType:
              plan.systemType,

            packageType:
              plan.packageType,

            price:
              Number(
                plan.price,
              ),

            unit:
              plan.unit,

            durationHours:
              Number(
                plan.durationHours,
              ),

            startTime:
              plan.startTime,

            endTime:
              plan.endTime,

            discountPercent:
              Number(
                plan.discountPercent,
              ),

            perks:
              plan.perks,

            description:
              plan.description,

            highlight:
              plan.highlight,

            active:
              plan.active,

            sortOrder:
              Number(
                plan.sortOrder,
              ),
          },
        );

      toast.success(
        response.message,
      );

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save pricing plan",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deletePlan(
    plan:
      PricingPlan,
  ) {
    if (
      !window.confirm(
        `Delete ${plan.name}?`,
      )
    ) {
      return;
    }

    try {
      setActionLoading(
        `delete-${plan._id}`,
      );

      const response =
        await pricingApi.remove(
          plan._id,
        );

      toast.success(
        response.message,
      );

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete plan",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  const activeCount =
    plans.filter(
      (
        plan,
      ) =>
        plan.active,
    ).length;

  const nightCount =
    plans.filter(
      (
        plan,
      ) =>
        plan.packageType ===
        "Night",
    ).length;

  return (
    <>
      <PageHeader
        eyebrow="Rates"
        title="Pricing & Packages"
        subtitle="Manage hourly rates, day packages, night packages and promotional gaming offers."
        action={
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

                New Package

              </Button>

            </DialogTrigger>

            <DialogContent>

              <DialogHeader>

                <DialogTitle>
                  Create Pricing Package
                </DialogTitle>

                <DialogDescription>
                  Add hourly pricing or a day/night gaming package.
                </DialogDescription>

              </DialogHeader>

              <div className="grid gap-4">

                <div>

                  <Label>
                    Package Name
                  </Label>

                  <Input
                    value={
                      newName
                    }
                    onChange={(event) =>
                      setNewName(
                        event.target.value,
                      )
                    }
                    placeholder="PC Night Package"
                  />

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <Label>
                      System
                    </Label>

                    <Select
                      value={
                        newSystem
                      }
                      onValueChange={(
                        value,
                      ) =>
                        setNewSystem(
                          value as PricingSystemType,
                        )
                      }
                    >

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="PC">
                          PC
                        </SelectItem>

                        <SelectItem value="PS5">
                          PS5
                        </SelectItem>

                        <SelectItem value="VR">
                          VR
                        </SelectItem>

                        <SelectItem value="Other">
                          Other
                        </SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                  <div>

                    <Label>
                      Package Type
                    </Label>

                    <Select
                      value={
                        newType
                      }
                      onValueChange={(
                        value,
                      ) =>
                        setNewType(
                          value as PricingPackageType,
                        )
                      }
                    >

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="Hourly">
                          Hourly
                        </SelectItem>

                        <SelectItem value="Night">
                          Night
                        </SelectItem>

                        <SelectItem value="Day">
                          Day
                        </SelectItem>

                        <SelectItem value="Custom">
                          Custom
                        </SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <Label>
                      Price
                    </Label>

                    <Input
                      type="number"
                      min="0"
                      value={
                        newPrice
                      }
                      onChange={(event) =>
                        setNewPrice(
                          event.target.value,
                        )
                      }
                    />

                  </div>

                  <div>

                    <Label>
                      Duration Hours
                    </Label>

                    <Input
                      type="number"
                      min="0"
                      value={
                        newDuration
                      }
                      onChange={(event) =>
                        setNewDuration(
                          event.target.value,
                        )
                      }
                    />

                  </div>

                </div>

                <Button
                  variant="hero"
                  disabled={
                    actionLoading ===
                    "create"
                  }
                  onClick={() =>
                    void createPlan()
                  }
                >

                  {actionLoading ===
                  "create" ? (

                    <Loader2 className="mr-2 size-4 animate-spin" />

                  ) : (

                    <Plus className="mr-2 size-4" />

                  )}

                  Create Package

                </Button>

              </div>

            </DialogContent>

          </Dialog>
        }
      />

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-3">

        <StatCard
          label="Total Packages"
          value={String(
            plans.length,
          )}
        />

        <StatCard
          label="Active Packages"
          value={String(
            activeCount,
          )}
        />

        <StatCard
          label="Night Packages"
          value={String(
            nightCount,
          )}
        />

      </div>

      {/* PLANS */}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">

        {loading ? (

          <div className="col-span-full flex justify-center py-16">

            <Loader2 className="size-7 animate-spin text-neon-cyan" />

          </div>

        ) : plans.map(
          (
            plan,
          ) => (

            <section
              key={
                plan._id
              }
              className="glass-static rounded-2xl p-5"
            >

              <div className="flex items-start justify-between gap-3">

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <Badge variant="outline">
                      {
                        plan.systemType
                      }
                    </Badge>

                    <Badge variant="outline">

                      {plan.packageType ===
                      "Night" ? (

                        <Moon className="mr-1 size-3" />

                      ) : plan.packageType ===
                        "Day" ? (

                        <Sun className="mr-1 size-3" />

                      ) : null}

                      {
                        plan.packageType
                      }

                    </Badge>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <span className="text-xs text-muted-foreground">
                    Active
                  </span>

                  <Switch
                    checked={
                      plan.active
                    }
                    onCheckedChange={(
                      checked,
                    ) =>
                      patchPlan(
                        plan._id,

                        "active",

                        checked,
                      )
                    }
                  />

                </div>

              </div>

              <div className="mt-5 grid gap-4">

                <div>

                  <Label>
                    Package Name
                  </Label>

                  <Input
                    value={
                      plan.name
                    }
                    onChange={(event) =>
                      patchPlan(
                        plan._id,

                        "name",

                        event.target.value,
                      )
                    }
                  />

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <Label>
                      System
                    </Label>

                    <Select
                      value={
                        plan.systemType
                      }
                      onValueChange={(
                        value,
                      ) =>
                        patchPlan(
                          plan._id,

                          "systemType",

                          value,
                        )
                      }
                    >

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="PC">
                          PC
                        </SelectItem>

                        <SelectItem value="PS5">
                          PS5
                        </SelectItem>

                        <SelectItem value="VR">
                          VR
                        </SelectItem>

                        <SelectItem value="Other">
                          Other
                        </SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                  <div>

                    <Label>
                      Type
                    </Label>

                    <Select
                      value={
                        plan.packageType
                      }
                      onValueChange={(
                        value,
                      ) =>
                        patchPlan(
                          plan._id,

                          "packageType",

                          value,
                        )
                      }
                    >

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="Hourly">
                          Hourly
                        </SelectItem>

                        <SelectItem value="Night">
                          Night
                        </SelectItem>

                        <SelectItem value="Day">
                          Day
                        </SelectItem>

                        <SelectItem value="Custom">
                          Custom
                        </SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <Label>
                      Price (Rs)
                    </Label>

                    <Input
                      type="number"
                      min="0"
                      value={
                        plan.price
                      }
                      onChange={(event) =>
                        patchPlan(
                          plan._id,

                          "price",

                          Number(
                            event.target.value,
                          ),
                        )
                      }
                    />

                  </div>

                  <div>

                    <Label>
                      Unit
                    </Label>

                    <Input
                      value={
                        plan.unit
                      }
                      onChange={(event) =>
                        patchPlan(
                          plan._id,

                          "unit",

                          event.target.value,
                        )
                      }
                      placeholder="/ hour"
                    />

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-3">

                  <div>

                    <Label>
                      Duration
                    </Label>

                    <Input
                      type="number"
                      min="0"
                      value={
                        plan.durationHours
                      }
                      onChange={(event) =>
                        patchPlan(
                          plan._id,

                          "durationHours",

                          Number(
                            event.target.value,
                          ),
                        )
                      }
                    />

                  </div>

                  <div>

                    <Label>
                      Start
                    </Label>

                    <Input
                      type="time"
                      value={
                        plan.startTime ||
                        ""
                      }
                      onChange={(event) =>
                        patchPlan(
                          plan._id,

                          "startTime",

                          event.target.value,
                        )
                      }
                    />

                  </div>

                  <div>

                    <Label>
                      End
                    </Label>

                    <Input
                      type="time"
                      value={
                        plan.endTime ||
                        ""
                      }
                      onChange={(event) =>
                        patchPlan(
                          plan._id,

                          "endTime",

                          event.target.value,
                        )
                      }
                    />

                  </div>

                </div>

                <div>

                  <Label>
                    Package Discount %
                  </Label>

                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      plan.discountPercent
                    }
                    onChange={(event) =>
                      patchPlan(
                        plan._id,

                        "discountPercent",

                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  />

                </div>

                <div>

                  <Label>
                    Description
                  </Label>

                  <Input
                    value={
                      plan.description ||
                      ""
                    }
                    onChange={(event) =>
                      patchPlan(
                        plan._id,

                        "description",

                        event.target.value,
                      )
                    }
                  />

                </div>

                <div>

                  <Label>
                    Perks
                  </Label>

                  <Input
                    value={
                      (
                        plan.perks ||
                        []
                      ).join(
                        " | ",
                      )
                    }
                    onChange={(event) =>
                      patchPlan(
                        plan._id,

                        "perks",

                        event.target.value
                          .split(
                            "|",
                          )
                          .map(
                            (
                              value,
                            ) =>
                              value.trim(),
                          )
                          .filter(
                            Boolean,
                          ),
                      )
                    }
                    placeholder="Free drink | Priority PC | 10% cafe discount"
                  />

                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Separate perks with |
                  </p>

                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-3">

                  <div>

                    <p className="text-sm font-medium">
                      Popular Package
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Shows Popular badge on website.
                    </p>

                  </div>

                  <Switch
                    checked={
                      plan.highlight
                    }
                    onCheckedChange={(
                      checked,
                    ) =>
                      patchPlan(
                        plan._id,

                        "highlight",

                        checked,
                      )
                    }
                  />

                </div>

                <div className="flex gap-2">

                  <Button
                    variant="hero"
                    className="flex-1"
                    disabled={
                      actionLoading ===
                      `save-${plan._id}`
                    }
                    onClick={() =>
                      void savePlan(
                        plan,
                      )
                    }
                  >

                    {actionLoading ===
                    `save-${plan._id}` ? (

                      <Loader2 className="mr-2 size-4 animate-spin" />

                    ) : (

                      <Save className="mr-2 size-4" />

                    )}

                    Save Package

                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-neon-red"
                    disabled={
                      actionLoading ===
                      `delete-${plan._id}`
                    }
                    onClick={() =>
                      void deletePlan(
                        plan,
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
    </>
  );
}