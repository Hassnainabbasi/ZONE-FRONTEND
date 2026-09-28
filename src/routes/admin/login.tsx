import {
  useEffect,
  useState,
} from "react";

import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  Eye,
  EyeOff,
  Gamepad2,
  Loader2,
  LockKeyhole,
  ShieldCheck,
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

export const Route =
  createFileRoute(
    "/admin/login",
  )({
    component:
      AdminLoginPage,
  });

function AdminLoginPage() {
  const navigate =
    useNavigate();

  const {
    user,
    loading,
    login,
    logout,
  } = useAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  useEffect(() => {
    if (
      !loading &&
      user?.role ===
        "Admin"
    ) {
      void navigate({
        to: "/admin",
      });
    }
  }, [
    loading,
    user,
    navigate,
  ]);

  async function handleLogin() {
    if (
      !email.trim() ||
      !password
    ) {
      toast.error(
        "Enter admin email and password",
      );

      return;
    }

    try {
      setSubmitting(true);

      const loggedUser =
        await login({
          login:
            email.trim(),

          password,
        });

      if (
        loggedUser.role !==
        "Admin"
      ) {
        await logout();

        toast.error(
          "This account does not have admin access",
        );

        return;
      }

      toast.success(
        "Admin login successful",
      );

      await navigate({
        to: "/admin",
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Admin login failed",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">

        <Loader2 className="size-7 animate-spin text-neon-cyan" />

      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">

      {/* GLOW */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[10%] top-[10%] size-[450px] rounded-full bg-primary/10 blur-[150px]" />

        <div className="absolute bottom-[10%] right-[10%] size-[450px] rounded-full bg-secondary/10 blur-[150px]" />

      </div>

      {/* LOGIN CARD */}

      <div className="glass-static relative z-10 w-full max-w-md rounded-3xl border border-border p-7 shadow-2xl">

        <div className="text-center">

          <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10">

            <Gamepad2 className="size-7 text-neon-cyan" />

          </div>

          <p className="mt-5 font-display text-[10px] tracking-[0.28em] text-primary uppercase">
            Arcadium
          </p>

          <h1 className="mt-2 font-display text-3xl font-black">
            Admin Control
          </h1>

          <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-neon-green/20 bg-neon-green/5 px-3 py-1.5">

            <ShieldCheck className="size-3.5 text-neon-green" />

            <span className="text-[10px] text-neon-green">
              Authorized Access Only
            </span>

          </div>

        </div>

        {/* FORM */}

        <div className="mt-8 space-y-5">

          <div>

            <label className="mb-2 block font-display text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Admin Email
            </label>

            <Input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="admin@example.com"
              autoComplete="username"
              className="h-12"
            />

          </div>

          <div>

            <label className="mb-2 block font-display text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Password
            </label>

            <div className="relative">

              <Input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="Enter admin password"
                autoComplete="current-password"
                className="h-12 pr-11"
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    void handleLogin();
                  }
                }}
              />

              <button
                type="button"
                aria-label="Toggle password"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current,
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

          </div>

        </div>

        <Button
          variant="hero"
          size="xl"
          className="mt-7 w-full"
          disabled={submitting}
          onClick={() =>
            void handleLogin()
          }
        >

          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />

              Signing In...
            </>
          ) : (
            <>
              <LockKeyhole className="mr-2 size-4" />

              Login to Admin
            </>
          )}

        </Button>

        <p className="mt-5 text-center text-[10px] text-muted-foreground">
          Arcadium secure administration portal
        </p>

      </div>

    </main>
  );
}