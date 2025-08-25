"use client";

export default function MarkAllRead() {
  const mark = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    location.reload();
  };

  return (
    <button onClick={mark} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
      Alle als gelesen
    </button>
  );
}