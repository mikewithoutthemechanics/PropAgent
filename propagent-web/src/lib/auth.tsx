"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient, User, Session } from "@supabase/supabase-js";

// Lazy initialization - only create client when env vars are available
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase configuration is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Use a cached client instance
let supabaseClient: ReturnType<typeof createClient> | null = null;

const getClient = () => {
  if (!supabaseClient) {
    supabaseClient = getSupabaseClient();
  }
  return supabaseClient;
};

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  agency_id?: string;
  phone?: string;
  avatar_url?: string;
  onboarded_at?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at?: string;
  // PPRA Verification fields
  practitioner_name?: string;
  ffc_number?: string;
  capacity?: string;
  firm?: string;
  category?: string;
  ffc_file_url?: string;
  // Integration fields
  db_type?: string;
  db_url?: string;
  // Subscription fields (set by PayFast ITN webhook)
  subscription_tier?: string;
  subscription_status?: string;
  subscription_updated_at?: string;
}

// Demo mode flag - set to true to bypass authentication for testing
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Demo user profile for testing
const DEMO_PROFILE: Profile = {
  id: 'demo-user-id',
  email: 'demo@agentloop.co.za',
  first_name: 'Demo',
  last_name: 'User',
  role: 'agent',
  agency_id: 'demo-agency',
  phone: '+27 82 123 4567',
  verified_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  isDemoMode: boolean;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(DEMO_MODE);

  // Demo mode is a build-time flag only. When NEXT_PUBLIC_DEMO_MODE is not
  // "true", URL params and localStorage cannot re-enable it — otherwise
  // production users could bypass auth by setting a local flag.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!DEMO_MODE) {
      localStorage.removeItem('agent-loop-demo-mode');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const urlDemo = params.get('demo') === 'true';
    const storedDemo = localStorage.getItem('agent-loop-demo-mode') === 'true';
    if (urlDemo || storedDemo) {
      setIsDemoMode(true);
      if (urlDemo) {
        localStorage.setItem('agent-loop-demo-mode', 'true');
      }
    }
  }, []);

  const enterDemoMode = () => {
    setIsDemoMode(true);
    setUser({
      id: DEMO_PROFILE.id,
      email: DEMO_PROFILE.email,
      app_metadata: {},
      user_metadata: {
        first_name: DEMO_PROFILE.first_name,
        last_name: DEMO_PROFILE.last_name,
      },
      aud: 'authenticated',
      confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as User);
    setProfile(DEMO_PROFILE);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const client = getClient();
    if (!client) return;
    try {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    // Skip auth initialization in demo mode
    if (isDemoMode) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const client = getClient();
        if (!client) {
          console.warn("Supabase client not initialized - env vars may be missing");
          setLoading(false);
          return;
        }
        const { data: { session } } = await client.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const client = getClient();
    if (!client) return;
    
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const signIn = async (email: string, password: string) => {
    const client = getClient();
    if (!client) return { error: new Error("Supabase not configured") };
    try {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const client = getClient();
    if (!client) return { error: new Error("Supabase not configured") };
    try {
      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) return { error };

      // Profile row is created automatically by the on_auth_user_created
      // database trigger (see 20260420180000_enable_profiles_rls.sql). No
      // client-side insert needed — and with RLS enabled on profiles a
      // client insert would fail anyway until the email is confirmed and
      // a session exists.

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      localStorage.removeItem('agent-loop-demo-mode');
      setUser(null);
      setProfile(null);
      setSession(null);
      return;
    }
    const client = getClient();
    if (client) {
      await client.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };
    const client = getClient();
    if (!client) return { error: new Error("Supabase not configured") };

    try {
      const { error } = await client
        .from("profiles")
        .update(data)
        .eq("id", user.id);

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, ...data } : null));
      }
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        isDemoMode,
        enterDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export supabase client for direct access (OAuth, etc.)
export const supabase = getClient();