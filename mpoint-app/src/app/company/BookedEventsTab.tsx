import { useEffect, useState } from "react";
import { BookingType } from "../events/types";
import PaymentStatusBadge from "./PaymentStatusBadge"; // relativer Pfad!
import Link from "next/link";

export default function BookedEventsTab({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBookings() {
    setLoading(true);
    const res = await fetch(`/api/bookings?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!userId) return;
    fetchBookings();
  }, [userId]);

  async function handleDeleteBooking(bookingId: string) {
    if (!confirm("Buchung wirklich stornieren?")) return;
    const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
    if (res.ok) {
      fetchBookings(); // Jetzt funktioniert es!
    } else {
      alert("Stornierung fehlgeschlagen!");
    }
  }

  if (loading) return <div className="py-8 text-center">Lädt...</div>;
  if (bookings.length === 0) return <div className="py-8 text-gray-500">Keine gebuchten Events gefunden.</div>;

  return (
    <div className="mb-12">
      <table className="w-full border rounded-xl overflow-hidden shadow bg-white text-xs">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase leading-tight">
            <th className="py-2 px-2 text-left">Event</th>
            <th className="py-2 px-2 text-left">Datum</th>
            <th className="py-2 px-2 text-left">Ort</th>
            <th className="py-2 px-2 text-center">Plätze</th>
            <th className="py-2 px-2 text-right">Preis</th>
            <th className="py-2 px-2 text-right">Gesamt</th>
            <th className="py-2 px-2 text-center">Status</th>
            <th className="py-2 px-2 text-center">Zahlung</th>
            <th className="py-2 px-2 text-center">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="py-2 px-2 border-b truncate max-w-[120px]">{booking.event?.title}</td>
              <td className="py-2 px-2 border-b">{new Date(booking.event?.startDate).toLocaleDateString()}</td>
              <td className="py-2 px-2 border-b truncate max-w-[80px]">{booking.event?.location}</td>
              <td className="py-2 px-2 border-b text-center">{booking.spaces}</td>
              <td className="py-2 px-2 border-b text-right">{booking.pricePerSpace} €</td>
              <td className="py-2 px-2 border-b text-right">{booking.totalAmount} €</td>
              <td className="py-2 px-2 border-b text-center">
                <span>{booking.bookingStatus}</span>
              </td>
              <td className="py-2 px-2 border-b text-center">
                <PaymentStatusBadge status={booking.paymentStatus} />
              </td>
              <td className="py-4 px-6 border-b text-center">
                <div className="flex gap-1 flex-wrap justify-center">
                  <Link href={`/events/${booking.event?.id}`} className="text-blue-600 underline text-xs">
                    Details
                  </Link>
                  {booking.bookingStatus !== "CANCELLED" && (
                    <>
                      {booking.paymentStatus === "PENDING" && booking.totalAmount > 0 && (
                        <button
                          onClick={() => handlePayment(booking.id)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                        >
                          Bezahlen
                        </button>
                      )}
                      {(booking.bookingStatus === "PENDING" || booking.bookingStatus === "COMPLETED") && (
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                        >
                          Stornieren
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}