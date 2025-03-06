import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // ✅ Prevents unnecessary redirects on refresh

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
      } else {
        setUser(sessionData?.session?.user || null);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  /** Login Function */
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      setUser(data.user);
      return data;
    } catch (err) {
      console.error("Login Error:", err.message);
      throw err;
    }
  };

  /** Register Function */
  const register = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      const userId = data.user?.id;

      // Insert user profile into "profiles" table
      if (userId) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ id: userId, email, full_name: fullName }]);

        if (profileError) console.error("Profile Creation Error:", profileError.message);
      }

      return data;
    } catch (err) {
      console.error("Registration Error:", err.message);
      throw err;
    }
  };

  /** Logout Function */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
