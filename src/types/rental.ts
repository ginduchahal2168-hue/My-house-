export type PropertyCategory =
  | 'Single Rooms'
  | 'Shared Rooms'
  | 'Studio Apartments'
  | '1 BHK'
  | '2 BHK'
  | '3 BHK'
  | '4 BHK'
  | 'Houses'
  | 'Apartments'
  | 'Villas'
  | 'PG Accommodation'
  | 'Hostels'
  | 'Shops'
  | 'Offices'
  | 'Commercial Properties';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'AED' | 'JPY';

export type RentPeriod = 'monthly' | 'weekly' | 'yearly' | 'daily';

export type FurnishingStatus = 'Fully Furnished' | 'Semi-Furnished' | 'Unfurnished';

export type TenantPreference = 'Family' | 'Bachelor' | 'Student' | 'Any';

export type AvailabilityOption = 'Immediate' | 'Within 15 Days' | 'Next Month';

export type ParkingOption = 'None' | 'Bike Only' | 'Car Only' | 'Car & Bike Covered';

export type ListingStatus = 'pending_review' | 'approved' | 'rejected' | 'rented' | 'expired';

export interface PropertyListing {
  id: string;
  referenceCode: string; // e.g. RE-2026-8492
  title: string;
  description: string;
  category: PropertyCategory;
  bhk: string; // e.g. "Studio", "1 BHK", "2 BHK", "Villa", "Commercial"
  rentAmount: number;
  rentPeriod: RentPeriod;
  currency: Currency;
  securityDeposit: number;
  maintenanceMonthly: number;
  country: string;
  stateProvince: string;
  city: string;
  locality: string;
  fullAddress?: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt?: number;
  furnishing: FurnishingStatus;
  availability: AvailabilityOption;
  availableDate?: string;
  parking: ParkingOption;
  tenantPreference: TenantPreference;
  petFriendly: boolean;
  floorNumber?: number;
  totalFloors?: number;
  images: string[];
  amenities: string[];
  owner: {
    name: string;
    phone: string;
    phoneCountryCode: string;
    whatsapp: string;
    whatsappCountryCode: string;
    email?: string;
    responseTime?: string;
  };
  status: ListingStatus;
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
  ownerManagementToken: string; // Secure token generated for the owner to manage their listing
}

export interface SearchFilterState {
  searchQuery: string;
  country: string;
  stateProvince: string;
  city: string;
  locality: string;
  category: PropertyCategory | 'All';
  minRent: number | '';
  maxRent: number | '';
  currency: Currency | 'All';
  bedrooms: number | 'Any';
  bathrooms: number | 'Any';
  furnishing: FurnishingStatus | 'All';
  availability: AvailabilityOption | 'All';
  parking: ParkingOption | 'All';
  tenantPreference: TenantPreference | 'All';
  petFriendlyOnly: boolean;
  sortBy: 'latest' | 'price_asc' | 'price_desc';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'guest' | 'owner';
  senderSessionId: string;
  text: string;
  timestamp: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyRent: number;
  propertyCurrency: Currency;
  propertyCity: string;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsApp: string;
  guestSessionId: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTimestamp: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface PropertyReport {
  id: string;
  propertyId: string;
  referenceCode: string;
  reason: string;
  details?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'actioned';
}

export type ActivePage = 
  | 'home' 
  | 'explore' 
  | 'details' 
  | 'post' 
  | 'messages' 
  | 'favorites' 
  | 'manage' 
  | 'admin';
