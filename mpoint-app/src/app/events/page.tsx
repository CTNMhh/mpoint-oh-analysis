"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import EventCreateForm from "./EventCreateForm";
import { ChevronLeft, ChevronRight, Calendar, Grid3X3, List } from "lucide-react";

type EventType = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  location: string;
  ventType: string;
  price: number;
  categories: string[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

type BookingType = {
  id: string;
  spaces: number;
  event: EventType;
};

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function EventsPage() {
  const { status, data: session } = useSession();
  const [events, setEvents] = useState<EventType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'list'>('grid');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    location: "",
    ventType: "",
    price: 0,
    categories: "",
    calendarGoogle: "",
    calendarIcs: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Lade alle Events
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
      setLoading(false);
    }
    if (status === "authenticated") {
      fetchEvents();
    }
  }, [status]);

  // Lade alle Buchungen des Users
  useEffect(() => {
    async function fetchBookings() {
      const res = await fetch("/api/my-bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    }
    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status]);

  // 🆕 Click-Handler um Jahr-Picker zu schließen wenn außerhalb geklickt wird
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showYearPicker) {
        const target = event.target as HTMLElement;
        if (!target.closest('.year-picker-container')) {
          setShowYearPicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showYearPicker]);

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </main>
    );
  }

  // Eigene Events filtern
  const myEvents = events.filter(
    (event) => event.user.email === session?.user?.email
  );

  // Kalender-Funktionen
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Montag = 0
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD Format
    return events.filter(event => {
      // 🔧 FIX: Timezone-korrektes Datum extrahieren
      const eventDate = new Date(event.startDate);
      // Verwende lokale Timezone statt UTC
      const localEventDateStr = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
        .toISOString().split('T')[0];
      return localEventDateStr === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectYear = (year: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearPicker(false);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Leere Zellen für Tage vor dem ersten Tag des Monats
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 border border-gray-200"></div>);
    }

    // Tage des Monats
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div key={day} className={`h-14 border border-gray-200 p-0.5 overflow-hidden ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
          <div className={`text-xs font-medium mb-0.5 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-0.5">
            {dayEvents.slice(0, 1).map(event => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block text-xs px-1 py-0.5 bg-red-100 text-red-800 rounded truncate hover:bg-red-200 transition-colors leading-tight"
                title={event.title}
              >
                {event.title.length > 12 ? event.title.substring(0, 12) + '...' : event.title}
              </Link>
            ))}
            {dayEvents.length > 1 && (
              <div className="text-xs text-gray-500 leading-tight">
                +{dayEvents.length - 1}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categories: form.categories.split(",").map((c) => c.trim()),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Fehler beim Erstellen.");
      } else {
        setShowForm(false);
        setForm({
          title: "",
          imageUrl: "",
          startDate: "",
          endDate: "",
          location: "",
          ventType: "",
          price: 0,
          categories: "",
          calendarGoogle: "",
          calendarIcs: "",
          description: "",
        });
        // Events neu laden
        const data = await res.json();
        setEvents((prev) => [data, ...prev]);
      }
    } catch (err) {
      setError("Fehler beim Erstellen.");
    }
    setCreating(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br pt-40 from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Events</h1>
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 size={16} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar size={16} />
                Kalender
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} />
                Liste
              </button>
            </div>

            <button
              className="bg-[rgb(228,25,31)] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-semibold"
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "Abbrechen" : "Event erstellen"}
            </button>
          </div>
        </div>

        {showForm && (
          <EventCreateForm
            onCreated={(event) => {
              setShowForm(false);
              setEvents((prev) => [event, ...prev]);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Kalender-Ansicht */}
        {viewMode === 'calendar' && (
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow p-3 max-w-4xl mx-auto">
              {/* Kalender Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-900">
                    {MONTHS[currentDate.getMonth()]}
                  </span>
                  <div className="relative year-picker-container">
                    <button
                      onClick={() => setShowYearPicker(!showYearPicker)}
                      className="text-base font-bold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    >
                      {currentDate.getFullYear()}
                    </button>

                    {/* Jahr-Dropdown */}
                    {showYearPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto min-w-[80px]">
                        {generateYearOptions().map(year => (
                          <button
                            key={year}
                            onClick={() => selectYear(year)}
                            className={`block w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                              year === currentDate.getFullYear() ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-900'
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Wochentage */}
              <div className="grid grid-cols-7 gap-0 mb-1">
                {WEEKDAYS.map(day => (
                  <div key={day} className="p-1 text-center text-xs font-medium text-gray-600 border-b">
                    {day}
                  </div>
                ))}
              </div>

              {/* Kalendertage */}
              <div className="grid grid-cols-7 gap-0">
                {renderCalendar()}
              </div>
            </div>
          </div>
        )}

        {/* Listen-Ansicht */}
        {viewMode === 'list' && (
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Alle Events</h2>
              </div>
              <div className="space-y-0">
                {events.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Keine Events verfügbar.
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            <span>📅 {new Date(event.startDate).toLocaleString()}</span>
                            <span>📍 {event.location}</span>
                            <span>💰 {event.price === 0 ? 'Kostenlos' : `${event.price} €`}</span>
                            <span>👤 {event.user.firstName} {event.user.lastName}</span>
                          </div>
                          <p className="text-gray-700 line-clamp-2">{event.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {event.categories.map((cat) => (
                              <span key={cat} className="bg-gray-100 text-xs px-2 py-1 rounded">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Link
                          href={`/events/${event.id}`}
                          className="ml-4 bg-[rgb(228,25,31)] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Meine gebuchten Events */}
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Meine gebuchten Events
        </h2>
        {bookings.length === 0 ? (
          <div className="text-gray-500 mb-12">Du hast noch keine Events gebucht.</div>
        ) : (
          <div className="mb-12">
            <table className="w-full border rounded-xl overflow-hidden shadow bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Titel</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Datum</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Ort</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Preis</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Plätze</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Details</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4">{booking.event.title}</td>
                    <td className="py-2 px-4">
                      {new Date(booking.event.startDate).toLocaleString()}
                    </td>
                    <td className="py-2 px-4">{booking.event.location}</td>
                    <td className="py-2 px-4">
                      {booking.event.price === 0
                        ? <span className="text-green-700 font-semibold">Kostenlos</span>
                        : <span className="font-semibold">{booking.event.price} €</span>
                      }
                    </td>
                    <td className="py-2 px-4">{booking.spaces}</td>
                    <td className="py-2 px-4">
                      <Link
                        href={`/events/${booking.event.id}`}
                        className="text-blue-600 underline"
                      >
                        Event ansehen
                      </Link>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        onClick={async () => {
                          await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
                          // Buchungen neu laden
                          const res = await fetch("/api/my-bookings");
                          if (res.ok) {
                            const data = await res.json();
                            setBookings(data);
                          }
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Abmelden
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Meine erstellten Events - nur in Grid-Ansicht */}
        {viewMode === 'grid' && (
          <>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
              Meine erstellten Events
            </h1>
            {myEvents.length === 0 ? (
              <p className="text-center text-gray-500">
                Du hast noch keine Events erstellt.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {myEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow p-6 flex flex-col"
                  >
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="rounded-lg mb-4 h-40 object-cover"
                      />
                    )}
                    <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                    <div className="text-gray-600 mb-2">
                      {new Date(event.startDate).toLocaleString()} – {event.location}
                    </div>
                    <div className="text-gray-700 font-medium mb-2">
                      Preis:{" "}
                      {event.price === 0 ? (
                        <span className="text-green-700 font-semibold">Kostenlos</span>
                      ) : (
                        <span className="font-semibold">{event.price} €</span>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm mb-2">
                      Veranstalter:{" "}
                      <span className="font-semibold">{event.ventType}</span>
                    </div>
                    <div className="mb-4 line-clamp-3">{event.description}</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {event.categories.map((cat) => (
                        <span
                          key={cat}
                          className="bg-gray-100 text-xs px-2 py-1 rounded"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto">
                      <Link
                        href={`/events/${event.id}`}
                        className="bg-[rgb(228,25,31)] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-center block"
                      >
                        Details & Anmeldung
                      </Link>
                    </div>
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="mt-2 inline-block px-4 py-2 bg-yellow-400 text-gray-900 font-semibold shadow hover:bg-yellow-500 transition-colors text-center"
                    >
                      Event bearbeiten
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}