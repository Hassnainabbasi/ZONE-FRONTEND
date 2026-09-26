import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  authApi,
  type AuthUser,
  type LoginPayload,
  type SignupPayload,
} from "@/services/authApi";

interface AuthContextValue {
  user:
    AuthUser | null;

  loading:
    boolean;

  signup:
    (
      payload:
        SignupPayload,
    ) => Promise<AuthUser>;

  login:
    (
      payload:
        LoginPayload,
    ) => Promise<AuthUser>;

  logout:
    () => Promise<void>;

  refresh:
    () => Promise<AuthUser | null>;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

export function AuthProvider({
  children,
}: {
  children:
    ReactNode;
}) {
  const [
    user,
    setUser,
  ] =
    useState<
      AuthUser | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const refresh =
    useCallback(
      async () => {
        try {
          const response =
            await authApi.me();

          const nextUser =
            response.data
              .user;

          setUser(
            nextUser,
          );

          return nextUser;
        } catch {
          setUser(
            null,
          );

          return null;
        }
      },
      [],
    );

  useEffect(() => {
    let mounted =
      true;

    async function initialize() {
      try {
        const response =
          await authApi.me();

        if (mounted) {
          setUser(
            response.data
              .user,
          );
        }
      } catch {
        if (mounted) {
          setUser(
            null,
          );
        }
      } finally {
        if (mounted) {
          setLoading(
            false,
          );
        }
      }
    }

    void initialize();

    return () => {
      mounted =
        false;
    };
  }, []);

  const signup =
    useCallback(
      async (
        payload:
          SignupPayload,
      ) => {
        const response =
          await authApi.signup(
            payload,
          );

        const nextUser =
          response.data
            .user;

        setUser(
          nextUser,
        );

        return nextUser;
      },
      [],
    );

  const login =
    useCallback(
      async (
        payload:
          LoginPayload,
      ) => {
        const response =
          await authApi.login(
            payload,
          );

        const nextUser =
          response.data
            .user;

        setUser(
          nextUser,
        );

        return nextUser;
      },
      [],
    );

  const logout =
    useCallback(
      async () => {
        try {
          await authApi.logout();
        } finally {
          setUser(
            null,
          );
        }
      },
      [],
    );

  const value =
    useMemo(
      () => ({
        user,

        loading,

        signup,

        login,

        logout,

        refresh,
      }),
      [
        user,
        loading,
        signup,
        login,
        logout,
        refresh,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}