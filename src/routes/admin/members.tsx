import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  RefreshCcw,
  Save,
  Search,
  UserPlus,
  Users,
  Wallet,
  XCircle,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
  membershipApi,
  type Member,
  type MemberStats,
  type MembershipRequest,
  type MembershipTier,
} from "@/services/membershipApi";

/* =========================================================
   ROUTE
========================================================= */

const title =
  "Memberships | Nexus Arena Admin";

const description =
  "Manage membership requests, monthly plans, discounts, points and member rewards.";

export const Route =
  createFileRoute(
    "/admin/members",
  )({
    head: () => ({
      meta: [
        {
          title,
        },

        {
          name:
            "description",

          content:
            description,
        },
      ],
    }),

    component:
      MembersPage,
  });

/* =========================================================
   STATUS COLOR
========================================================= */

function statusTone(
  status?: string,
) {
  if (
    status === "Active" ||
    status === "Approved" ||
    status === "Paid"
  ) {
    return "border-neon-green/30 bg-neon-green/10 text-neon-green";
  }

  if (
    status === "Denied" ||
    status === "Expired"
  ) {
    return "border-neon-red/30 bg-neon-red/10 text-neon-red";
  }

  return "border-gold/30 bg-gold/10 text-gold";
}

/* =========================================================
   WHATSAPP
========================================================= */

function normalizeWhatsAppPhone(
  value = "",
) {
  let phone =
    value.replace(
      /\D/g,
      "",
    );

  if (
    phone.startsWith(
      "0092",
    )
  ) {
    phone =
      phone.substring(
        2,
      );
  }

  if (
    phone.startsWith(
      "0",
    )
  ) {
    phone =
      `92${phone.substring(
        1,
      )}`;
  }

  if (
    phone.length === 10 &&
    phone.startsWith("3")
  ) {
    phone =
      `92${phone}`;
  }

  return phone;
}

