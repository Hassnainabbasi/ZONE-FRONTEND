import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
} from "react";

import {
  Loader2,
} from "lucide-react";

import {
  Toaster,
} from "@/components/ui/sonner";

import {
  AdminShell,
} from "@/components/admin/AdminShell";

import {
  useAuth,
} from "@/context/auth-context";

export const Route =
  createFileRoute(
    "/admin",
  )({
    component:
      AdminLayout,
  });

function AdminLayout() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    user,
    loading,
  } = useAuth();

  const isLoginPage =
    location.pathname ===
    "/admin/login";

  /* =======================================================
     ADMIN AUTH GUARD
  ======================================================= */

  useEffect(() => {
    if (loading) {
      return;
    }

    /*
     * Login page must remain accessible.
     */
    if (isLoginPage) {
      if (
        user?.role ===
        "Admin"
      ) {
        void navigate({
          to: "/admin",
        });
      }

      return;
    }

    /*
     * Everything else inside /admin
     * requires Admin role.
     */
    if (
      !user ||
      user.role !==
        "Admin"
    ) {
      void navigate({
        to:
          "/admin/login",
      });
    }
  }, [
    loading,
    user,
    isLoginPage,
    navigate,
  ]);

  /* =======================================================
     INITIAL AUTH LOAD
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">

        <Loader2 className="size-7 animate-spin text-neon-cyan" />

      </main>
    );
  }

  /* =======================================================
     LOGIN PAGE
  ======================================================= */

  if (isLoginPage) {
    return (
      <>
        <Outlet />

        <Toaster />
      </>
    );
  }

  /* =======================================================
     BLOCK NON ADMIN
  ======================================================= */

  if (
    !user ||
    user.role !==
      "Admin"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">

        <Loader2 className="size-7 animate-spin text-neon-cyan" />

      </main>
    );
  }

  /* =======================================================
     ADMIN PANEL
  ======================================================= */

  return (
    <AdminShell>

      <Outlet />

      <Toaster />

    </AdminShell>
  );
}