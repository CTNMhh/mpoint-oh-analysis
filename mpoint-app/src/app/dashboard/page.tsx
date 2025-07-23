"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProgressBar from "../company/ProgressBar"; // Assuming ProgressBar is in the same directory
import Link from "next/link";
import {
  Activity,
  Calendar,
ArrowDownRight,
ArrowUpRight,
  BarChart3,
  Plus,
  Users,
  
  ArrowRight,
  Target,
  MapPin,
  BookOpen,
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
  const [gaugeValue, setGaugeValue] = useState(0);
  const [countdown, setCountdown] = useState("");


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
  const leadImageUrl = "/news-0.jpg";

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTimeout(() => setGaugeValue(74), 500);
  }, []);

    useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, []);
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
        <div className="mb-8 bg-wahite rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Willkommen zurück{user ? `, ${user.anrede} ${user.firstName} ${user.lastName}` : ''}!
          </h1>
          <p className="text-gray-600">
            Hier ist Ihr persönliches Dashboard mit allen wichtigen Informationen und Aktivitäten.
          </p>
        </div>

     

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
                    <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Aktuelle News</h2>
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Lead Article */}
            <article className="lg:col-span-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group" onClick={() => alert('Leitartikel: Digitale Transformation im Mittelstand')}>
              <div className="h-64 relative overflow-hidden">
                {leadImageUrl ? (
                  <img
                    src={leadImageUrl}
                    alt="Digitale Transformation"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                    }}
                  ></div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-black"></div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#e60000] transition-colors">
                  Digitale Transformation: Mittelstand investiert Rekordsummen in KI und Automatisierung
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>23. Juli 2025</span>
                  <span>•</span>
                  <span>Von Dr. Maria Schmidt</span>
                  <span>•</span>
                  <span>10 Min. Lesezeit</span>
                </div>
                <p className="text-gray-600 line-clamp-3">
                  Eine neue Studie zeigt: Deutsche Mittelständler investieren 2025 so viel wie nie zuvor in digitale Technologien. 
                  Besonders KI-Lösungen und Automatisierungsprozesse stehen im Fokus. Die Investitionen sollen die Wettbewerbsfähigkeit 
                  sichern und neue Geschäftsmodelle ermöglichen...
                </p>
              </div>
            </article>

            {/* Regular Articles */}
            <div className="space-y-4">
              <NewsItem 
                date="23. Juli 2025" 
                title="Neue Förderprogramme für KMU in NRW beschlossen" 
                imageUrl="/news-1.jpg"
                onClick={() => alert('News: Neue Förderprogramme 2025')}
              />
              <NewsItem 
                date="22. Juli 2025"
                imageUrl="/news-2.jpg"
                title="Erfolgreiches Business Networking Event mit 200 Teilnehmern" 
                onClick={() => alert('News: Netzwerk-Event Erfolg')}
              />
              <NewsItem 
                date="21. Juli 2025"
                imageUrl="/news-3.jpg"
                title="Deutsche Exporte erreichen neues Allzeithoch" 
                onClick={() => alert('News: Export-Boom')}
              />
              <NewsItem 
                date="20. Juli 2025"
                imageUrl="/news-4.jpg"
                title="NRW wird zum Startup-Hub: 15 neue Tech-Unternehmen gegründet" 
                onClick={() => alert('News: Startup-Förderung')}
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="#all-news" className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all">
              Alle News anzeigen <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>



              <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Events Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Kommende Events</h3>
              <Calendar className="w-6 h-6 text-[#e60000]" />
            </div>
            
            <div className="space-y-4">
              {(allEvents.slice(0, 4)).map(event => (
                <EventItem
                  key={event.id}
                  day={new Date(event.startDate).getDate().toString().padStart(2, "0")}
                  month={new Date(event.startDate).toLocaleString("de-DE", { month: "short" }).toUpperCase()}
                  title={event.title}
                  location={event.location || ""}
                  onClick={() => alert(`Event: ${event.title}`)}
                />
              ))}
            </div>

            <div className="mt-6 text-center">
              <a href="#events" className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all">
                Alle Events anzeigen <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Articles Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Neue Fachartikel</h3>
              <BookOpen className="w-6 h-6 text-[#e60000]" />
            </div>
            
            <div className="space-y-4">
              <ArticleItem 
                category="Digitalisierung" 
                title="KI-Einsatz im deutschen Mittelstand: Chancen und Herausforderungen"
                author="Dr. Thomas Schmidt"
                readTime="5 Min."
                onClick={() => alert('Artikel: KI im Mittelstand')}
              />
              <ArticleItem 
                category="Nachhaltigkeit" 
                title="Nachhaltige Lieferketten aufbauen: Ein Leitfaden"
                author="Prof. Julia Müller"
                readTime="8 Min."
                onClick={() => alert('Artikel: Nachhaltige Lieferketten')}
              />
              <ArticleItem 
                category="Management" 
                title="Remote Leadership: Best Practices für hybride Teams"
                author="Lisa Weber"
                readTime="6 Min."
                onClick={() => alert('Artikel: Remote Leadership')}
              />
            </div>

            <div className="mt-6 text-center">
              <a href="#articles" className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all">
                Alle Artikel anzeigen <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>




            {/* Alle Events als Slider 
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
            */}
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

                <Link
                  href="/netzwerk"
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Netzwerk</span>
                </Link>

                <Link
                  href="/Matches"
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 text-green-600" />
                  <span>Matches</span>
                </Link>
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
   <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Wirtschaftswetter</h2>
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Barometer */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                Wirtschaftsstimmung Index
              </h3>
              <p className="text-sm text-gray-500 mb-6">Multifaktorielle Analyse der Wirtschaftslage</p>
              
              <div className="relative inline-block">
                <svg width="200" height="120" viewBox="0 0 200 120">
                  {/* Background arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  {/* Value arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#e60000"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray={`${gaugeValue * 2.51} 251`}
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Center text */}
                  <text x="100" y="90" textAnchor="middle" className="fill-gray-900 text-3xl font-bold">
                    {gaugeValue}
                  </text>
                </svg>
              </div>
              
              <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                Optimistisch
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-4 px-4">
                <span>Pessimistisch</span>
                <span>Neutral</span>
                <span>Optimistisch</span>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Letztes Update: 23. Juli 2025
              </p>
            </div>

            {/* Historical Values */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Historische Werte</h3>
              
              <div className="space-y-4 mb-6">
                <HistoricalValue label="Jetzt" value={74} status="Optimistisch" />
                <HistoricalValue label="Gestern" value={72} status="Optimistisch" />
                <HistoricalValue label="Letzte Woche" value={70} status="Optimistisch" />
                <HistoricalValue label="Letzter Monat" value={47} status="Neutral" neutral />
              </div>

              {/* Economic Indicators */}
              <div className="grid grid-cols-2 gap-3">
                <IndicatorCard label="BIP-Prognose" value="+2,3%" trend="up" />
                <IndicatorCard label="Geschäftsklima" value="108,5" trend="up" />
                <IndicatorCard label="Export-Index" value="+4,7%" trend="up" />
                <IndicatorCard label="Inflation" value="2,1%" trend="down" />
              </div>
            </div>

            {/* Next Update */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Nächstes Update</h3>
              <p className="text-gray-600 mb-4">Das nächste Update erfolgt in:</p>
              <div className="text-3xl font-bold text-[#e60000] font-mono mb-8">
                {countdown}
              </div>
              
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-3">Faktoren im Index:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    BIP-Entwicklung
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Geschäftsklimaindex
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Exportzahlen
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Arbeitsmarktdaten
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Inflationsrate
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Investitionsvolumen
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a href="#wirtschaftsanalyse" className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all">
              Detaillierte Wirtschaftsanalyse <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

      </div>
    </main>
  );
function NewsItem({ date, title, imageUrl, onClick }: { date: string; title: string; imageUrl?: string; onClick: () => void }) {
  return (
    <article 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex gap-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-lg flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}
          ></div>
        )}
        <div>
          <div className="text-sm text-gray-500 mb-1">{date}</div>
          <h4 className="font-semibold text-gray-900 group-hover:text-[#e60000] transition-colors line-clamp-2">
            {title}
          </h4>
        </div>
      </div>
    </article>
  );
}


