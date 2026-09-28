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
  Eye,
  EyeOff,
  Gamepad2,
  Loader2,
  LockKeyhole,
  LogIn,
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
  "Login | Arcadium";

const description =
  "Login to your Arcadium account to access membership, loyalty points, gaming hours and booking history.";

export const Route =
  createFileRoute(
    "/login",
  )({
    head: () => ({
      meta: [
        {
          title,
        },
        {
          name: "description",
          content: description,
        },
      ],
    }),

    component: LoginPage,
  });

function LoginPage() {
  const navigate =
    useNavigate();

  const {
    user,
    loading: authLoading,
    login,
  } = useAuth();

  const [
    loginValue,
    setLoginValue,
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

  async function handleLogin() {
    if (
      !loginValue.trim()
    ) {
      toast.error(
        "Enter your email or phone number",
      );

      return;
    }

    if (!password) {
      toast.error(
        "Enter your password",
      );

      return;
    }

    try {
      setSubmitting(true);

      const loggedUser =
        await login({
          login:
            loginValue.trim(),

          password,
        });

      toast.success(
        `Welcome back, ${loggedUser.name}`,
      );

      await navigate({
        to: "/",
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to login",
      );
    } finally {
      setSubmitting(false);
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

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[15%] size-[440px] rounded-full bg-primary/10 blur-[140px]" />

        <div className="absolute bottom-[10%] right-[10%] size-[400px] rounded-full bg-secondary/10 blur-[140px]" />

        <div className="absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan/5 blur-[100px]" />
      </div>

      <div className="glass-static relative z-10 w-full max-w-md rounded-3xl border border-border/70 p-6 shadow-2xl sm:p-8">

        <div className="text-center">

          <Link
            to="/"
            className="mx-auto inline-flex items-center gap-2"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-neon-cyan">
              <Gamepad2 className="size-6" />
            </span>

            <span className="font-display text-sm font-bold tracking-[0.2em] uppercase">
              Cyber
              <span className="text-neon-cyan">
              Xtream
              </span>
            </span>
          </Link>

          <div className="mx-auto mt-7 grid size-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10">
            <LockKeyhole className="size-6 text-neon-cyan" />
          </div>

          <p className="mt-5 font-display text-[10px] tracking-[0.28em] text-primary uppercase">
            Arcadium Account
          </p>

          <h1 className="mt-2 font-display text-3xl font-black">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Login to view your membership, loyalty points, gaming hours and booking history.
          </p>

        </div>

        <div className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block font-display text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Email or Phone
            </label>

            <Input
              value={loginValue}
              onChange={(event) =>
                setLoginValue(
                  event.target.value,
                )
              }
              placeholder="Email or phone number"
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
                placeholder="Enter your password"
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
              Logging In...
            </>
          ) : (
            <>
              <LogIn className="mr-2 size-4" />
              Login to Account
            </>
          )}
        </Button>

        <div className="mt-7 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            New to Arcadium?
          </p>

          <Link
            to="/signup"
            className="mt-3 inline-flex font-display text-xs font-bold tracking-[0.16em] text-neon-cyan uppercase transition-colors hover:text-primary"
          >
            Create CX Account
          </Link>
        </div>

        <div className="mt-5 text-center">
          <Link
            to="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to Arcadium
          </Link>
        </div>

      </div>
    </main>
  );
}
