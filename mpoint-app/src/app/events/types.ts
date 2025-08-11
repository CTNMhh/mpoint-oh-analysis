export enum EventStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  FULL = "FULL",
  CANCELLED = "CANCELLED",
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
  chargeFree: boolean;  // NEU: Kostenfrei-Flag
  categories: string[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: EventStatus;
  isActive?: boolean; // <-- statt active
  calendarLinks?: {
    google?: string;
    ics?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type BookingType = {
  id: string;
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  spaces: number;
  comment?: string;

  // NEU: Preis-Informationen
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
  };
};