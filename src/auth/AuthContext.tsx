import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { ensureCurrentHousehold } from "../cloud/household";
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

  householdId: string | null;
  householdLoading: boolean;
  householdError: string | null;

  signUp: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;

  signIn: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;

  signOut: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(
  null,
);

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const [householdId, setHouseholdId] =
    useState<string | null>(null);

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
      (_event, nextSession) => {
        if (!isMounted) {
          return;
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

  useEffect(() => {
    if (!session?.user) {
      setHouseholdId(null);
      setHouseholdError(null);
      setHouseholdLoading(false);
      return;
    }

    let isMounted = true;

    setHouseholdLoading(true);
    setHouseholdError(null);

    void ensureCurrentHousehold().then((result) => {
      if (!isMounted) {
        return;
      }

      setHouseholdId(result.householdId);
      setHouseholdError(result.error);
      setHouseholdLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [session?.user.id]);

  async function signUp(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    if (!supabase) {
      return {
        error: "Cloud sync is not configured.",
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
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

    const normalizedEmail = email.trim().toLowerCase();

    const { error } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

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

    const { error } = await supabase.auth.signOut();

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

      householdId,
      householdLoading,
      householdError,

      signUp,
      signIn,
      signOut,
    }),
    [
      session,
      loading,
      householdId,
      householdLoading,
      householdError,
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