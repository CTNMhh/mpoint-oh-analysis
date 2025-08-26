import React from "react";
import Link from "next/link";

export default function AdminHeader() {
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/admin/login"; // Weiterleitung zur Login-Seite
      } else {
        console.error("Logout fehlgeschlagen");
      }
    } catch (error) {
      console.error("Fehler beim Logout:", error);
    }
  };

  return (
    <header className="w-full bg-gray-900 text-white py-4 px-8 flex items-center justify-between shadow">
      <div className="font-bold text-xl">Admin Bereich</div>
      <nav className="flex gap-6">
        <Link href="/admin" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/admin/users" className="hover:underline">
          Nutzer
        </Link>
        <Link href="/admin/news" className="hover:underline">
          News
        </Link>
        <button
          onClick={handleLogout}
          className="hover:underline text-red-500"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}