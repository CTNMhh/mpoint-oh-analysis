'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    identifier: "", // E-Mail oder Benutzername
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login fehlgeschlagen.");
        setLoading(false);
        return;
      }
      if (data.user) {
        setUser({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
        });
      }
      router.push("/");
    } catch (err) {
      setError("Serverfehler. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="w-full flex justify-center pt-40 pb-20">
        <form
          className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-lg space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="text-2xl font-bold mb-2 text-center">Login</div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <input
            name="identifier"
            type="text"
            placeholder="E-Mail oder Benutzername"
            className="border px-4 py-2 rounded-lg w-full"
            required
            value={form.identifier}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Passwort"
            className="border px-4 py-2 rounded-lg w-full"
            required
            value={form.password}
            onChange={handleChange}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[rgb(228,25,31)] text-white font-medium transition-colors flex items-center justify-center gap-1 py-3 rounded-lg hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Wird gesendet..." : <>Login <ChevronRight className="w-4 h-4" /></>}
          </button>
          <div className="text-center mt-2">
            <a href="/register" className="text-indigo-600 underline">
              Noch kein Konto? Jetzt registrieren
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}