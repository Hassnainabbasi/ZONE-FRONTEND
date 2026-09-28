import {
  useEffect,
  useState,
} from "react";

import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  Loader2,
  UserPlus,
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
  useAuth,
} from "@/context/auth-context";

const title =
  "Create Account | Battle Hub";

const description =
  "Create your Battle Hub customer account for memberships, loyalty points, booking history and gaming rewards.";

export const Route =
  createFileRoute(
    "/signup",
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
      SignupPage,
  });

function SignupPage() {
  const navigate =
    useNavigate();

  const {
    user,
    loading:
      authLoading,
    signup,
  } = useAuth();

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  /* =======================================================
     ALREADY LOGGED IN
  ======================================================= */

  useEffect(() => {
    if (
      !authLoading &&
      user
    ) {
      void navigate({
        to: "/",
      });
    }
  }, [
    authLoading,
    user,
    navigate,
  ]);

  /* =======================================================
     SIGNUP
  ======================================================= */

  async function handleSignup() {
    if (
      !name.trim()
    ) {
      toast.error(
        "Enter your full name",
      );

      return;
    }

    if (
      !email.trim()
    ) {
      toast.error(
        "Enter your email address",
      );

      return;
    }

    if (
      !phone.trim()
    ) {
      toast.error(
        "Enter your phone number",
      );

      return;
    }

    if (
      password.length <
      6
    ) {
      toast.error(
        "Password must be at least 6 characters",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      toast.error(
        "Passwords do not match",
      );

      return;
    }

    try {
      setSubmitting(
        true,
      );

      const created =
        await signup({
          name:
            name.trim(),

          email:
            email.trim(),

          phone:
            phone.trim(),

          password,
        });

      toast.success(
        `Welcome to Battle Hub, ${created.name}`,
      );

      await navigate({
        to: "/",
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create account",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">

        <Loader2 className="size-7 animate-spin text-neon-cyan" />

      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-1/4 top-1/4 size-[420px] rounded-full bg-primary/10 blur-[130px]" />

        <div className="absolute bottom-1/4 right-1/4 size-[360px] rounded-full bg-secondary/10 blur-[120px]" />

      </div>

      {/* CARD */}

      <div className="glass relative z-10 w-full max-w-lg rounded-3xl p-6 sm:p-8">

        <div className="text-center">

          <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10">

            <UserPlus className="size-6 text-neon-cyan" />

          </div>

          <p className="mt-5 font-display text-[10px] tracking-[0.28em] text-primary uppercase">
            Battle Hub Account
          </p>

          <h1 className="mt-2 font-display text-3xl font-black">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your account keeps your membership, loyalty points, gaming hours and booking history together.
          </p>

        </div>

        {/* FORM */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">

          <div className="sm:col-span-2">

            <label className="mb-2 block font-display text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Full Name
            </label>

            <Input
              value={
                name
              }
              onChange={(event) =>
                setName(
                  event.target
                    .value,
                )
              }
              placeholder="Your full name"
              autoComplete="name"
            />

          </div>

          <div>

            <label className="mb-2 block font-display text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Email
            </label>

            <Input
              type="email"
              value={
                email
              }
              onChange={(event) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              placeholder="Email address"
              autoComplete="email"
            />

          </div>

          <div>

            <label className="mb-2 block font-display text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Phone
            </label>

            <Input
              value={
                phone
              }
              onChange={(event) =>
                setPhone(
                  event.target
                    .value,
                )
              }
              placeholder="03XX XXXXXXX"
              autoComplete="tel"
            />

          </div>

          <div>

            <label className="mb-2 block font-display text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Password
            </label>

            <Input
              type="password"
              value={
                password
              }
              onChange={(event) =>
                setPassword(
                  event.target
                    .value,
                )
              }
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />

          </div>

          <div>

            <label className="mb-2 block font-display text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Confirm Password
            </label>

            <Input
              type="password"
              value={
                confirmPassword
              }
              onChange={(event) =>
                setConfirmPassword(
                  event.target
                    .value,
                )
              }
              placeholder="Repeat password"
              autoComplete="new-password"
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  void handleSignup();
                }
              }}
            />

          </div>

        </div>

        <Button
          variant="hero"
          size="xl"
          className="mt-6 w-full"
          disabled={
            submitting
          }
          onClick={
            handleSignup
          }
        >

          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />

              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 size-4" />

              Create Battle Hub Account
            </>
          )}

        </Button>

        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          By creating an account, your gaming activity can be linked to your loyalty profile.
        </p>

        <div className="mt-6 border-t border-border pt-5 text-center">

          <p className="text-sm text-muted-foreground">
            Already have an account?
          </p>

          <Link
            to="/login"
            className="mt-2 inline-block font-display text-xs font-bold tracking-[0.14em] text-neon-cyan uppercase hover:underline"
          >
            Login
          </Link>

        </div>

        <div className="mt-5 text-center">

          <Link
            to="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to Battle Hub
          </Link>

        </div>

      </div>

    </main>
  );
}