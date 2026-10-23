import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import PasswordInput from "../components/common/PasswordInput";
import { Waves, Sun, Moon } from "@phosphor-icons/react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === "dark";

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/", { replace: true });
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-canvas text-text font-body flex items-center justify-center p-4 sm:p-6 transition-colors duration-150 relative">
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="relative flex items-center p-1 rounded-pill border border-border bg-surface hover:border-border-strong transition-all cursor-pointer shadow-xs"
          aria-label="Toggle theme"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
              !isDark
                ? "bg-brand text-white shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Sun className="w-4 h-4" weight={!isDark ? "fill" : "regular"} />
          </div>

          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
              isDark
                ? "bg-brand text-white shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Moon className="w-4 h-4" weight={isDark ? "fill" : "regular"} />
          </div>
        </button>
      </div>

      <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-card flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-brand-soft flex items-center justify-center text-brand mb-3 shadow-xs">
            <Waves className="w-7 h-7" weight="bold" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-brand font-display mb-1">
            Laun-Dry
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Sign in to manage and monitor your device
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="login-email"
              className="text-xs font-bold uppercase tracking-wider text-brand font-display mb-1.5"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-canvas border border-border rounded-md px-3.5 py-2.5 text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
          </div>

          <PasswordInput
            id="login-password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-xs font-semibold text-danger text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-md bg-brand hover:bg-brand-600 text-white text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-interactive cursor-pointer mt-2"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
