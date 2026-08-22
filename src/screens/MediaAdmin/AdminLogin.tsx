import React, { useState } from "react";
import { motion } from "framer-motion";
import { loginAdmin } from "../../lib/adminAuth";

interface AdminLoginProps {
  onAuthenticated: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen w-full bg-[#F5F5F5] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm bg-white border border-black/10 shadow-lg"
      >
        <div className="px-6 py-5 border-b border-black/10">
          <p className="text-[9px] uppercase font-mono tracking-[0.25em] text-black/40">
            Restricted Access
          </p>
          <h1 className="text-lg font-black text-[#111] mt-1">Admin Sign In</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <label
            htmlFor="admin-password"
            className="block text-[9px] uppercase font-mono tracking-wider text-black/50 mb-1.5"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="w-full px-3 py-2.5 border border-black/15 bg-white text-sm text-black focus:outline-none focus:border-[#E4002B] transition-colors"
            placeholder="Enter admin password"
          />

          {error && (
            <p role="alert" className="mt-3 text-xs text-[#E4002B] font-semibold">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full mt-5 py-3 bg-[#E4002B] hover:bg-[#CC0026] disabled:bg-black/20 text-white text-[11px] uppercase font-mono font-bold tracking-wider transition-colors"
          >
            {submitting ? "Verifying…" : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
