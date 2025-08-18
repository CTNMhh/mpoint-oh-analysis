// mpoint\mpoint-app\src\app\events\types.ts
// Erweiterte Event Types mit Booking-Informationen und Helper-Funktionen

export enum EventStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  FULL = "FULL",
  CANCELLED = "CANCELLED",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export type EventType = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  location: string;
  ventType: string;
  price: number;
  chargeFree: boolean;
  maxParticipants?: number;  // NEU: Optional da alte Events das vielleicht nicht haben
  bookedCount?: number;       // NEU: Anzahl gebuchter Plätze (aus DB)
  categories: string[];
  user: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: EventStatus;
  isActive?: boolean;
  calendarLinks?: {
    google?: string;
    ics?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

// NEU: Erweiterter Event-Typ mit Buchungsinformationen
export type EventWithBookingInfo = EventType & {
  bookedSpaces: number;      // Aktuell gebuchte Plätze (berechnet)
  availableSpaces: number;   // Verfügbare Plätze (berechnet)
  bookingPercentage: number; // Auslastung in Prozent
  isFullyBooked: boolean;    // Schnell-Check ob ausgebucht
};

export type BookingType = {
  id: string;
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  spaces: number;
  comment?: string;
  bookingStatus: BookingStatus; // <--- Typisiert!

  // Preis-Informationen
  pricePerSpace: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  paymentMethod?: string;
  paidAt?: string;
  refundedAmount?: number;
  refundedAt?: string;

  createdAt: string;
  updatedAt?: string;

  event: {
    id: string;
    title: string;
    startDate: string;
    location: string;
    price: number;
    maxParticipants?: number;  // NEU: Für Anzeige in Buchungsübersicht
  };
};

// NEU: Helper Functions für Event-Status
export const getEventAvailability = (event: EventType): EventWithBookingInfo => {
  const maxParticipants = event.maxParticipants || 0;
  const bookedSpaces = event.bookedCount || 0;
  const availableSpaces = Math.max(0, maxParticipants - bookedSpaces);
  const bookingPercentage = maxParticipants > 0 ? (bookedSpaces / maxParticipants) * 100 : 0;

  return {
    ...event,
    bookedSpaces,
    availableSpaces,
    bookingPercentage,
    isFullyBooked: availableSpaces === 0 && maxParticipants > 0
  };
};

// NEU: Helper für Farb-Klassen basierend auf Auslastung
export const getAvailabilityColor = (percentage: number): {
  textClass: string;
  bgClass: string;
  progressClass: string;
} => {
  if (percentage >= 100) {
    return {
      textClass: 'text-red-600',
      bgClass: 'bg-red-50',
      progressClass: 'bg-red-500'
    };
  } else if (percentage >= 75) {
    return {
      textClass: 'text-orange-600',
      bgClass: 'bg-orange-50',
      progressClass: 'bg-orange-500'
    };
  } else if (percentage >= 50) {
    return {
      textClass: 'text-yellow-600',
      bgClass: 'bg-yellow-50',
      progressClass: 'bg-yellow-500'
    };
  } else {
    return {
      textClass: 'text-green-600',
      bgClass: 'bg-green-50',
      progressClass: 'bg-green-500'
    };
  }
};

// NEU: Event-Typ Labels (für Hamburg/M-POINT)
export const EventTypeLabels: Record<string, string> = {
  'Main-Event': '🎯 Main-Event',
  'Gruppen-Treffen': '👥 Gruppen-Treffen',
  'Themen-Treffen': '💡 Themen-Treffen',
  'Business-Matching': '🤝 Business-Matching',
  'Networking': '🔗 Networking',
  'Workshop': '🛠️ Workshop',
  'Seminar': '📚 Seminar',
  'Konferenz': '🎤 Konferenz',
  'Mentoring': '🧑‍🏫 Mentoring',
  'Online': '💻 Online-Event',
  'Hybrid': '🔄 Hybrid-Event'
};

// NEU: Event-Größen Kategorien
export const getEventSizeCategory = (maxParticipants: number): {
  label: string;
  icon: string;
  description: string;
} => {
  if (maxParticipants <= 10) {
    return {
      label: 'Kleines Event',
      icon: '🏠',
      description: 'Ideal für intensive Workshops und persönlichen Austausch'
    };
  } else if (maxParticipants <= 30) {
    return {
      label: 'Mittleres Event',
      icon: '🏢',
      description: 'Perfekt für Gruppen-Treffen und Themen-Workshops'
    };
  } else if (maxParticipants <= 100) {
    return {
      label: 'Großes Event',
      icon: '🏛️',
      description: 'Gut für Networking-Events und Konferenzen'
    };
  } else if (maxParticipants <= 200) {
    return {
      label: 'Main-Event',
      icon: '🏟️',
      description: 'Großveranstaltung in Hamburg'
    };
  } else {
    return {
      label: 'Mega-Event',
      icon: '🌟',
      description: `Großveranstaltung für ${maxParticipants} Personen`
    };
  }
};