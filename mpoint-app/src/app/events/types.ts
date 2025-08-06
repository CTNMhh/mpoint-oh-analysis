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