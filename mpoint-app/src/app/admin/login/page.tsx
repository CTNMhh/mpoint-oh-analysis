"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // wichtig für Cookies!
    });
    const data = await res.json();
    console.log(res.ok);
    if (res.ok === true) {
      window.location.href = "/admin";
    } else {
      setError(data.error || "Login fehlgeschlagen.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-xl shadow p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">
          Admin Login
        </h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <input
          type="email"
          required
          placeholder="Admin E-Mail"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Passwort"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[rgb(228,25,31)] text-white px-6 py-2 rounded hover:bg-red-700 transition-colors font-semibold w-full"
        >
          Login
        </button>
      </form>
    </main>
  );
}