function openPaymentWhatsApp(
  request:
    MembershipRequest,
) {
  if (
    typeof request.memberId ===
    "string"
  ) {
    toast.error(
      "Member phone is not available",
    );

    return;
  }

  const member =
    request.memberId;

  const phone =
    normalizeWhatsAppPhone(
      member.phone,
    );

  if (!phone) {
    toast.error(
      "Member phone is not available",
    );

    return;
  }

  const tier =
    typeof request.tierId ===
    "string"
      ? null
      : request.tierId;

  const duration =
    Number(
      tier?.durationMonths ||
        1,
    );

  const message = [
    `Assalam-o-Alaikum ${member.name},`,

    "",

    `Your Nexus Arena ${request.tierName} Membership request has been received.`,

    "",

    `Membership Fee: Rs ${Number(
      request.tierPrice ||
        0,
    ).toLocaleString()}`,

    `Validity: ${duration} ${
      duration === 1
        ? "Month"
        : "Months"
    }`,

    "",

    "Kindly complete the payment and share the payment confirmation with us.",

    "",

    "After payment verification, your membership will be activated by Nexus Arena admin.",

    "",

    "Regards,",

    "Nexus Arena",
  ].join("\n");

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(
      message,
    )}`,

    "_blank",

    "noopener,noreferrer",
  );
}

/* =========================================================
   PAGE
========================================================= */

function MembersPage() {
  /* =======================================================
     MEMBERS
  ======================================================= */

  const [
    members,
    setMembers,
  ] =
    useState<Member[]>(
      [],
    );

  /* =======================================================
     TIERS
  ======================================================= */

  const [
    tiers,
    setTiers,
  ] =
    useState<
      MembershipTier[]
    >([]);

  /* =======================================================
     REQUESTS
  ======================================================= */

  const [
    requests,
    setRequests,
  ] =
    useState<
      MembershipRequest[]
    >([]);

  const [
    requestFilter,
    setRequestFilter,
  ] =
    useState(
      "Pending",
    );

  /* =======================================================
     STATS
  ======================================================= */

  const [
    stats,
    setStats,
  ] =
    useState<MemberStats>({
      totalMembers:
        0,

      vipMembers:
        0,

      pointsIssuedThisMonth:
        0,

      churnRisk:
        0,
    });

  /* =======================================================
     PAGE STATE
  ======================================================= */

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
    search,
    setSearch,
  ] =
    useState("");

  /* =======================================================
     MANUAL POINTS
  ======================================================= */

  const [
    pointAmounts,
    setPointAmounts,
  ] =
    useState<
      Record<
        string,
        string
      >
    >({});

  /* =======================================================
     CREATE MEMBER
  ======================================================= */

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    newName,
    setNewName,
  ] =
    useState("");

  const [
    newPhone,
    setNewPhone,
  ] =
    useState("");

  const [
    newEmail,
    setNewEmail,
  ] =
    useState("");

  const [
    newNotes,
    setNewNotes,
  ] =
    useState("");

  /* =======================================================
     LOAD EVERYTHING
  ======================================================= */

  async function loadAll() {
    try {
      setLoading(
        true,
      );

      const [
        memberResponse,
        tierResponse,
        statsResponse,
        requestResponse,
      ] =
        await Promise.all([
          membershipApi.getMembers({
            page:
              1,

            limit:
              500,
          }),

          membershipApi.getTiers(),

          membershipApi.getStats(),

          membershipApi.getRequests(
            requestFilter,
          ),
        ]);

      setMembers(
        Array.isArray(
          memberResponse.data,
        )
          ? memberResponse.data
          : [],
      );

      setTiers(
        Array.isArray(
          tierResponse.data,
        )
          ? tierResponse.data
          : [],
      );

      setStats(
        statsResponse.data,
      );

      setRequests(
        Array.isArray(
          requestResponse.data,
        )
          ? requestResponse.data
          : [],
      );
    } catch (error) {
      console.error(
        "Membership load error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load membership data",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(() => {
    void loadAll();
  }, [
    requestFilter,
  ]);

  /* =======================================================
     MEMBER SEARCH
  ======================================================= */

  const visibleMembers =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return members;
        }

        return members.filter(
          (member) =>
            member.name
              ?.toLowerCase()
              .includes(
                term,
              ) ||

            member.memberId
              ?.toLowerCase()
              .includes(
                term,
              ) ||

            member.phone
              ?.toLowerCase()
              .includes(
                term,
              ) ||

            member.email
              ?.toLowerCase()
              .includes(
                term,
              ),
        );
      },

      [
        members,
        search,
      ],
    );

  /* =======================================================
     UPDATE TIER LOCAL STATE
  ======================================================= */

  function setTierValue(
    tierId:
      string,

    key:
      keyof MembershipTier,

    value:
      unknown,
  ) {
    setTiers(
      (current) =>
        current.map(
          (tier) =>
            tier._id ===
            tierId
              ? {
                  ...tier,

                  [key]:
                    value,
                }
              : tier,
        ),
    );
  }

  /* =======================================================
     SAVE MEMBERSHIP PLAN
  ======================================================= */

  async function saveTier(
    tier:
      MembershipTier,
  ) {
    try {
      setActionLoading(
        `tier-${tier._id}`,
      );

      const response =
        await membershipApi.updateTier(
          tier._id,

          {
            name:
              tier.name,

            price:
              Number(
                tier.price ||
                  0,
              ),

            /*
             * MONTHLY VALIDITY
             */
            durationMonths:
              Math.max(
                Number(
                  tier.durationMonths ||
                    1,
                ),

                1,
              ),

            /*
             * Required played hours.
             */
            minHours:
              Math.max(
                Number(
                  tier.minHours ||
                    0,
                ),

                0,
              ),

            /*
             * Points earned per completed hour.
             */
            pointsPerHour:
              Math.max(
                Number(
                  tier.pointsPerHour ||
                    0,
                ),

                0,
              ),

            gamingDiscountPercent:
              Math.max(
                0,

                Math.min(
                  100,

                  Number(
                    tier.gamingDiscountPercent ||
                      0,
                  ),
                ),
              ),

            cafeDiscountPercent:
              Math.max(
                0,

                Math.min(
                  100,

                  Number(
                    tier.cafeDiscountPercent ||
                      0,
                  ),
                ),
              ),

            maxMembers:
              Math.max(
                Number(
                  tier.maxMembers ||
                    0,
                ),

                0,
              ),

            active:
              tier.active,

            sortOrder:
              Number(
                tier.sortOrder ||
                  0,
              ),
          },
        );

      toast.success(
        response.message ||
          `${tier.name} plan updated`,
      );

      await loadAll();
    } catch (error) {
      console.error(
        "Save tier:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save membership plan",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     WHATSAPP PAYMENT
  ======================================================= */

  function sendPaymentMessage(
    request:
      MembershipRequest,
  ) {
    openPaymentWhatsApp(
      request,
    );
  }

  /* =======================================================
     MARK PAID
  ======================================================= */

  async function markPaid(
    request:
      MembershipRequest,
  ) {
    try {
      setActionLoading(
        `paid-${request._id}`,
      );

      const response =
        await membershipApi.markRequestPaid(
          request._id,

          {
            paymentMethod:
              "Manual",

            paymentNote:
              "Payment confirmed by admin",
          },
        );

      toast.success(
        response.message ||
          "Payment marked as paid",
      );

      await loadAll();
    } catch (error) {
      console.error(
        "Mark paid:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to confirm payment",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     APPROVE
  ======================================================= */

  async function approve(
    request:
      MembershipRequest,
  ) {
    try {
      setActionLoading(
        `approve-${request._id}`,
      );

      const response =
        await membershipApi.approveRequest(
          request._id,

          "Membership approved by Nexus Arena admin",
        );

      toast.success(
        response.message ||
          "Membership activated",
      );

      await loadAll();
    } catch (error) {
      console.error(
        "Approve membership:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to approve membership",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     DENY
  ======================================================= */

  async function deny(
    request:
      MembershipRequest,
  ) {
    try {
      setActionLoading(
        `deny-${request._id}`,
      );

      const response =
        await membershipApi.denyRequest(
          request._id,

          "Membership request denied by Nexus Arena admin",
        );

      toast.success(
        response.message ||
          "Membership request denied",
      );

      await loadAll();
    } catch (error) {
      console.error(
        "Deny membership:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to deny membership",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     READ MANUAL POINT AMOUNT
  ======================================================= */

  function readPointAmount(
    memberId:
      string,
  ) {
    const value =
      Number(
        pointAmounts[
          memberId
        ],
      );

    /*
     * 1 is allowed.
     *
     * No 100 minimum.
     */

    if (
      !Number.isSafeInteger(
        value,
      ) ||
      value <
        1
    ) {
      toast.error(
        "Enter any whole number from 1 upward",
      );

      return null;
    }

    return value;
  }

  /* =======================================================
     ADD / DEDUCT POINTS
  ======================================================= */

  async function changePoints(
    member:
      Member,

    mode:
      "add" |
      "deduct",
  ) {
    const amount =
      readPointAmount(
        member._id,
      );

    if (
      amount ===
      null
    ) {
      return;
    }

    if (
      mode ===
        "deduct" &&
      amount >
        Number(
          member.points ||
            0,
        )
    ) {
      toast.error(
        `Member only has ${member.points} points`,
      );

      return;
    }

    const signedPoints =
      mode ===
      "add"
        ? amount
        : -amount;

    try {
      setActionLoading(
        `points-${member._id}`,
      );

      const response =
        await membershipApi.adjustPoints(
          member._id,

          {
            points:
              signedPoints,

            note:
              mode ===
              "add"
                ? `Admin added ${amount} points`
                : `Admin deducted ${amount} points`,
          },
        );

      toast.success(
        response.message,
      );

      setPointAmounts(
        (current) => ({
          ...current,

          [member._id]:
            "",
        }),
      );

      await loadAll();
    } catch (error) {
      console.error(
        "Point adjustment:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update points",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  /* =======================================================
     CREATE MEMBER
  ======================================================= */

  async function createMember() {
    if (
      !newName.trim()
    ) {
      toast.error(
        "Enter member name",
      );

      return;
    }

    if (
      !newPhone.trim()
    ) {
      toast.error(
        "Enter member phone",
      );

      return;
    }

    try {
      setCreating(
        true,
      );

      const response =
        await membershipApi.createMember({
          name:
            newName.trim(),

          phone:
            newPhone.trim(),

          email:
            newEmail.trim() ||
            undefined,

          notes:
            newNotes.trim() ||
            undefined,
        });

      toast.success(
        response.message ||
          "Member created",
      );

      setNewName(
        "",
      );

      setNewPhone(
        "",
      );

      setNewEmail(
        "",
      );

      setNewNotes(
        "",
      );

      setCreateOpen(
        false,
      );

      await loadAll();
    } catch (error) {
      console.error(
        "Create member:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create member",
      );
    } finally {
      setCreating(
        false,
      );
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <PageHeader
        eyebrow="Loyalty Program"
        title="Membership Control"
        subtitle="Manage membership requests, monthly charges, plan validity, discounts, point earning rates and member balances."
        action={
          <div className="flex flex-wrap gap-2">

            <Button
              variant="glass"
              onClick={() =>
                void loadAll()
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

                <Button
                  variant="hero"
                >

                  <UserPlus className="mr-2 size-4" />

                  Create Member

                </Button>

              </DialogTrigger>

              <DialogContent className="sm:max-w-md">

                <DialogHeader>

                  <DialogTitle>
                    Create Member
                  </DialogTitle>

                  <DialogDescription>
                    Add a manual or walk-in Nexus Arena member.
                  </DialogDescription>

                </DialogHeader>

                <div className="grid gap-4">

                  <div className="grid gap-1.5">

                    <Label>
                      Name
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
                      placeholder="Member name"
                    />

                  </div>

                  <div className="grid gap-1.5">

                    <Label>
                      Phone
                    </Label>

                    <Input
                      value={
                        newPhone
                      }
                      onChange={(event) =>
                        setNewPhone(
                          event.target.value,
                        )
                      }
                      placeholder="03XXXXXXXXX"
                    />

                  </div>

                  <div className="grid gap-1.5">

                    <Label>
                      Email
                    </Label>

                    <Input
                      type="email"
                      value={
                        newEmail
                      }
                      onChange={(event) =>
                        setNewEmail(
                          event.target.value,
                        )
                      }
                      placeholder="Optional"
                    />

                  </div>

                  <div className="grid gap-1.5">

                    <Label>
                      Notes
                    </Label>

                    <Input
                      value={
                        newNotes
                      }
                      onChange={(event) =>
                        setNewNotes(
                          event.target.value,
                        )
                      }
                      placeholder="Optional"
                    />

                  </div>

                  <Button
                    variant="hero"
                    disabled={
                      creating
                    }
                    onClick={() =>
                      void createMember()
                    }
                  >

                    {creating ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 size-4" />
                    )}

                    Create Member

                  </Button>

                </div>

              </DialogContent>

            </Dialog>

          </div>
        }
      />

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total Members"
          value={String(
            stats.totalMembers ||
              0,
          )}
        />

        <StatCard
          label="VIP Members"
          value={String(
            stats.vipMembers ||
              0,
          )}
        />

        <StatCard
          label="Points Issued"
          value={Number(
            stats.pointsIssuedThisMonth ||
              0,
          ).toLocaleString()}
        />

        <StatCard
          label="Requests"
          value={String(
            requests.length,
          )}
        />

      </div>

      {/* =================================================
          TABS
      ================================================= */}

      <Tabs
        defaultValue="requests"
        className="mt-6"
      >

        <TabsList className="grid w-full max-w-xl grid-cols-3">

          <TabsTrigger value="requests">
            Requests
          </TabsTrigger>

          <TabsTrigger value="plans">
            Plans
          </TabsTrigger>

          <TabsTrigger value="members">
            Members
          </TabsTrigger>

        </TabsList>

        {/* =================================================
            REQUESTS TAB
        ================================================= */}

        <TabsContent
          value="requests"
          className="mt-5"
        >

          <section className="glass-static rounded-2xl p-5">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>

                <p className="font-display text-[10px] tracking-[0.2em] text-primary uppercase">
                  Approval Queue
                </p>

                <h2 className="mt-1 font-display text-lg font-black">
                  Membership Requests
                </h2>

              </div>

              <div className="flex flex-wrap gap-2">

                {[
                  "Pending",
                  "Approved",
                  "Denied",
                  "all",
                ].map(
                  (
                    status,
                  ) => (

                    <Button
                      key={
                        status
                      }
                      size="sm"
                      variant={
                        requestFilter ===
                        status
                          ? "hero"
                          : "glass"
                      }
                      onClick={() =>
                        setRequestFilter(
                          status,
                        )
                      }
                    >
                      {status ===
                      "all"
                        ? "All"
                        : status}
                    </Button>

                  ),
                )}

              </div>

            </div>

            <div className="mt-5 grid gap-4">

              {loading ? (

                <div className="flex justify-center py-12">

                  <Loader2 className="size-6 animate-spin text-neon-cyan" />

                </div>

              ) : requests.length ? (

                requests.map(
                  (
                    request,
                  ) => {

                    const member =
                      typeof request.memberId ===
                      "string"
                        ? null
                        : request.memberId;

                    const tier =
                      typeof request.tierId ===
                      "string"
                        ? null
                        : request.tierId;

                    const busy =
                      Boolean(
                        actionLoading?.includes(
                          request._id,
                        ),
                      );

                    const months =
                      Number(
                        tier?.durationMonths ||
                          1,
                      );

                    return (

                      <div
                        key={
                          request._id
                        }
                        className="rounded-2xl border border-border bg-background/20 p-5"
                      >

                        <div className="flex flex-wrap items-start justify-between gap-5">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="font-display text-base font-black">
                                {member?.name ||
                                  "Member"}
                              </p>

                              <Badge
                                variant="outline"
                                className={statusTone(
                                  request.status,
                                )}
                              >
                                {
                                  request.status
                                }
                              </Badge>

                              <Badge
                                variant="outline"
                                className={statusTone(
                                  request.paymentStatus,
                                )}
                              >
                                Payment{" "}
                                {
                                  request.paymentStatus
                                }
                              </Badge>

                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">

                              {member?.memberId}

                              {member?.phone
                                ? ` · ${member.phone}`
                                : ""}

                            </p>

                            <div className="mt-4 grid gap-2 text-sm">

                              <div>
                                <span className="text-muted-foreground">
                                  Plan:
                                </span>{" "}

                                <strong className="text-neon-cyan">
                                  {
                                    request.tierName
                                  }
                                </strong>
                              </div>

                              <div>
                                <span className="text-muted-foreground">
                                  Charges:
                                </span>{" "}

                                <strong>
                                  Rs{" "}
                                  {Number(
                                    request.tierPrice ||
                                      0,
                                  ).toLocaleString()}
                                </strong>
                              </div>

                              <div>
                                <span className="text-muted-foreground">
                                  Validity:
                                </span>{" "}

                                <strong>
                                  {
                                    months
                                  }{" "}

                                  {
                                    months ===
                                    1
                                      ? "Month"
                                      : "Months"
                                  }
                                </strong>
                              </div>

                              {tier && (

                                <>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Gaming Discount:
                                    </span>{" "}

                                    <strong>
                                      {
                                        tier.gamingDiscountPercent
                                      }
                                      %
                                    </strong>
                                  </div>

                                  <div>
                                    <span className="text-muted-foreground">
                                      Points / Hour:
                                    </span>{" "}

                                    <strong>
                                      {
                                        tier.pointsPerHour
                                      }
                                    </strong>
                                  </div>
                                </>

                              )}

                            </div>

                            <p className="mt-3 text-[10px] text-muted-foreground">

                              Requested{" "}

                              {new Date(
                                request.requestedAt ||
                                  request.createdAt,
                              ).toLocaleString()}

                            </p>

                          </div>

                          {request.status ===
                            "Pending" && (

                            <div className="flex max-w-md flex-wrap gap-2">

                              <Button
                                variant="glass"
                                size="sm"
                                onClick={() =>
                                  sendPaymentMessage(
                                    request,
                                  )
                                }
                              >

                                <MessageCircle className="mr-2 size-4" />

                                WhatsApp Payment

                              </Button>

                              {request.paymentStatus !==
                                "Paid" && (

                                <Button
                                  variant="glass"
                                  size="sm"
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    void markPaid(
                                      request,
                                    )
                                  }
                                >

                                  <Wallet className="mr-2 size-4" />

                                  Mark Paid

                                </Button>

                              )}

                              <Button
                                variant="hero"
                                size="sm"
                                disabled={
                                  busy ||
                                  (
                                    Number(
                                      request.tierPrice ||
                                        0,
                                    ) >
                                      0 &&
                                    request.paymentStatus !==
                                      "Paid"
                                  )
                                }
                                onClick={() =>
                                  void approve(
                                    request,
                                  )
                                }
                              >

                                <CheckCircle2 className="mr-2 size-4" />

                                Approve & Activate

                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={
                                  busy
                                }
                                className="text-neon-red"
                                onClick={() =>
                                  void deny(
                                    request,
                                  )
                                }
                              >

                                <XCircle className="mr-2 size-4" />

                                Deny

                              </Button>

                            </div>

                          )}

                        </div>

                      </div>

                    );
                  },
                )

              ) : (

                <div className="rounded-xl border border-dashed border-border p-10 text-center">

                  <p className="text-sm text-muted-foreground">
                    No membership requests found.
                  </p>

                </div>

              )}

            </div>

          </section>

        </TabsContent>

        {/* =================================================
            PLANS TAB
        ================================================= */}

        <TabsContent
          value="plans"
          className="mt-5"
        >

          <div className="grid gap-5 xl:grid-cols-3">

            {tiers.map(
              (
                tier,
              ) => (

                <section
                  key={
                    tier._id
                  }
                  className="glass-static rounded-2xl p-5"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <p className="font-display text-[10px] tracking-[0.18em] text-primary uppercase">
                        Membership Plan
                      </p>

                      <h2 className="mt-1 font-display text-xl font-black">
                        {
                          tier.name
                        }
                      </h2>

                    </div>

                    <div className="flex items-center gap-2">

                      <span className="text-[10px] text-muted-foreground">
                        Active
                      </span>

                      <Switch
                        checked={
                          tier.active
                        }
                        onCheckedChange={(
                          value,
                        ) =>
                          setTierValue(
                            tier._id,

                            "active",

                            value,
                          )
                        }
                      />

                    </div>

                  </div>

                  <div className="mt-5 grid gap-4">

                    {/* PRICE */}

                    <div className="grid gap-1.5">

                      <Label>
                        Membership Charges
                      </Label>

                      <div className="relative">

                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            tier.price
                          }
                          onChange={(
                            event,
                          ) =>
                            setTierValue(
                              tier._id,

                              "price",

                              Number(
                                event.target.value,
                              ),
                            )
                          }
                        />

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          Rs
                        </span>

                      </div>

                      <p className="text-[10px] text-muted-foreground">
                        Amount customer pays for each membership period.
                      </p>

                    </div>

                    {/* MONTHLY VALIDITY */}

                    <div className="grid gap-1.5">

                      <Label>
                        Membership Validity
                      </Label>

                      <div className="relative">

                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={
                            tier.durationMonths ||
                            1
                          }
                          onChange={(
                            event,
                          ) =>
                            setTierValue(
                              tier._id,

                              "durationMonths",

                              Math.max(
                                1,

                                Number(
                                  event.target.value,
                                ) ||
                                  1,
                              ),
                            )
                          }
                        />

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          Months
                        </span>

                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">

                        <Clock3 className="size-3" />

                        1 = Monthly, 3 = Quarterly, 12 = Yearly

                      </div>

                    </div>

                    {/* GAMING DISCOUNT */}

                    <div className="grid gap-1.5">

                      <Label>
                        Gaming Discount
                      </Label>

                      <div className="relative">

                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={
                            tier.gamingDiscountPercent
                          }
                          onChange={(
                            event,
                          ) =>
                            setTierValue(
                              tier._id,

                              "gamingDiscountPercent",

                              Number(
                                event.target.value,
                              ),
                            )
                          }
                        />

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>

                      </div>

                    </div>

                    {/* CAFE DISCOUNT */}

                    <div className="grid gap-1.5">

                      <Label>
                        Cafe Discount
                      </Label>

                      <div className="relative">

                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={
                            tier.cafeDiscountPercent
                          }
                          onChange={(
                            event,
                          ) =>
                            setTierValue(
                              tier._id,

                              "cafeDiscountPercent",

                              Number(
                                event.target.value,
                              ),
                            )
                          }
                        />

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>

                      </div>

                    </div>

                    {/* POINTS PER HOUR */}

                    <div className="grid gap-1.5">

                      <Label>
                        Points Per Completed Gaming Hour
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          tier.pointsPerHour
                        }
                        onChange={(
                          event,
                        ) =>
                          setTierValue(
                            tier._id,

                            "pointsPerHour",

                            Math.max(
                              0,

                              Number(
                                event.target.value,
                              ) ||
                                0,
                            ),
                          )
                        }
                      />

                      <p className="text-[10px] text-muted-foreground">
                        Example: 20 means a 3-hour completed booking earns 60 points.
                      </p>

                    </div>

                    {/* REQUIRED HOURS */}

                    <div className="grid gap-1.5">

                      <Label>
                        Required Gaming Hours
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          tier.minHours
                        }
                        onChange={(
                          event,
                        ) =>
                          setTierValue(
                            tier._id,

                            "minHours",

                            Math.max(
                              0,

                              Number(
                                event.target.value,
                              ) ||
                                0,
                            ),
                          )
                        }
                      />

                    </div>

                    {/* CAPACITY */}

                    <div className="grid gap-1.5">

                      <Label>
                        Maximum Active Members
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          tier.maxMembers
                        }
                        onChange={(
                          event,
                        ) =>
                          setTierValue(
                            tier._id,

                            "maxMembers",

                            Math.max(
                              0,

                              Number(
                                event.target.value,
                              ) ||
                                0,
                            ),
                          )
                        }
                      />

                      <p className="text-[10px] text-muted-foreground">
                        0 = no membership capacity limit.
                      </p>

                    </div>

                    {/* SUMMARY */}

                    <div className="rounded-xl border border-border bg-background/20 p-4">

                      <p className="font-display text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                        Plan Preview
                      </p>

                      <div className="mt-3 grid gap-1.5 text-xs">

                        <p>
                          Charges:{" "}

                          <strong>
                            Rs{" "}
                            {Number(
                              tier.price ||
                                0,
                            ).toLocaleString()}
                          </strong>
                        </p>

                        <p>
                          Validity:{" "}

                          <strong>
                            {
                              tier.durationMonths ||
                              1
                            }{" "}

                            {(tier.durationMonths ||
                              1) ===
                            1
                              ? "Month"
                              : "Months"}
                          </strong>
                        </p>

                        <p>
                          Gaming:{" "}

                          <strong>
                            {
                              tier.gamingDiscountPercent
                            }
                            % OFF
                          </strong>
                        </p>

                        <p>
                          Cafe:{" "}

                          <strong>
                            {
                              tier.cafeDiscountPercent
                            }
                            % OFF
                          </strong>
                        </p>

                        <p>
                          Earning:{" "}

                          <strong>
                            {
                              tier.pointsPerHour
                            }{" "}
                            points/hour
                          </strong>
                        </p>

                      </div>

                    </div>

                    {/* SAVE */}

                    <Button
                      variant="hero"
                      disabled={
                        actionLoading ===
                        `tier-${tier._id}`
                      }
                      onClick={() =>
                        void saveTier(
                          tier,
                        )
                      }
                    >

                      {actionLoading ===
                      `tier-${tier._id}` ? (

                        <Loader2 className="mr-2 size-4 animate-spin" />

                      ) : (

                        <Save className="mr-2 size-4" />

                      )}

                      Save{" "}
                      {
                        tier.name
                      }{" "}
                      Plan

                    </Button>

                  </div>

                </section>

              ),
            )}

          </div>

        </TabsContent>

        {/* =================================================
            MEMBERS TAB
        ================================================= */}

        <TabsContent
          value="members"
          className="mt-5"
        >

          <section className="glass-static rounded-2xl p-5">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>

                <p className="font-display text-[10px] tracking-[0.18em] text-primary uppercase">
                  Member Directory
                </p>

                <h2 className="mt-1 font-display text-lg font-black">
                  Members & Manual Points
                </h2>

              </div>

              <div className="relative w-full max-w-md">

                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={
                    search
                  }
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search member..."
                  className="pl-9"
                />

              </div>

            </div>

            <div className="mt-5 grid gap-3">

              {visibleMembers.map(
                (
                  member,
                ) => {

                  const busy =
                    actionLoading ===
                    `points-${member._id}`;

                  return (

                    <div
                      key={
                        member._id
                      }
                      className="rounded-2xl border border-border bg-background/20 p-4"
                    >

                      <div className="flex flex-wrap items-start justify-between gap-5">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <Users className="size-4 text-neon-cyan" />

                            <p className="font-semibold">
                              {
                                member.name
                              }
                            </p>

                            <Badge
                              variant="outline"
                              className={statusTone(
                                member.membershipStatus,
                              )}
                            >
                              {
                                member.membershipStatus
                              }
                            </Badge>

                          </div>

                          <p className="mt-1 text-xs text-muted-foreground">

                            {
                              member.memberId
                            }

                            {" · "}

                            {
                              member.phone
                            }

                          </p>

                          <div className="mt-3 flex flex-wrap gap-5 text-xs">

                            <span>
                              Points:{" "}

                              <strong className="text-gradient">
                                {Number(
                                  member.points ||
                                    0,
                                ).toLocaleString()}
                              </strong>
                            </span>

                            <span>
                              Played:{" "}

                              <strong>
                                {
                                  member.hoursPlayed ||
                                  0
                                }{" "}
                                hrs
                              </strong>
                            </span>

                            <span>
                              Membership:{" "}

                              <strong>
                                {
                                  member.membershipTierName ||
                                  "None"
                                }
                              </strong>
                            </span>

                          </div>

                          {member.membershipExpiresAt && (

                            <p className="mt-2 text-[10px] text-muted-foreground">

                              Valid until:{" "}

                              <strong>
                                {new Date(
                                  member.membershipExpiresAt,
                                ).toLocaleDateString()}
                              </strong>

                            </p>

                          )}

                        </div>

                        {/* MANUAL POINT CONTROL */}

                        <div className="w-full sm:w-auto sm:min-w-[330px]">

                          <Label className="text-[10px] text-muted-foreground">
                            Manual Points
                          </Label>

                          <div className="mt-2 flex gap-2">

                            <Input
                              type="number"
                              min="1"
                              step="1"
                              placeholder="1, 10, 57, 500, 5000..."
                              value={
                                pointAmounts[
                                  member._id
                                ] ||
                                ""
                              }
                              onChange={(event) =>
                                setPointAmounts(
                                  (current) => ({
                                    ...current,

                                    [member._id]:
                                      event.target.value,
                                  }),
                                )
                              }
                            />

                            <Button
                              variant="hero"
                              size="icon"
                              disabled={
                                busy
                              }
                              title="Add points"
                              onClick={() =>
                                void changePoints(
                                  member,

                                  "add",
                                )
                              }
                            >

                              {busy ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Plus className="size-4" />
                              )}

                            </Button>

                            <Button
                              variant="glass"
                              size="icon"
                              disabled={
                                busy
                              }
                              title="Deduct points"
                              onClick={() =>
                                void changePoints(
                                  member,

                                  "deduct",
                                )
                              }
                            >

                              <Minus className="size-4" />

                            </Button>

                          </div>

                          <p className="mt-1.5 text-[9px] text-muted-foreground">
                            Any whole number from 1 upward is allowed. There is no 100-point minimum.
                          </p>

                        </div>

                      </div>

                    </div>

                  );
                },
              )}

              {!visibleMembers.length && (

                <div className="rounded-xl border border-dashed border-border p-10 text-center">

                  <p className="text-sm text-muted-foreground">
                    No members found.
                  </p>

                </div>

              )}

            </div>

          </section>

        </TabsContent>

      </Tabs>
    </>
  );
}