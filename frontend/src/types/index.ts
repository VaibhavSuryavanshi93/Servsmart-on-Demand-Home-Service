export type UserRole = 'user' | 'provider' | 'admin';

export interface User {
  _id?: string;
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  phoneNumber?: string;
  address?: string;
  isApproved?: boolean; // For providers
  verified?: boolean;
  createdAt: string;
}

export interface Category {
  _id?: string;
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
}

export interface Service {
  _id?: string;
  id: string;
  providerId: string | User;
  providerName: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  duration: string; // e.g., "1 hour"
  image: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface Booking {
  _id?: string;
  id: string;
  userId: string;
  userName: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  address: string;
  status: BookingStatus;
  rejectionReason?: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  stripeSessionId?: string;
  createdAt: string;
}

export interface Review {
  _id?: string;
  id: string;
  bookingId: string;
  serviceId: string;
  userId: string | User;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  bookingId: string;
  content: string;
  createdAt: string;
}
