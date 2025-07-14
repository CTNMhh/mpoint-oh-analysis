"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import Link from "next/link";

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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </main>
    );
  }

  if (!event) return notFound();

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
        <button className="bg-[rgb(228,25,31)] text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold w-full text-lg shadow-lg">
          Jetzt anmelden
        </button>
      </div>
    </main>
  );
}