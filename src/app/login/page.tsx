"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const { show } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Invalid email or password.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.push("/");
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "Invalid email or password.";
      setError(message);
      show(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-700 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white">
            <Wallet size={24} />
          </div>
          <h1 className="text-lg font-bold text-ink-900">BillBook</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="ramzaan12@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            error={error}
          />
          <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">
            {loading ? "Logging in…" : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
