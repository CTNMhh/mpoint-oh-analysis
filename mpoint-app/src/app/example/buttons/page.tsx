"use client";

import React, { useState, useEffect } from "react";
import { Button, PrimaryButton, SecondaryButton, DangerButton, GrayButton, CustomButton } from "@/app/components/ui/Button";
import { MoreLink } from "@/app/components/ui/MoreLink";
import { BookOpen, Download, Settings, Trash2, Plus } from "lucide-react";

export default function ExampleButtonsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate API call with dummy data
    setTimeout(() => {
      setData([
        { id: 1, name: "Button Example 1", status: "active" },
        { id: 2, name: "Button Example 2", status: "inactive" },
        { id: 3, name: "Button Example 3", status: "pending" }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">M-Point Button System - Technische Dokumentation</h1>

          {/* Technische Beschreibung */}
          <section className="mb-12 bg-blue-50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">Technische Spezifikation</h2>

            <div className="prose prose-blue max-w-none">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Button-Komponente Architektur</h3>
              <ul className="text-blue-700 space-y-2 mb-6">
                <li><strong>Dateipfad:</strong> <code>/src/app/components/ui/Button.tsx</code></li>
                <li><strong>TypeScript-Support:</strong> Vollständige Typisierung mit separaten Interfaces für Button- und Link-Varianten</li>
                <li><strong>Polymorphe Komponente:</strong> Kann sowohl als Button als auch als Link verwendet werden</li>
                <li><strong>Icon-Integration:</strong> Lucide React Icons mit konfigurierbarer Position (links/rechts)</li>
              </ul>

              <h3 className="text-lg font-semibold text-blue-800 mb-3">Größenvarianten (size)</h3>
              <div className="bg-white p-4 rounded-lg mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Größe</th>
                      <th className="text-left p-2">Padding</th>
                      <th className="text-left p-2">Border-Radius</th>
                      <th className="text-left p-2">Schriftgröße</th>
                      <th className="text-left p-2">Schriftgewicht</th>
                      <th className="text-left p-2">Icon-Größe</th>
                      <th className="text-left p-2">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2"><code>sm</code></td>
                      <td className="p-2"><code>px-3 py-1.5</code> (12px/6px)</td>
                      <td className="p-2"><code>rounded-md</code> (6px)</td>
                      <td className="p-2"><code>text-sm</code> (14px)</td>
                      <td className="p-2"><code>font-medium</code></td>
                      <td className="p-2">16px</td>
                      <td className="p-2"><code>gap-1.5</code> (6px)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2"><code>md</code></td>
                      <td className="p-2"><code>px-4 py-2</code> (16px/8px)</td>
                      <td className="p-2"><code>rounded-lg</code> (8px)</td>
                      <td className="p-2"><code>text-base</code> (16px)</td>
                      <td className="p-2"><code>font-medium</code></td>
                      <td className="p-2">18px</td>
                      <td className="p-2"><code>gap-2</code> (8px)</td>
                    </tr>
                    <tr>
                      <td className="p-2"><code>lg</code></td>
                      <td className="p-2"><code>px-6 py-3</code> (24px/12px)</td>
                      <td className="p-2"><code>rounded-xl</code> (12px)</td>
                      <td className="p-2"><code>text-lg</code> (18px)</td>
                      <td className="p-2"><code>font-semibold</code></td>
                      <td className="p-2">22px</td>
                      <td className="p-2"><code>gap-2.5</code> (10px)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-blue-800 mb-3">Farbvarianten (variant)</h3>
              <ul className="text-blue-700 space-y-2 mb-6">
                <li><strong>primary:</strong> M-Point Rot (#e60000) mit weißem Text - Hauptaktionen</li>
                <li><strong>secondary:</strong> Weißer Hintergrund mit rotem Rahmen - Sekundäre Aktionen</li>
                <li><strong>danger:</strong> Dunkelrot (#dc2626) mit dunklem Rahmen und rotem Schatten - Destruktive Aktionen</li>
                <li><strong>gray:</strong> Grauer Hintergrund - Neutrale/Disabled Aktionen</li>
                <li><strong>custom:</strong> Weißer Hintergrund (konstant), grauer Text, anpassbare Hover-Rahmenfarbe - Börse-Buttons</li>
              </ul>

              <h3 className="text-lg font-semibold text-blue-800 mb-3">Convenience-Komponenten</h3>
              <ul className="text-blue-700 space-y-1 mb-6">
                <li><code>PrimaryButton</code>, <code>SecondaryButton</code>, <code>DangerButton</code>, <code>GrayButton</code></li>
                <li>Vordefinierte Varianten für häufige Anwendungsfälle</li>
              </ul>

              <h3 className="text-lg font-semibold text-blue-800 mb-3">MoreLink-Komponente</h3>
              <ul className="text-blue-700 space-y-2">
                <li><strong>Dateipfad:</strong> <code>/src/app/components/ui/MoreLink.tsx</code></li>
                <li><strong>Design:</strong> Einheitliche Größe ohne Varianten</li>
                <li><strong>Farbe:</strong> M-Point Rot (#e60000) mit Pfeil-Icon</li>
                <li><strong>Hover-Effekt:</strong> Vergrößerung des Gaps zwischen Text und Icon</li>
              </ul>
            </div>
          </section>

          {/* Primary Buttons */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Primary Buttons</h2>
            <p className="text-gray-600 mb-4">Hauptaktionen in M-Point Rot (#e60000). Für wichtigste Benutzeraktionen wie "Speichern", "Anmelden", etc.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" size="sm">
                Small Primary
              </Button>
              <Button variant="primary" size="md" icon={BookOpen} iconPosition="left">
                Primary Button
              </Button>
              <Button variant="primary" size="lg" icon={Download} iconPosition="right">
                Large Primary
              </Button>
              <PrimaryButton size="md" disabled>
                Disabled Primary
              </PrimaryButton>
            </div>
          </section>

          {/* Secondary Buttons */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Secondary Buttons</h2>
            <p className="text-gray-600 mb-4">Sekundäre Aktionen mit rotem Rahmen. Für Aktionen wie "Abbrechen", "Bearbeiten", etc.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="secondary" size="sm">
                Small Secondary
              </Button>
              <Button variant="secondary" size="md">
                Secondary Button
              </Button>
              <SecondaryButton size="lg" icon={Settings} iconPosition="left">
                Large Secondary
              </SecondaryButton>
              <SecondaryButton size="md" disabled>
                Disabled Secondary
              </SecondaryButton>
            </div>
          </section>

          {/* Danger Buttons */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Danger Buttons</h2>
            <p className="text-gray-600 mb-4">Destruktive Aktionen in Dunkelrot mit verstärkter visueller Warnung. Für kritische Aktionen wie "Löschen", "Entfernen", etc.</p>
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-red-800">
                <strong>Design-Unterschiede zu Primary:</strong> Dunklerer Rotton, zusätzlicher Rahmen,
                roter Schatten für verstärkte Aufmerksamkeit bei destruktiven Aktionen.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="danger" size="sm" icon={Trash2}>
                Delete
              </Button>
              <Button variant="danger" size="md">
                Danger Button
              </Button>
              <DangerButton size="lg">
                Large Danger
              </DangerButton>
              <DangerButton size="md" disabled>
                Disabled Danger
              </DangerButton>
            </div>
          </section>

          {/* Gray Buttons */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gray Buttons</h2>
            <p className="text-gray-600 mb-4">Neutrale Aktionen oder Disabled-Zustände. Für weniger wichtige Aktionen.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="gray" size="sm">
                Small Gray
              </Button>
              <Button variant="gray" size="md">
                Gray Button
              </Button>
              <GrayButton size="lg" icon={Plus} iconPosition="right">
                Large Gray
              </GrayButton>
              <GrayButton size="md" disabled>
                Disabled Gray
              </GrayButton>
            </div>
          </section>

          {/* Link Buttons */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Link Buttons</h2>
            <p className="text-gray-600 mb-4">Buttons mit href-Attribut für Navigation. Automatische Erkennung durch TypeScript.</p>
            <div className="flex flex-wrap gap-4">
              <Button href="/events" variant="primary" size="md">
                Go to Events
              </Button>
              <Button href="/news" variant="secondary" size="md" icon={BookOpen}>
                Read News
              </Button>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Technischer Hinweis:</strong> Die Komponente erkennt automatisch anhand des href-Props,
                ob ein &lt;a&gt;-Tag oder &lt;button&gt;-Tag gerendert werden soll.
              </p>
            </div>
          </section>

          {/* More Links */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">More Links</h2>
            <p className="text-gray-600 mb-4">Spezielle Link-Komponente mit Pfeil-Icon. Einheitliche Größe für konsistentes Design.</p>
            <div className="flex flex-col gap-4">
              <MoreLink href="/more-info">
                Mehr erfahren
              </MoreLink>
              <MoreLink href="/details">
                Standard More Link
              </MoreLink>
              <MoreLink href="/events">
                Weitere Details
              </MoreLink>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Design-Prinzip:</strong> MoreLinks haben bewusst nur eine Größe, um die Hierarchie
                zu den Button-Komponenten zu wahren und visueller Verwirrung vorzubeugen.
              </p>
            </div>
          </section>

          {/* Custom Buttons */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Custom Buttons</h2>
            <p className="text-gray-600 mb-4">Anpassbare Buttons mit konfigurierbarer Farbe für Rahmen und Text. Hintergrund bleibt immer weiß.</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-800 mb-2">
                <strong>Design-Eigenschaften:</strong>
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• <strong>Standard:</strong> Weißer Hintergrund, Rahmen- und Textfarbe entsprechend hoverColor</li>
                <li>• <strong>Hover:</strong> Sehr heller Hintergrund in der entsprechenden Farbe</li>
                <li>• <strong>Active:</strong> Hellerer Hintergrund und dunklere Textfarbe in der entsprechenden Farbe</li>
                <li>• <strong>Disabled:</strong> Grauer Rahmen und Text, weißer Hintergrund</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Interaktive Beispiele (klicken für Active-State):</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="custom" size="sm" hoverColor="blue-600">
                  Anfrage (Blau)
                </Button>
                <Button variant="custom" size="md" hoverColor="green-600">
                  Angebot (Grün)
                </Button>
                <CustomButton size="lg" hoverColor="purple-600">
                  Custom (Lila)
                </CustomButton>
                <CustomButton size="md" hoverColor="red-600">
                  Dringend (Rot)
                </CustomButton>
                <CustomButton size="md" disabled>
                  Disabled Custom
                </CustomButton>
              </div>
            </div>

            {/* Farbpalette */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Verfügbare Farben:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="custom" size="md" hoverColor="blue-600" className="w-full">
                  Blue
                </Button>
                <Button variant="custom" size="md" hoverColor="green-600" className="w-full">
                  Green
                </Button>
                <Button variant="custom" size="md" hoverColor="purple-600" className="w-full">
                  Purple
                </Button>
                <Button variant="custom" size="md" hoverColor="orange-600" className="w-full">
                  Orange
                </Button>
                <Button variant="custom" size="md" hoverColor="red-600" className="w-full">
                  Red
                </Button>
                <Button variant="custom" size="md" hoverColor="yellow-600" className="w-full">
                  Yellow
                </Button>
                <Button variant="custom" size="md" hoverColor="indigo-600" className="w-full">
                  Indigo
                </Button>
                <Button variant="custom" size="md" hoverColor="pink-600" className="w-full">
                  Pink
                </Button>
              </div>
            </div>

            {/* Börse-Beispiele */}
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Börse-Anwendungsbeispiele:</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="custom" size="md" hoverColor="blue-600">
                  📋 Anfrage
                </Button>
                <Button variant="custom" size="md" hoverColor="green-600">
                  💼 Angebot
                </Button>
                <Button variant="custom" size="md" hoverColor="orange-600">
                  📞 Kontakt
                </Button>
                <Button variant="custom" size="md" hoverColor="red-600">
                  🚨 Dringend
                </Button>
                <Button variant="custom" size="md" hoverColor="purple-600">
                  ⭐ Premium
                </Button>
              </div>
            </div>

            {/* Technische Details */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Technische Implementation:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• CSS Custom Properties für dynamische Farben</li>
                <li>• Automatische Farbpalette basierend auf hoverColor-Prop</li>
                <li>• Standard: border-[var(--border-color)] text-[var(--text-color)]</li>
                <li>• Hover: hover:bg-[var(--hover-bg-color)]</li>
                <li>• Active: active:bg-[var(--active-bg-color)] active:text-[var(--active-text-color)]</li>
              </ul>
            </div>
          </section>

          {/* Usage Examples */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Code-Beispiele</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`// Standard Button
<Button variant="primary" size="md">
  Speichern
</Button>

// Button mit Icon
<Button variant="secondary" size="lg" icon={Settings} iconPosition="left">
  Einstellungen
</Button>

// Custom Button mit Hover-Farbe - Neue Features!
<Button variant="custom" size="md" hoverColor="blue-600">
  Anfrage (Blau mit Active-State)
</Button>

// Börse-Buttons mit verschiedenen Farben
<Button variant="custom" size="md" hoverColor="blue-600">
  📋 Anfrage
</Button>
<Button variant="custom" size="md" hoverColor="green-600">
  💼 Angebot
</Button>
<Button variant="custom" size="md" hoverColor="red-600">
  🚨 Dringend
</Button>

// Convenience Komponente
<CustomButton size="md" hoverColor="purple-600">
  Custom mit Purple Active-State
</CustomButton>`}
              </pre>
            </div>
          </section>

          {/* Fetched Data Display */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Simulierte API-Daten:</h2>
            <div className="bg-gray-100 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}