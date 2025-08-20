"use client";

type Item = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  createdAt: string; // ISO-String
};

export default function ExportCsv({ items }: { items: Item[] }) {
  const onClick = () => {
    const headers = ["ID", "Kategorie", "Titel", "Text", "URL", "Zeit"];
    const rows = items.map((i) => [
      i.id,
      i.type,
      i.title,
      (i.body || "").replace(/\n/g, " "),
      i.url || "",
      i.createdAt,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notifications.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={onClick} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
      CSV exportieren
    </button>
  );
}