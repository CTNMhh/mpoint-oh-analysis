"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type EventType = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location: string;
  ventType: string;
  price: number;
  categories: string[];
  organizer?: string;
  calendarLinks?: any;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  console.log(session, "User ID from session");
  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      const res = await fetch(`/api/events/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      } else {
        setEvent(null);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [params.id]);
    // Nicht eingeloggt: Hinweis & Login-Button
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Anmeldung erforderlich
          </h2>
          <p className="mb-6 text-gray-600">
            Bitte loggen Sie sich ein, um die Events zu sehen und zu erstellen.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-[rgb(228,25,31)] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Zum Login
          </a>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </main>
    );
  }

  if (!event) return notFound();

  // Automatische Werte aus der Session
  const fullName = session?.user ? `${session.user.firstName} ${session.user.lastName}` : "";
  const userEmail = session?.user?.email || "";

  return (
    <main className="min-h-screen pt-30 bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-[rgb(228,25,31)] hover:text-white transition-colors font-semibold shadow"
        >
          <span className="text-xl">&larr;</span> Zurück zu Events
        </Link>
        <div className="flex flex-col md:flex-row items-center mb-8 gap-8">
          <h1 className="text-4xl font-extrabold mb-6 md:mb-0 md:w-1/2 text-[rgb(228,25,31)]">
            {event.title}
          </h1>
          {event.imageUrl && (
            <div className="md:w-1/2 w-full flex justify-center">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="rounded-xl h-40 w-40 object-cover shadow-lg border border-gray-200"
              />
            </div>
          )}
        </div>
        <div className="w-full bg-gray-50 rounded-xl px-6 py-4 mb-6 shadow">
          <div className="font-semibold text-gray--700 mb-2">
            Veranstalter: {event.ventType}
          </div>
          <div className="text-gray-700 font-medium mb-2">
            Datum: {new Date(event.startDate).toLocaleString()}
          </div>
          <div className="text-gray-700 font-medium">
            Ort: {event.location}
          </div>
          <div className="text-gray-700 mt-3 font-medium">
            Preis:{" "}
            {event.price === 0 ? (
              <span className="text-green-700 font-semibold">Kostenlos</span>
            ) : (
              <span className="font-semibold">{event.price} €</span>
            )}
          </div>
        </div>
        {event.calendarLinks && (
          <div className="mb-6 flex items-center gap-4">
            <span className="font-semibold">Zum Kalender hinzufügen:</span>
            {event.calendarLinks.google && (
              <a
                href={event.calendarLinks.google}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-red-600"
              >
                <Calendar size={18} /> Google Kalender
              </a>
            )}
            {event.calendarLinks.ics && (
              <a
                href={event.calendarLinks.ics}
                download="event.ics"
                className="flex items-center gap-1 text-red-600"
              >
                <Calendar size={18} /> ICS herunterladen
              </a>
            )}
          </div>
        )}
        <div className="mb-10">
          <label className="block text-base font-semibold text-gray-600 mb-2">
            Beschreibung
          </label>
          <div className="text-gray-800 text-lg leading-relaxed bg-gray-100 rounded-xl p-4">
            {event.description}
          </div>
        </div>
        
        {event.price === 0 && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSuccess(null);
              setError(null);
              
              // Speichere die Form-Referenz bevor der async Call startet
              const form = e.currentTarget;
              const formData = new FormData(form);
              
              const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  eventId: event.id,
                  name: formData.get("name"),
                  email: formData.get("email"),
                  spaces: Number(formData.get("spaces") || 1),
                  comment: formData.get("comment"),
                  userId: session?.user?.id || null,
                }),
              });
              
              if (res.ok) {
                setSuccess("Anmeldung erfolgreich!");
                
                // Reset das Formular mit der gespeicherten Referenz
                form.reset();
                
                // Optional: Setze die Standardwerte wieder ein
                const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
                const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
                const spacesInput = form.querySelector('input[name="spaces"]') as HTMLInputElement;
                
                if (nameInput && session?.user) nameInput.value = fullName;
                if (emailInput && session?.user) emailInput.value = userEmail;
                if (spacesInput) spacesInput.value = "1";
              } else {
                const err = await res.json();
                setError(err.error || "Fehler bei der Anmeldung.");
              }
            }}
            className="bg-gray-50 rounded-xl p-6 mt-8 space-y-4"
          >
            {success && <div className="text-green-700 bg-green-50 rounded px-4 py-2 mb-2">{success}</div>}
            {error && <div className="text-red-700 bg-red-50 rounded px-4 py-2 mb-2">{error}</div>}
            <h3 className="font-semibold text-lg mb-2">
              {session?.user ? 'Schnellanmeldung' : 'Jetzt kostenlos anmelden'}
            </h3>
            
            {session?.user ? (
              <>
                {/* Angemeldet: Zeige vorausgefüllte, aber editierbare Felder */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-700">Angemeldet als: <strong>{fullName}</strong></p>
                </div>
                <input 
                  name="name" 
                  required 
                  defaultValue={fullName}
                  placeholder="Ihr Name" 
                  className="w-full border rounded px-3 py-2 bg-gray-100" 
                />
                <input 
                  name="email" 
                  required 
                  type="email" 
                  defaultValue={userEmail}
                  placeholder="Ihre E-Mail" 
                  className="w-full border rounded px-3 py-2 bg-gray-100" 
                />
              </>
            ) : (
              <>
                {/* Nicht angemeldet: Zeige leere Felder */}
                <input 
                  name="name" 
                  required 
                  placeholder="Ihr Name" 
                  className="w-full border rounded px-3 py-2" 
                />
                <input 
                  name="email" 
                  required 
                  type="email" 
                  placeholder="Ihre E-Mail" 
                  className="w-full border rounded px-3 py-2" 
                />
              </>
            )}
            
            <input 
              name="spaces" 
              type="number" 
              min={1} 
              defaultValue={1} 
              className="w-full border rounded px-3 py-2" 
              placeholder="Anzahl Plätze" 
            />
            <textarea 
              name="comment" 
              placeholder="Kommentar (optional)" 
              className="w-full border rounded px-3 py-2" 
            />
            <button 
              type="submit" 
              className="bg-[rgb(228,25,31)] text-white px-6 py-3 rounded-lg hover:bg-green-700 w-full font-semibold transition-colors"
            >
              Anmelden
            </button>
          </form>
        )}
        
        {event.price > 0 && (
          <button className="bg-[rgb(228,25,31)] text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold w-full text-lg shadow-lg">
            Jetzt anmelden (€{event.price})
          </button>
        )}
      </div>
    </main>
  );
}