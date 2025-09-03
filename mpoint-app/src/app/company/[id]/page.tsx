import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const company = await prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      legalForm: true,
      district: true,
      foundedYear: true,
      primaryNaceCode: true,
      employeeRange: true,
      customerType: true,
      marketReach: true,
      branchDescription: true,
      companyDescription: true,
      painPoints: true,
      searchingFor: true,
      certifications: true,
      exportQuota: true,
      growthPhase: true,
      user: { select: { id: true } },
    },
  });

  if (!company) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="mb-4">Unternehmen nicht gefunden.</p>
          <Link href="/netzwerk" className="text-red-600 font-medium hover:underline">
            Zurück zum Netzwerk
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <header className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600 mt-1">
              {company.legalForm || "Rechtsform n/a"} • {company.district || "Bezirk n/a"} • Gegründet {company.foundedYear || "—"}
            </p>
          </div>
          <div className="flex gap-3">
            {company.user?.id && (
              <Link
                href={`/chat/${company.user.id}`}
                className="px-4 py-2 rounded-lg bg-[#e60000] text-white text-sm font-medium hover:bg-red-700"
              >
                Kontakt aufnehmen
              </Link>
            )}
            <Link href="/netzwerk" className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100">
              Zurück
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {company.companyDescription && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Unternehmensbeschreibung</h2>
                <p className="text-gray-700 whitespace-pre-line">{company.companyDescription}</p>
              </div>
            )}
            {company.branchDescription && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Branche & Markt</h2>
                <p className="text-gray-700 whitespace-pre-line">{company.branchDescription}</p>
              </div>
            )}
            {((company.painPoints?.length || 0) > 0 || (company.searchingFor?.length || 0) > 0) && (
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                {(company.painPoints?.length || 0) > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-800 mb-1">Herausforderungen</h3>
                    <div className="flex flex-wrap gap-2">
                      {company.painPoints!.map(p => (
                        <span key={p} className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(company.searchingFor?.length || 0) > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-800 mb-1">Sucht nach</h3>
                    <div className="flex flex-wrap gap-2">
                      {company.searchingFor!.map(p => (
                        <span key={p} className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Profil</h2>
              <ul className="text-sm space-y-2 text-gray-700">
                <li><span className="font-medium">Mitarbeiter:</span> {company.employeeRange || "—"}</li>
                <li><span className="font-medium">Kundentyp:</span> {company.customerType || "—"}</li>
                <li><span className="font-medium">Marktreichweite:</span> {company.marketReach || "—"}</li>
                <li><span className="font-medium">NACE:</span> {company.primaryNaceCode || "—"}</li>
                <li><span className="font-medium">Wachstumsphase:</span> {company.growthPhase || "—"}</li>
                <li><span className="font-medium">Exportquote:</span> {company.exportQuota != null ? `${company.exportQuota}%` : "—"}</li>
              </ul>
            </div>

            {(company.certifications?.length || 0) > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Zertifizierungen</h2>
                <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
                  {company.certifications!.map(c => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}