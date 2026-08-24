import React, { useState } from "react";
import { motion } from "framer-motion";
import { loginAdmin } from "../../lib/adminAuth";

interface AdminLoginProps {
  onAuthenticated: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await loginAdmin(password);
    setSubmitting(false);
    if (result.ok) {
      onAuthenticated();
    } else {
      setError(result.error || "Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm bg-white border border-hairline"
      >
        <div className="px-6 py-6 border-b border-hairline">
          <p className="text-[13px] text-ink-soft">Restricted access</p>
          <div className="flex items-center gap-2 mt-2 text-ink">
            <span aria-hidden="true" className="h-3 w-3 shrink-0 bg-current" />
            <h1 className="font-sans font-medium text-[20px] leading-none tracking-[-0.01em]">
              Project Work
            </h1>
          </div>
          <p className="text-[13px] text-ink-soft mt-1.5">Admin sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <label htmlFor="admin-password" className="block text-[12px] text-ink-soft mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={reveal ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              className="w-full pl-3 pr-10 py-2.5 border border-ink/15 bg-transparent text-sm text-ink focus:outline-none focus:border-ink transition-colors duration-200 rounded-none placeholder:text-ink/40"
              placeholder="Enter admin password"
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? "Hide password" : "Show password"}
              aria-pressed={reveal}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-ink/35 hover:text-ink transition-colors duration-200 ease-house"
            >
              {reveal ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <circle cx="12" cy="12" r="2.5" strokeWidth={1.5} />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-[13px] leading-snug text-brand flex items-start gap-1.5">
              <svg aria-hidden="true" className="w-3.5 h-3.5 mt-[2px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeWidth={1.5} d="M12 8v4.5M12 15.5v.5" />
              </svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full mt-5 py-3 bg-ink hover:bg-ink/80 disabled:bg-ink/20 disabled:hover:bg-ink/20 disabled:cursor-not-allowed text-white text-[13px] font-medium tracking-[-0.005em] transition-colors duration-200 ease-house"
          >
            {submitting ? "Verifying…" : "Sign In"}
          </button>
        </form>

        <div className="px-6 py-4 border-t border-hairline">
          <p className="text-[12px] text-ink/40">SCHIS — Spatial Cultural Heritage Information System</p>
        </div>
      </motion.div>
    </div>
  );
};
