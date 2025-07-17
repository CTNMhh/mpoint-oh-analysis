"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProgressBar from "../company/ProgressBar"; // Assuming ProgressBar is in the same directory
import Link from "next/link";
import {
  User,
  Calendar,
  MessageCircle,
  TrendingUp,
  Bell,
  Search,
  Plus,
  Users,
  Building2,
  Target,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import MatchingList from "./MatchingList";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

type UserType = {
  anrede: string;
  firstName: string;
  lastName: string;
  // add other user properties as needed
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  type BookingType = {
    id: string | number;
    event: {
      title: string;
      startDate: string;
      // add other event properties as needed
    };
    // add other booking properties as needed
  };

  const [bookedEvents, setBookedEvents] = useState<BookingType[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Redirect wenn nicht eingeloggt
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Benutzerdaten laden
  useEffect(() => {
    async function fetchUser() {
      if (status !== "authenticated") return;

      try {
        const res = await fetch("/api/user");
        const data = await res.json();

        if (res.ok) {
          setUser(data);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Benutzerdaten:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [status]);

  useEffect(() => {
    async function fetchBookings() {
      const res = await fetch("/api/my-bookings");
      if (res.ok) {
        const data = await res.json();
        setBookedEvents(data);
      }
    }
    fetchBookings();
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setAllEvents(data);
      }
    }
    fetchEvents();
  }, []);

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)] mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt Dashboard...</p>
        </div>
      </div>
    );
  }

  // Wenn nicht eingeloggt
  if (status === "unauthenticated") {
    return null; // Redirect läuft bereits
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Willkommen zurück{user ? `, ${user.anrede} ${user.firstName} ${user.lastName}` : ''}!
          </h1>
          <p className="text-gray-600">
            Hier ist Ihr persönliches Dashboard mit allen wichtigen Informationen und Aktivitäten.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[rgb(228,25,31)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meine Events</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Calendar className="w-8 h-8 text-[rgb(228,25,31)]" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nachrichten</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Netzwerk</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <MatchingList limit={5} />

            {/* Alle Events als Slider */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Alle Events</h2>
                <div className="flex gap-2">
                  <button ref={prevRef} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button ref={nextRef} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <Swiper
                modules={[Navigation]}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }}
                onInit={(swiper) => {
                  // @ts-ignore
                  swiper.params.navigation.prevEl = prevRef.current;
                  // @ts-ignore
                  swiper.params.navigation.nextEl = nextRef.current;
                  swiper.navigation.init();
                  swiper.navigation.update();
                }}
                spaceBetween={16}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                style={{ minHeight: 320 }}
              >
                {allEvents.map((event) => (
                  <SwiperSlide key={event.id}>
                    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center h-full">
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <div className="w-full">
                        <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                        <p className="text-gray-500 text-sm mb-1">
                          {new Date(event.startDate).toLocaleString()}
                        </p>
                        <Link
                          href={`/events/${event.id}`}
                          className="inline-block mt-3 px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium text-center"
                        >
                          Details ansehen
                        </Link>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
              <div className="space-y-3">
                <Link
                  href="/events/create"
                  className="flex items-center space-x-3 p-3 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Neues Event erstellen</span>
                </Link>


                <Link
                  href="/company"
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 text-gray-600" />
                  <span>Unternehmensprofil</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Anstehende Events</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((event) => (
                  <div key={event} className="border-l-4 border-[rgb(228,25,31)] pl-3">
                    <p className="text-sm font-medium text-gray-900">
                      Business Networking München
                    </p>
                    <p className="text-xs text-gray-500">15. Juli 2025, 18:00</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
              <Link
                href="/company"
                className="text-lg font-semibold text-[rgb(228,25,31)] mb-2 hover:underline flex items-center gap-2"
              >
                Profil vervollständigen
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <ProgressBar bgClassName="bg-white" showSuggestions={false} />
            </div>

            {/* Meine gebuchten Events */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Meine gebuchten Events</h2>
              {bookedEvents.length === 0 ? (
                <p className="text-gray-500">Keine Buchungen gefunden.</p>
              ) : (
                <ul className="space-y-2">
                  {bookedEvents.map((booking) => (
                    <li key={booking.id} className="border-l-4 border-green-500 pl-3">
                      <span className="font-bold">{booking.event.title}</span>
                      <span className="ml-2 text-gray-500">{new Date(booking.event.startDate).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>


            <div className="bg-white rounded-xl shadow-sm p-6">


              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Letzte Aktivitäten</h2>
                <button className="text-[rgb(228,25,31)] hover:text-red-700 text-sm font-medium">
                  Alle anzeigen
                </button>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-[rgb(228,25,31)] rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        Neues Event "Business Networking München" wurde erstellt
                      </p>
                      <p className="text-xs text-gray-500">vor 2 Stunden</p>
                    </div>
                  </div>
                ))}

              </div>
            </div>


          </div>
        </div>


      </div>
    </main>
  );
}