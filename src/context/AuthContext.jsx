import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const AuthContext = createContext(null);

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Provides authentication state, manages session persistence,
 * and monitors user activity for automatic logout after 30 minutes of idle time.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Set persistence once on initialization
  useEffect(() => {
    setPersistence(auth, browserSessionPersistence).catch((error) => {
      // Quietly log error if persistence fails (optional fallback handling)
    });
  }, []);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const tokenResult = await firebaseUser.getIdTokenResult();
        setClaims(tokenResult.claims);
      } else {
        setUser(null);
        setClaims(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Inactivity timeout logic
  useEffect(() => {
    if (!user) return;

    let timeoutId;

    const logoutUser = async () => {
      try {
        await signOut(auth);
      } catch (err) {
        // Quietly fail
      }
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutUser, INACTIVITY_LIMIT_MS);
    };

    // User activity listeners
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Start initial timer
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, claims, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
