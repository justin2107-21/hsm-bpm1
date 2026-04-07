import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole =
  | "Citizen_User"
  | "BusinessOwner_User"
  | "BHW_User"
  | "BSI_User"
  | "Clerk_User"
  | "Captain_User"
  | "LGUAdmin_User"
  | "SysAdmin_User";

export const ROLE_LABELS: Record<UserRole, string> = {
  Citizen_User: "Citizen",
  BusinessOwner_User: "Business Owner",
  BHW_User: "Barangay Health Worker",
  BSI_User: "Sanitary Inspector",
  Clerk_User: "Health Center Staff",
  Captain_User: "Municipal Health Officer",
  LGUAdmin_User: "LGU Admin",
  SysAdmin_User: "System Administrator",
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  currentRole: UserRole;
  userName: string;
  loading: boolean;
  roleLoading: boolean;
  hasEstablishments: boolean;
  citizenData: any | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInAsCitizen: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshEstablishments: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("Citizen_User");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [hasEstablishments, setHasEstablishments] = useState(false);
  const [citizenData, setCitizenData] = useState<any | null>(null);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase.rpc('get_user_role', { _user_id: userId });
    if (data) {
      // Treat Business Owner accounts as unified Citizen users in the app
      const mappedRole = data === "BusinessOwner_User" ? "Citizen_User" : (data as UserRole);
      setCurrentRole(mappedRole);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .single();
    if (data) {
      setUserName(data.full_name || '');
    }
  };

  const fetchEstablishments = async (userId: string) => {
    const { data } = await supabase
      .from('establishments')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    setHasEstablishments(!!(data && data.length > 0));
  };

  const fetchUserData = async (userId: string) => {
    setRoleLoading(true);
    await Promise.all([
      fetchUserRole(userId),
      fetchProfile(userId),
      fetchEstablishments(userId)
    ]);
    setRoleLoading(false);
  };

  useEffect(() => {
    // Check for existing citizen session first
    const citizenSession = localStorage.getItem('cie_citizen_session');
    const citizenData = localStorage.getItem('cie_citizen_data');

    if (citizenSession && citizenData) {
      const session = JSON.parse(citizenSession);
      const citizen = JSON.parse(citizenData);
      setUser(session.user);
      setSession(session);
      setUserName(`${citizen.first_name} ${citizen.last_name}`);
      setCurrentRole('Citizen_User');
      setCitizenData(citizen);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setCurrentRole("Citizen_User");
          setUserName("");
          setHasEstablishments(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signInAsCitizen = async (email: string, password: string) => {
    try {
      // First, try to find the citizen in CIE database by email
      // Uses Netlify Functions (works both locally and in production)
      const response = await fetch(`/.netlify/functions/citizens-search?q=${encodeURIComponent(email)}`);
      if (!response.ok) {
        return { error: new Error('Failed to search citizens') };
      }

      const citizens = await response.json();
      const citizen = citizens.find((c: any) => c.email?.toLowerCase() === email.toLowerCase());

      if (!citizen) {
        return { error: new Error('Citizen not found with this email') };
      }

      // For demo purposes, accept any password for found citizens
      if (!password || password.length < 1) {
        return { error: new Error('Password is required') };
      }

      // Create a mock session for citizen login (demo purposes)
      // In production, you'd want proper authentication
      const mockUser = {
        id: citizen.id, // use the citizen UUID so Supabase queries match expected user_id
        email: citizen.email,
        user_metadata: {
          full_name: `${citizen.first_name} ${citizen.last_name}`,
          role: 'Citizen_User'
        }
      };

      const mockSession = {
        user: mockUser,
        access_token: 'mock_citizen_token',
        refresh_token: 'mock_refresh_token'
      };

      // Set the mock session
      setUser(mockUser as any);
      setSession(mockSession as any);
      setUserName(`${citizen.first_name} ${citizen.last_name}`);
      setCurrentRole('Citizen_User');
      setCitizenData(citizen);

      // Store citizen data for the session
      localStorage.setItem('cie_citizen_data', JSON.stringify(citizen));
      localStorage.setItem('cie_citizen_session', JSON.stringify(mockSession));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCurrentRole("Citizen_User");
    setUserName("");
    setHasEstablishments(false);
    setCitizenData(null);
    localStorage.removeItem('cie_citizen_data');
    localStorage.removeItem('cie_citizen_session');
  };

  const refreshEstablishments = async () => {
    if (user?.id) {
      await fetchEstablishments(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, currentRole, userName, loading, roleLoading, hasEstablishments, citizenData, signIn, signInAsCitizen, signOut, refreshEstablishments }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
