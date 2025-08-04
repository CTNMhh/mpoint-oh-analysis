import React from "react";
import Link from "next/link";

export default function AdminHeader() {
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
        <Link href="/admin/events" className="hover:underline">
          Events
        </Link>
        <Link href="/admin/news" className="hover:underline">
          News
        </Link>
        <Link href="/admin/logout" className="hover:underline">
          Logout
        </Link>
      </nav>
    </header>
  );
}