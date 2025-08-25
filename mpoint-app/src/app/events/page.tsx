// mpoint\mpoint-app\src\app\events\page.tsx
// Erweiterte Version mit Anzeige der gebuchten/verfügbaren Plätze

"use client";
import {
  EventType,
  EventStatus,
  BookingType,
  EventWithBookingInfo,
  getEventAvailability,
  getAvailabilityColor,
} from "./types";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import EventCreateForm from "./EventCreateForm";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Grid3X3,
  List,
  Users,
} from "lucide-react";

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

// Payment Status Badge Komponente
function PaymentStatusBadge({ status }: { status: string }) {
  const styles = {
    NOT_REQUIRED: "bg-gray-100 text-gray-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    REFUNDED: "bg-blue-100 text-blue-700",
    FAILED: "bg-red-100 text-red-700",
  };

  const labels = {
    NOT_REQUIRED: "Kostenfrei",
    PENDING: "Offen",
    PAID: "Bezahlt",
    REFUNDED: "Erstattet",
    FAILED: "Fehlgeschlagen",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${
        styles[status] || styles.PENDING
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// NEU: Komponente zur Anzeige der Platz-Verfügbarkeit
function PlaceAvailability({ event }: { event: EventWithBookingInfo }) {
  const bookedSpaces = event.bookedSpaces || 0;
  const maxParticipants = event.maxParticipants || 0;
  const availableSpaces = event.availableSpaces || 0;
  const bookingPercentage = event.bookingPercentage || 0;

  // Verwende Helper-Funktion für Farben
  const colors = getAvailabilityColor(bookingPercentage);
  const colorClass = `${colors.textClass} ${colors.bgClass}`;
  const progressBarColor = colors.progressClass;

  if (!maxParticipants) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Badge mit Zahlen */}
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}
      >
        <Users size={14} />
        <span>
          {bookedSpaces} von {maxParticipants} Plätzen
        </span>
        {availableSpaces <= 0 && <span className="ml-1">🔴 AUSGEBUCHT</span>}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${progressBarColor}`}
          style={{ width: `${Math.min(bookingPercentage, 100)}%` }}
        />
      </div>

      {/* Verfügbarkeits-Text */}
      {availableSpaces > 0 && availableSpaces <= 5 && (
        <p className="text-xs text-orange-600 font-semibold">
          ⚠️ Nur noch {availableSpaces}{" "}
          {availableSpaces === 1 ? "Platz" : "Plätze"} verfügbar!
        </p>
      )}
    </div>
  );
}

// Payment Handler (Placeholder)
async function handlePayment(bookingId: string) {
  alert("Payment-Integration kommt bald!");
}

function enrichEventWithBookingInfo(event: EventType) {
  const bookedSpaces = event.bookedCount || 0;
  const maxParticipants = event.maxParticipants || 0;
  const availableSpaces =
    maxParticipants > 0 ? Math.max(0, maxParticipants - bookedSpaces) : 0;
  const bookingPercentage =
    maxParticipants > 0 ? (bookedSpaces / maxParticipants) * 100 : 0;
  const isFullyBooked = availableSpaces === 0 && maxParticipants > 0;
  return {
    ...event,
    bookedSpaces,
    maxParticipants,
    availableSpaces,
    bookingPercentage,
    isFullyBooked,
  };
}

export default function EventsPage() {
  const { status, data: session } = useSession();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "calendar" | "list">(
    "grid"
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [eventBookingCounts, setEventBookingCounts] = useState<
    Record<string, number>
  >({});

  // NEU: Lade Buchungszahlen für alle Events
  useEffect(() => {
    async function fetchEventBookingCounts() {
      try {
        const res = await fetch("/api/events/booking-counts");
        if (res.ok) {
          const data = await res.json();
          setEventBookingCounts(data);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Buchungszahlen:", error);
      }
    }

    if (status === "authenticated") {
      fetchEventBookingCounts();
    }
  }, [status, events]); // Neu laden wenn sich Events ändern

  // Lade alle Events und ergänze Buchungsinformationen
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
    fetchEvents();
  }, []); // <--- nach Buchung hier erneut aufrufen

  // Click-Handler um Jahr-Picker zu schließen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showYearPicker) {
        const target = event.target as HTMLElement;
        if (!target.closest(".year-picker-container")) {
          setShowYearPicker(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showYearPicker]);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/api/auth/signin";
    }
  }, [status]);

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Eigene Events filtern
  const myEvents = events.filter(
    (event) => event.user.email === session?.user?.email
  );

  // Verfügbare Events anderer User
  const availableEvents = events.filter(
    (event) =>
      event.user.email !== session?.user?.email &&
      event.isActive &&
      event.status !== EventStatus.DRAFT
  );

  // Kalender-Funktionen
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getEventsForDate = (date: Date) => {
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    const targetDay = date.getDate();

    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getFullYear() === targetYear &&
        eventDate.getMonth() === targetMonth &&
        eventDate.getDate() === targetDay
      );
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectYear = (year: number) => {
    setCurrentDate((prev) => {
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

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-14 border border-gray-200"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`h-14 border border-gray-200 p-0.5 overflow-hidden ${
            isToday ? "bg-blue-50 border-blue-300" : "bg-white"
          }`}
        >
          <div
            className={`text-xs font-medium mb-0.5 ${
              isToday ? "text-blue-600" : "text-gray-900"
            }`}
          >
            {day}
          </div>
          <div className="space-y-0.5">
            {dayEvents.slice(0, 1).map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block text-xs px-1 py-0.5 bg-red-100 text-red-800 rounded truncate hover:bg-red-200 transition-colors leading-tight"
                title={event.title}
              >
                {event.title.length > 12
                  ? event.title.substring(0, 12) + "..."
                  : event.title}
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

  const visibleEvents = events.filter(
    (event) => event.isActive && event.status !== EventStatus.DRAFT
  );

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-[#e60000]" />
            Events
          </h1>
          <p className="text-gray-600">
            Hier finden Sie alle Informationen zu Ihren Events.
          </p>
        </div>
        <div className="flex justify-end items-center mb-8">
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid3X3 size={16} />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List size={16} />
                Liste
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === "calendar"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Calendar size={16} />
                Kalender
              </button>
            </div>

            <button
              className="bg-[#e60000] text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-all font-medium cursor-pointer"
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
        {viewMode === "calendar" && (
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow p-3 max-w-4xl mx-auto">
              {/* Kalender Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => navigateMonth("prev")}
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

                    {showYearPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto min-w-[80px]">
                        {generateYearOptions().map((year) => (
                          <button
                            key={year}
                            onClick={() => selectYear(year)}
                            className={`block w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                              year === currentDate.getFullYear()
                                ? "bg-blue-50 text-blue-600 font-semibold"
                                : "text-gray-900"
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
                  onClick={() => navigateMonth("next")}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Wochentage */}
              <div className="grid grid-cols-7 gap-0 mb-1">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="p-1 text-center text-xs font-medium text-gray-600 border-b"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Kalendertage */}
              <div className="grid grid-cols-7 gap-0">{renderCalendar()}</div>
            </div>
          </div>
        )}

        {/* Listen-Ansicht */}
        {viewMode === "list" && (
          <div className="flex flex-row gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 basis-1/2">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Meine erstellten Events
                </h2>
                <Calendar className="w-6 h-6 text-[#e60000]" />
              </div>
              <div className="space-y-4">
                {myEvents.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Keine Events verfügbar.
                  </div>
                ) : (
                  myEvents.map((event) => {
                    const enrichedEvent = enrichEventWithBookingInfo(event);
                    return (
                      <div
                        key={event.id}
                        className="flex flex-col rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h2 className="text-xl font-bold mb-2">
                              {event.title}
                              {event.user.email === session?.user?.email ? (
                                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-semibold">
                                  {event.status}
                                </span>
                              ) : event.status === EventStatus.FULL ||
                                event.status === EventStatus.CANCELLED ? (
                                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-semibold">
                                  {event.status}
                                </span>
                              ) : null}
                            </h2>

                            {/* NEU: Platz-Verfügbarkeit in Listen-Ansicht */}
                            <div className="mb-3">
                              <PlaceAvailability event={enrichedEvent} />
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                              <span>
                                📅 {new Date(event.startDate).toLocaleString()}
                                {event.endDate && (
                                  <>
                                    {" "}
                                    – {new Date(event.endDate).toLocaleString()}
                                  </>
                                )}{" "}
                                – {event.location}
                              </span>
                              {event.chargeFree ? (
                                <span className="text-green-700 font-semibold">
                                  ✓ Kostenfrei
                                </span>
                              ) : event.price > 0 ? (
                                <span>💰 {event.price} €</span>
                              ) : null}
                              <span>
                                👤 {event.user.firstName} {event.user.lastName}
                              </span>
                            </div>
                            <p className="text-gray-700 line-clamp-2">
                              {event.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {event.categories.map((cat) => (
                                <span
                                  key={cat}
                                  className="bg-gray-100 text-xs px-2 py-1 rounded"
                                >
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
                    );
                  })
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 basis-1/2">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Verfügbare Events
                </h2>
                <Calendar className="w-6 h-6 text-[#e60000]" />
              </div>
              <div className="space-y-4">
                {availableEvents.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Es gibt aktuell keine verfügbaren Events anderer Nutzer..
                  </div>
                ) : (
                  availableEvents.map((event) => {
                    const enrichedEvent = enrichEventWithBookingInfo(event);
                    return (
                      <div
                        key={event.id}
                        className="flex flex-col rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h2 className="text-xl font-bold mb-2">
                              {event.title}
                              {event.user.email === session?.user?.email ? (
                                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-semibold">
                                  {event.status}
                                </span>
                              ) : event.status === EventStatus.FULL ||
                                event.status === EventStatus.CANCELLED ? (
                                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-semibold">
                                  {event.status}
                                </span>
                              ) : null}
                            </h2>

                            {/* NEU: Platz-Verfügbarkeit in Listen-Ansicht */}
                            <div className="mb-3">
                              <PlaceAvailability event={enrichedEvent} />
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                              <span>
                                📅 {new Date(event.startDate).toLocaleString()}
                                {event.endDate && (
                                  <>
                                    {" "}
                                    – {new Date(event.endDate).toLocaleString()}
                                  </>
                                )}{" "}
                                – {event.location}
                              </span>
                              {event.chargeFree ? (
                                <span className="text-green-700 font-semibold">
                                  ✓ Kostenfrei
                                </span>
                              ) : event.price > 0 ? (
                                <span>💰 {event.price} €</span>
                              ) : null}
                              <span>
                                👤 {event.user.firstName} {event.user.lastName}
                              </span>
                            </div>
                            <p className="text-gray-700 line-clamp-2">
                              {event.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {event.categories.map((cat) => (
                                <span
                                  key={cat}
                                  className="bg-gray-100 text-xs px-2 py-1 rounded"
                                >
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
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Grid-Ansicht */}
        {viewMode === "grid" && (
          <div className="flex flex-row gap-6">
            {/* Meine erstellten Events */}
            <div className="bg-white rounded-xl shadow-sm p-6 basis-1/2">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Meine erstellten Events
                </h2>
                <Calendar className="w-6 h-6 text-[#e60000]" />
              </div>
              <div className="space-y-4">
                {myEvents.length === 0 ? (
                  <p className="text-center text-gray-500 mb-12">
                    Du hast noch keine Events erstellt.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {myEvents.map((event) => {
                      const enrichedEvent = enrichEventWithBookingInfo(event);
                      return (
                        <div
                          key={event.id}
                          className="flex flex-col rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all"
                        >
                          {event.imageUrl && (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="mb-4 h-40 object-cover w-full rounded-t-lg"
                            />
                          )}
                          <h2 className="text-xl font-bold mb-2 px-4">
                            {event.title}
                            {event.user.email === session?.user?.email ? (
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-semibold">
                                {event.status}
                              </span>
                            ) : event.status === EventStatus.FULL ||
                              event.status === EventStatus.CANCELLED ? (
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-semibold">
                                {event.status}
                              </span>
                            ) : null}
                          </h2>

                          {/* NEU: Platz-Verfügbarkeit in Grid-Ansicht */}
                          <div className="mb-3 px-4">
                            <PlaceAvailability event={enrichedEvent} />
                          </div>

                          <div className="text-gray-600 mb-2 px-4">
                            {new Date(event.startDate).toLocaleString()}
                            {event.endDate && (
                              <> – {new Date(event.endDate).toLocaleString()}</>
                            )}{" "}
                            – {event.location}
                          </div>
                          {!event.chargeFree && event.price > 0 ? (
                            <div className="text-gray-700 font-medium mb-2 px-4">
                              Preis:{" "}
                              <span className="font-semibold">
                                {event.price} €
                              </span>
                            </div>
                          ) : event.chargeFree ? (
                            <div className="text-green-700 font-bold mb-2 px-4">
                              ✓ Kostenfrei
                            </div>
                          ) : null}
                          <div className="text-gray-500 text-sm mb-2 px-4">
                            Veranstalter:{" "}
                            <span className="font-semibold">
                              {event.ventType}
                            </span>
                          </div>
                          <div className="mb-4 line-clamp-3 px-4">
                            {event.description}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2 px-4">
                            {event.categories.map((cat) => (
                              <span
                                key={cat}
                                className="bg-gray-100 text-xs px-2 py-1 rounded"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-col mt-8 space-y-2 px-4 pb-2 justify-center">
                            <Link
                              href={`/events/${event.id}`}
                              className="bg-[#e60000] hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all font-medium mb-2 py-4 w-full text-center"
                            >
                              Details & Anmeldung
                            </Link>
                            <Link
                              href={`/events/${event.id}/edit`}
                              className="bg-sky-700 hover:bg-sky-500 text-white px-4 py-2 rounded-xl transition-all font-medium mb-2 py-4 w-full text-center"
                            >
                              Event bearbeiten
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Verfügbare Events anderer User */}
            <div className="bg-white rounded-xl shadow-sm p-6 basis-1/2">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Verfügbare Events
                </h2>
                <Calendar className="w-6 h-6 text-[#e60000]" />
              </div>
              {availableEvents.length === 0 ? (
                <p className="text-center text-gray-500">
                  Es gibt aktuell keine verfügbaren Events anderer Nutzer.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {availableEvents.map((event) => {
                    const enrichedEvent = enrichEventWithBookingInfo(event);
                    return (
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
                        <h2 className="text-xl font-bold mb-2">
                          {event.title}
                          {(event.status === EventStatus.FULL ||
                            event.status === EventStatus.CANCELLED) && (
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-semibold">
                              {event.status}
                            </span>
                          )}
                        </h2>

                        {/* NEU: Platz-Verfügbarkeit für verfügbare Events */}
                        <div className="mb-3">
                          <PlaceAvailability event={enrichedEvent} />
                        </div>

                        <div className="text-gray-600 mb-2">
                          {new Date(event.startDate).toLocaleString()}
                          {event.endDate && (
                            <> – {new Date(event.endDate).toLocaleString()}</>
                          )}{" "}
                          – {event.location}
                        </div>
                        <div className="text-gray-700 font-medium mb-2">
                          Preis:{" "}
                          {event.price === 0 ? (
                            <span className="text-green-700 font-semibold">
                              Kostenlos
                            </span>
                          ) : (
                            <span className="font-semibold">
                              {event.price} €
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 text-sm mb-2">
                          Veranstalter:{" "}
                          <span className="font-semibold">
                            {event.ventType}
                          </span>
                        </div>
                        <div className="mb-4 line-clamp-3">
                          {event.description}
                        </div>
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
                            className={`${
                              event.isFullyBooked
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[rgb(228,25,31)] hover:bg-red-700"
                            } text-white px-4 py-2 rounded transition-colors text-center block`}
                          >
                            {event.isFullyBooked
                              ? "Ausgebucht"
                              : "Details & Anmeldung"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
