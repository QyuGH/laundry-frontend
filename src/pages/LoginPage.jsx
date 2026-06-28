import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

/**
 * Login page for email and password authentication.
 * Redirects authenticated users to the home page on mount.
 * Uses Firebase signInWithEmailAndPassword for sign-in.
 *
 * @returns {JSX.Element}
 */
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-bg border-1 border-solid border-border p-8 rounded-lg">
        {/* Logo placeholder */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 border border-border rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <h1 className="text-text text-xl font-semibold tracking-wide">
            Laun-Dry
          </h1>
          <p className="text-text-muted text-sm mt-1">Smart Sampayan</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-text text-xs uppercase tracking-widest">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="bg-transparent border border-border-muted rounded-md px-3 py-2.5 text-text text-sm placeholder-text-muted focus:outline-none focus:border-border hover:border-border transition-colors duration-150"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-text text-xs uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="bg-transparent border border-border-muted rounded-md px-3 py-2.5 text-text text-sm placeholder-text-muted focus:outline-none focus:border-border hover:border-border transition-colors duration-150"
            />
          </div>

          {error && (
            <p className="text-text-muted text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 bg-bg-light text-text font-medium text-sm rounded-md py-2.5 transition-opacity duration-150 disabled:opacity-40"
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
