import {
  useEffect,
  useState,
} from "react";

import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Plus,
  Save,
  ShieldCheck,
  UserPlus,
  Users,
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
  Label,
} from "@/components/ui/label";

import {
  Switch,
} from "@/components/ui/switch";

import {
  Badge,
} from "@/components/ui/badge";

import {
  PageHeader,
} from "@/components/admin/AdminShell";

import {
  adminApi,
  type AdminUser,
} from "@/services/adminApi";

export const Route =
  createFileRoute(
    "/admin/setting",
  )({
    component:
      SettingsPage,
  });

function SettingsPage() {
  /* =======================================================
     STORE SETTINGS
  ======================================================= */

  const [
    zoneName,
    setZoneName,
  ] =
    useState(
      "Cyber Xtream",
    );

  const [
    city,
    setCity,
  ] =
    useState(
      "Karachi",
    );

  const [
    openingTime,
    setOpeningTime,
  ] =
    useState(
      "12:00",
    );

  const [
    closingTime,
    setClosingTime,
  ] =
    useState(
      "06:00",
    );

  const [
    supportPhone,
    setSupportPhone,
  ] =
    useState(
      "+92 300 0000000",
    );

  const [
    taxRate,
    setTaxRate,
  ] =
    useState(
      "5",
    );

  /* =======================================================
     PAYMENT CHANNELS
  ======================================================= */

  const [
    easypaisa,
    setEasypaisa,
  ] =
    useState(true);

  const [
    jazzcash,
    setJazzcash,
  ] =
    useState(true);

  const [
    card,
    setCard,
  ] =
    useState(true);

  const [
    cash,
    setCash,
  ] =
    useState(true);

  /* =======================================================
     CREATE ADMIN
  ======================================================= */

  const [
    adminName,
    setAdminName,
  ] =
    useState("");

  const [
    adminEmail,
    setAdminEmail,
  ] =
    useState("");

  const [
    adminPhone,
    setAdminPhone,
  ] =
    useState("");

  const [
    adminPassword,
    setAdminPassword,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    creatingAdmin,
    setCreatingAdmin,
  ] =
    useState(false);

  /* =======================================================
     ADMIN LIST
  ======================================================= */

  const [
    admins,
    setAdmins,
  ] =
    useState<
      AdminUser[]
    >([]);

  const [
    adminsLoading,
    setAdminsLoading,
  ] =
    useState(true);

  /* =======================================================
     LOAD ADMINS
  ======================================================= */

  async function loadAdmins() {
    try {
      setAdminsLoading(
        true,
      );

      const response =
        await adminApi.listAdmins();

      setAdmins(
        Array.isArray(
          response.data,
        )
          ? response.data
          : [],
      );
    } catch (error) {
      console.error(
        "Load admins:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load admins",
      );
    } finally {
      setAdminsLoading(
        false,
      );
    }
  }

  useEffect(() => {
    void loadAdmins();
  }, []);

  /* =======================================================
     SAVE GENERAL SETTINGS
  ======================================================= */

  function saveSettings() {
    /*
     * At the moment these are frontend values.
     * Later these can connect to your BookingConfig API.
     */

    console.log({
      zoneName,
      city,
      openingTime,
      closingTime,
      supportPhone,
      taxRate,

      paymentChannels: {
        easypaisa,
        jazzcash,
        card,
        cash,
      },
    });

    toast.success(
      "Settings saved",
    );
  }

  /* =======================================================
     CREATE ADMIN
  ======================================================= */

  async function handleCreateAdmin() {
    if (
      !adminName.trim()
    ) {
      toast.error(
        "Enter admin name",
      );

      return;
    }

    if (
      !adminEmail.trim()
    ) {
      toast.error(
        "Enter admin email",
      );

      return;
    }

    if (
      !adminPhone.trim()
    ) {
      toast.error(
        "Enter admin phone",
      );

      return;
    }

    if (
      !adminPassword
    ) {
      toast.error(
        "Enter admin password",
      );

      return;
    }

    if (
      adminPassword.length <
      6
    ) {
      toast.error(
        "Admin password must be at least 6 characters",
      );

      return;
    }

    try {
      setCreatingAdmin(
        true,
      );

      const response =
        await adminApi.createAdmin({
          name:
            adminName.trim(),

          email:
            adminEmail
              .trim()
              .toLowerCase(),

          phone:
            adminPhone.trim(),

          password:
            adminPassword,
        });

      toast.success(
        response.message ||
          "Admin created successfully",
      );

      setAdminName(
        "",
      );

      setAdminEmail(
        "",
      );

      setAdminPhone(
        "",
      );

      setAdminPassword(
        "",
      );

      await loadAdmins();
    } catch (error) {
      console.error(
        "Create admin:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create admin",
      );
    } finally {
      setCreatingAdmin(
        false,
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="System & Rate Settings"
        subtitle="Configure store settings, payment channels and administrator access."
      />

      <div className="grid gap-5 xl:grid-cols-2">

        {/* =================================================
            STORE PROFILE
        ================================================= */}

        <section className="glass-static rounded-2xl p-5">

          <div className="flex items-center gap-3">

            <div className="grid size-10 place-items-center rounded-xl bg-primary/10">

              <Save className="size-4 text-neon-cyan" />

            </div>

            <div>

              <p className="font-display text-[10px] tracking-[0.18em] text-primary uppercase">
                General
              </p>

              <h2 className="font-display text-sm font-bold tracking-[0.14em] uppercase">
                Store Profile
              </h2>

            </div>

          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <label className="grid gap-1.5">

              <Label className="text-xs text-muted-foreground">
                Zone name
              </Label>

              <Input
                value={
                  zoneName
                }
                onChange={(event) =>
                  setZoneName(
                    event.target
                      .value,
                  )
                }
              />

            </label>

            <label className="grid gap-1.5">

              <Label className="text-xs text-muted-foreground">
                City
              </Label>

              <Input
                value={
                  city
                }
                onChange={(event) =>
                  setCity(
                    event.target
                      .value,
                  )
                }
              />

            </label>

            <label className="grid gap-1.5">

              <Label className="text-xs text-muted-foreground">
                Opening time
              </Label>

              <Input
                type="time"
                value={
                  openingTime
                }
                onChange={(event) =>
                  setOpeningTime(
                    event.target
                      .value,
                  )
                }
              />

            </label>

            <label className="grid gap-1.5">

              <Label className="text-xs text-muted-foreground">
                Closing time
              </Label>

              <Input
                type="time"
                value={
                  closingTime
                }
                onChange={(event) =>
                  setClosingTime(
                    event.target
                      .value,
                  )
                }
              />

            </label>

            <label className="grid gap-1.5">

              <Label className="text-xs text-muted-foreground">
                Support phone
              </Label>

              <Input
                value={
                  supportPhone
                }
                onChange={(event) =>
                  setSupportPhone(
                    event.target
                      .value,
                  )
                }
              />

            </label>

            <label className="grid gap-1.5">

              <Label className="text-xs text-muted-foreground">
                Tax rate (%)
              </Label>

              <Input
                type="number"
                min="0"
                value={
                  taxRate
                }
                onChange={(event) =>
                  setTaxRate(
                    event.target
                      .value,
                  )
                }
              />

            </label>

          </div>

          <Button
            variant="hero"
            className="mt-5"
            onClick={
              saveSettings
            }
          >
            <Save className="mr-2 size-4" />

            Save Settings
          </Button>

        </section>

        {/* =================================================
            PAYMENT CHANNELS
        ================================================= */}

        <section className="glass-static rounded-2xl p-5">

          <h2 className="font-display text-sm font-bold tracking-[0.14em] uppercase">
            Payment Channels
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Control which payment methods customers can use.
          </p>

          <div className="mt-5 grid gap-4">

            <div className="flex items-center justify-between border-b border-border pb-3 text-sm">

              <span>
                Easypaisa QR
              </span>

              <Switch
                checked={
                  easypaisa
                }
                onCheckedChange={
                  setEasypaisa
                }
              />

            </div>

            <div className="flex items-center justify-between border-b border-border pb-3 text-sm">

              <span>
                JazzCash
              </span>

              <Switch
                checked={
                  jazzcash
                }
                onCheckedChange={
                  setJazzcash
                }
              />

            </div>

            <div className="flex items-center justify-between border-b border-border pb-3 text-sm">

              <span>
                Debit / Credit Card
              </span>

              <Switch
                checked={
                  card
                }
                onCheckedChange={
                  setCard
                }
              />

            </div>

            <div className="flex items-center justify-between border-b border-border pb-3 text-sm">

              <span>
                Cash at Counter
              </span>

              <Switch
                checked={
                  cash
                }
                onCheckedChange={
                  setCash
                }
              />

            </div>

          </div>

        </section>

        {/* =================================================
            CREATE ADMIN
        ================================================= */}

        <section className="glass-static rounded-2xl p-5">

          <div className="flex items-center gap-3">

            <div className="grid size-10 place-items-center rounded-xl bg-secondary/10">

              <UserPlus className="size-4 text-secondary" />

            </div>

            <div>

              <p className="font-display text-[10px] tracking-[0.18em] text-secondary uppercase">
                Access Control
              </p>

              <h2 className="font-display text-sm font-bold tracking-[0.14em] uppercase">
                Create Admin
              </h2>

            </div>

          </div>

          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Create another administrator account. This user will have access to the Cyber Xtream admin panel.
          </p>

          <div className="mt-5 grid gap-4">

            <label className="grid gap-1.5">

              <Label className="text-xs text-muted-foreground">
                Full Name
              </Label>

              <Input
                value={
                  adminName
                }
                onChange={(event) =>
                  setAdminName(
                    event.target
                      .value,
                  )
                }
                placeholder="Admin name"
              />

            </label>

            <label className="grid gap-1.5">

              <Label className="text-xs text-muted-foreground">
                Email
              </Label>

              <Input
                type="email"
                value={
                  adminEmail
                }
                onChange={(event) =>
                  setAdminEmail(
                    event.target
                      .value,
                  )
                }
                placeholder="admin@example.com"
              />

            </label>

            <label className="grid gap-1.5">

              <Label className="text-xs text-muted-foreground">
                Phone
              </Label>

              <Input
                value={
                  adminPhone
                }
                onChange={(event) =>
                  setAdminPhone(
                    event.target
                      .value,
                  )
                }
                placeholder="03XXXXXXXXX"
              />

            </label>

            <label className="grid gap-1.5">

              <Label className="text-xs text-muted-foreground">
                Password
              </Label>

              <div className="relative">

                <Input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    adminPassword
                  }
                  onChange={(event) =>
                    setAdminPassword(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Minimum 6 characters"
                  className="pr-11"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) =>
                        !value,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-neon-cyan"
                >

                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}

                </button>

              </div>

            </label>

          </div>

          <Button
            variant="hero"
            className="mt-5 w-full"
            disabled={
              creatingAdmin
            }
            onClick={() =>
              void handleCreateAdmin()
            }
          >

            {creatingAdmin ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />

                Creating Admin...
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />

                Create Admin Account
              </>
            )}

          </Button>

        </section>

        {/* =================================================
            ADMIN LIST
        ================================================= */}

        <section className="glass-static rounded-2xl p-5">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="grid size-10 place-items-center rounded-xl bg-neon-green/10">

                <ShieldCheck className="size-4 text-neon-green" />

              </div>

              <div>

                <p className="font-display text-[10px] tracking-[0.18em] text-neon-green uppercase">
                  Security
                </p>

                <h2 className="font-display text-sm font-bold tracking-[0.14em] uppercase">
                  Administrators
                </h2>

              </div>

            </div>

            <Badge
              variant="outline"
            >
              {admins.length} Admin
              {admins.length ===
              1
                ? ""
                : "s"}
            </Badge>

          </div>

          <div className="mt-5">

            {adminsLoading ? (

              <div className="flex justify-center py-10">

                <Loader2 className="size-5 animate-spin text-neon-cyan" />

              </div>

            ) : admins.length ? (

              <div className="grid gap-3">

                {admins.map(
                  (admin) => (

                    <div
                      key={
                        admin._id
                      }
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/20 p-4"
                    >

                      <div className="flex items-center gap-3">

                        <div className="grid size-10 place-items-center rounded-xl bg-primary/10">

                          <Users className="size-4 text-neon-cyan" />

                        </div>

                        <div>

                          <p className="text-sm font-medium">
                            {admin.name}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {admin.email}
                          </p>

                          <p className="text-[10px] text-muted-foreground">
                            {admin.phone}
                          </p>

                        </div>

                      </div>

                      <div className="text-right">

                        <Badge
                          variant="outline"
                          className={
                            admin.active
                              ? "border-neon-green/30 bg-neon-green/10 text-neon-green"
                              : ""
                          }
                        >
                          {admin.active
                            ? "Active"
                            : "Inactive"}
                        </Badge>

                        <p className="mt-2 font-display text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
                          Administrator
                        </p>

                      </div>

                    </div>

                  ),
                )}

              </div>

            ) : (

              <div className="rounded-xl border border-dashed border-border p-8 text-center">

                <LockKeyhole className="mx-auto size-5 text-muted-foreground" />

                <p className="mt-3 text-sm text-muted-foreground">
                  No admin users found.
                </p>

              </div>

            )}

          </div>

        </section>

      </div>
    </>
  );
}