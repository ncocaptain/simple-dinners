import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  Session,
  User,
} from "@supabase/supabase-js";
import {
  createCurrentHousehold,
  getCurrentHousehold,
  joinCurrentHousehold,
  type HouseholdInfo,
} from "../cloud/household";
import {
  isCloudSyncConfigured,
  supabase,
} from "../lib/supabase";

type AuthResult = {
  error: string | null;
  needsEmailConfirmation?: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  isSignedIn: boolean;
  isPasswordRecovery: boolean;

  household: HouseholdInfo | null;
  householdId: string | null;
  householdLoading: boolean;
  householdError: string | null;
  needsHouseholdSetup: boolean;

  refreshHousehold: () => Promise<void>;

  createHousehold: (
    name: string,
  ) => Promise<AuthResult>;

  joinHousehold: (
    inviteCode: string,
  ) => Promise<AuthResult>;

  signUp: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;

  signIn: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;

  requestPasswordReset: (
    email: string,
  ) => Promise<AuthResult>;

  updatePassword: (
    password: string,
  ) => Promise<AuthResult>;

  signOut: () => Promise<AuthResult>;
};

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] = useState(true);

  const [
    isPasswordRecovery,
    setIsPasswordRecovery,
  ] = useState(false);

  const [household, setHousehold] =
    useState<HouseholdInfo | null>(null);

  const [householdLoading, setHouseholdLoading] =
    useState(false);

  const [householdError, setHouseholdError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          console.error(
            "Unable to restore Supabase session:",
            error,
          );
        }

        setSession(data.session ?? null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!isMounted) {
          return;
        }

        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
        }

        setSession(nextSession);
        setLoading(false);
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshHousehold =
    useCallback(async () => {
      if (!session?.user) {
        setHousehold(null);
        setHouseholdError(null);
        setHouseholdLoading(false);
        return;
      }

      setHouseholdLoading(true);
      setHouseholdError(null);

      const result =
        await getCurrentHousehold();

      setHousehold(result.data);
      setHouseholdError(result.error);
      setHouseholdLoading(false);
    }, [session?.user?.id]);

  useEffect(() => {
    void refreshHousehold();
  }, [refreshHousehold]);

  async function createHousehold(
    name: string,
  ): Promise<AuthResult> {
    if (!session?.user) {
      return {
        error:
          "Sign in before creating a household.",
      };
    }

    setHouseholdLoading(true);
    setHouseholdError(null);

    const result =
      await createCurrentHousehold(name);

    if (result.error) {
      setHouseholdError(result.error);
      setHouseholdLoading(false);

      return {
        error: result.error,
      };
    }

    await refreshHousehold();

    return {
      error: null,
    };
  }

  async function joinHousehold(
    inviteCode: string,
  ): Promise<AuthResult> {
    if (!session?.user) {
      return {
        error:
          "Sign in before joining a household.",
      };
    }

    setHouseholdLoading(true);
    setHouseholdError(null);

    const result =
      await joinCurrentHousehold(inviteCode);

    if (result.error) {
      setHouseholdError(result.error);
      setHouseholdLoading(false);

      return {
        error: result.error,
      };
    }

    await refreshHousehold();

    return {
      error: null,
    };
  }

  async function signUp(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    if (!supabase) {
      return {
        error: "Cloud sync is not configured.",
      };
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const { data, error } =
      await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

    if (error) {
      return {
        error: error.message,
      };
    }

    return {
      error: null,
      needsEmailConfirmation: !data.session,
    };
  }

  async function signIn(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    if (!supabase) {
      return {
        error: "Cloud sync is not configured.",
      };
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const { error } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    return {
      error: error?.message ?? null,
    };
  }

  async function requestPasswordReset(
    email: string,
  ): Promise<AuthResult> {
    if (!supabase) {
      return {
        error: "Cloud sync is not configured.",
      };
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      return {
        error: "Please enter your email address.",
      };
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo:
            "https://dinners.ncocaptain.com/reset-password",
        },
      );

    return {
      error: error?.message ?? null,
    };
  }

  async function updatePassword(
    password: string,
  ): Promise<AuthResult> {
    if (!supabase) {
      return {
        error: "Cloud sync is not configured.",
      };
    }

    if (password.length < 8) {
      return {
        error:
          "Your new password must be at least 8 characters.",
      };
    }

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (!error) {
      setIsPasswordRecovery(false);
    }

    return {
      error: error?.message ?? null,
    };
  }

  async function signOut(): Promise<AuthResult> {
    if (!supabase) {
      return {
        error: "Cloud sync is not configured.",
      };
    }

    const { error } =
      await supabase.auth.signOut();

    if (!error) {
      setIsPasswordRecovery(false);
    }

    return {
      error: error?.message ?? null,
    };
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isConfigured: isCloudSyncConfigured,
      isSignedIn: Boolean(session?.user),
      isPasswordRecovery,

      household,
      householdId: household?.id ?? null,
      householdLoading,
      householdError,

      needsHouseholdSetup:
        Boolean(session?.user) &&
        !householdLoading &&
        !household,

      refreshHousehold,
      createHousehold,
      joinHousehold,

      signUp,
      signIn,
      requestPasswordReset,
      updatePassword,
      signOut,
    }),
    [
      session,
      loading,
      isPasswordRecovery,
      household,
      householdLoading,
      householdError,
      refreshHousehold,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider.",
    );
  }

  return context;
}