function EventItem({ day, month, title, location, onClick }: { day: string; month: string; title: string; location: string; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="bg-[#e60000] text-white rounded-lg p-3 text-center flex-shrink-0">
        <div className="text-2xl font-bold">{day}</div>
        <div className="text-xs uppercase">{month}</div>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 group-hover:text-[#e60000] transition-colors">{title}</h4>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <MapPin className="w-3 h-3" />
          {location}
        </div>
      </div>
    </div>
  );
}

function ArticleItem({ category, title, author, readTime, onClick }: { category: string; title: string; author: string; readTime: string; onClick: () => void }) {
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Digitalisierung': return 'bg-blue-100 text-blue-800';
      case 'Nachhaltigkeit': return 'bg-green-100 text-green-800';
      case 'Management': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(category)} mb-2`}>
        {category}
      </span>
      <h4 className="font-semibold text-gray-900 group-hover:text-[#e60000] transition-colors mb-2">{title}</h4>
      <div className="text-sm text-gray-500">
        Von {author} • {readTime} Lesezeit
      </div>
    </div>
  );
}

function HistoricalValue({ label, value, status, neutral }: { label: string; value: number; status: string; neutral?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`inline-block px-3 py-1 rounded-lg font-bold ${neutral ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}>
          {value}
        </span>
        <span className={`text-sm ${neutral ? 'text-gray-600' : 'text-green-600'}`}>{status}</span>
      </div>
    </div>
  );
}

function IndicatorCard({ label, value, trend }: { label: string; value: string; trend: 'up' | 'down' }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-between h-32">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600">{label}</span>
        {trend === 'up' ? (
          <ArrowUpRight className="w-4 h-4 text-green-600" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-600" />
        )}
      </div>
      <div className="font-bold text-gray-900 text-xl">{value}</div>
      <div className="mt-2">
        {/* Trendlinie */}
        {trend === "up" ? (
          <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
            <polyline
              points="0,20 20,16 40,18 60,12 80,8"
              stroke="green"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        ) : (
          <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
            <polyline
              points="0,8 20,12 40,16 60,18 80,20"
              stroke="red"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
}