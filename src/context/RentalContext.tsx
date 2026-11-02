import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  PropertyListing, 
  SearchFilterState, 
  ChatConversation, 
  ChatMessage, 
  ActivePage, 
  Currency, 
  PropertyCategory 
} from '../types/rental';
import { 
  apiFetchProperties, 
  apiInsertProperty, 
  apiUpdateProperty, 
  apiDeleteProperty, 
  apiFetchConversations, 
  apiSendMessage,
  getOrCreateGuestSessionId,
  generateSecureToken,
  isSupabaseConfigured,
  saveSupabaseConfig,
  supabase
} from '../services/supabaseClient';

interface RentalContextType {
  properties: PropertyListing[];
  favorites: string[];
  conversations: ChatConversation[];
  activeConversationId: string | null;
  activePage: ActivePage;
  selectedPropertyId: string | null;
  managementToken: string | null;
  filters: SearchFilterState;
  preferredCurrency: Currency;
  guestSessionId: string;
  isBackendConnected: boolean;
  isLoading: boolean;
  errorNotice: string | null;
  setPreferredCurrency: (c: Currency) => void;
  navigateTo: (page: ActivePage, propertyId?: string | null, token?: string | null) => void;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  postProperty: (data: Omit<PropertyListing, 'id' | 'referenceCode' | 'createdAt' | 'status' | 'ownerManagementToken'>) => Promise<PropertyListing>;
  updatePropertyListing: (id: string, token: string, updates: Partial<PropertyListing>) => Promise<boolean>;
  deletePropertyListing: (id: string, token: string) => Promise<boolean>;
  startChatWithProperty: (property: PropertyListing, initialNote: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  resetFilters: () => void;
  filterProperties: () => PropertyListing[];
  activeConversation: ChatConversation | undefined;
  unreadMessagesCount: number;
  refreshData: () => Promise<void>;
  updateBackendConfig: (url: string, key: string) => void;
  dismissError: () => void;
}

const DEFAULT_FILTERS: SearchFilterState = {
  searchQuery: '',
  country: 'All',
  stateProvince: '',
  city: 'All',
  locality: '',
  category: 'All',
  minRent: '',
  maxRent: '',
  currency: 'All',
  bedrooms: 'Any',
  bathrooms: 'Any',
  furnishing: 'All',
  availability: 'All',
  parking: 'All',
  tenantPreference: 'All',
  petFriendlyOnly: false,
  sortBy: 'latest'
};

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export const RentalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fresh install default: ZERO listings, ZERO fake content
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  
  // Fresh install default: ZERO favourites preloaded
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('renteasy_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fresh install default: ZERO conversations preloaded
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [managementToken, setManagementToken] = useState<string | null>(null);
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>('USD');
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(isSupabaseConfigured());

  const guestSessionId = getOrCreateGuestSessionId();

  // Load real properties and conversations on mount
  const refreshData = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { error: pingError } = await supabase.from('properties').select('id').limit(1);
        setIsBackendConnected(!pingError);
      } else {
        setIsBackendConnected(false);
      }

      const loadedProperties = await apiFetchProperties();
      setProperties(loadedProperties);

      const loadedConversations = await apiFetchConversations(guestSessionId);
      setConversations(loadedConversations);
      if (loadedConversations.length > 0 && !activeConversationId) {
        setActiveConversationId(loadedConversations[0].id);
      }
    } catch (err: any) {
      console.warn('[RentEasy] Load error:', err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Realtime Supabase Subscription for new messages
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as any;
          setConversations(prev => prev.map(conv => {
            if (conv.id === newMsg.conversation_id) {
              const formattedMsg: ChatMessage = {
                id: newMsg.id,
                conversationId: newMsg.conversation_id,
                sender: newMsg.sender_type,
                senderSessionId: newMsg.sender_session_id || '',
                text: newMsg.message_text,
                timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAt: newMsg.created_at
              };
              // avoid duplicate
              if (conv.messages.some(m => m.id === formattedMsg.id)) return conv;
              return {
                ...conv,
                lastMessage: formattedMsg.text,
                lastMessageTimestamp: formattedMsg.timestamp,
                unreadCount: formattedMsg.senderSessionId !== guestSessionId ? conv.unreadCount + 1 : conv.unreadCount,
                messages: [...conv.messages, formattedMsg]
              };
            }
            return conv;
          }));
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [guestSessionId]);

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem('renteasy_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const navigateTo = (page: ActivePage, propertyId: string | null = null, token: string | null = null) => {
    setActivePage(page);
    if (propertyId) setSelectedPropertyId(propertyId);
    if (token) setManagementToken(token);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  // Submit Real Property Listing (Mandatory pending_review status)
  const postProperty = async (
    data: Omit<PropertyListing, 'id' | 'referenceCode' | 'createdAt' | 'status' | 'ownerManagementToken'>
  ): Promise<PropertyListing> => {
    const randomBytes = new Uint8Array(4);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes);
    }
    const codeNum = 100000 + (Math.abs(new DataView(randomBytes.buffer).getInt32(0)) % 900000);
    const newId = generateSecureToken('prop', 12);
    const secretToken = generateSecureToken('mgmt', 32);

    const newListing: PropertyListing = {
      ...data,
      id: newId,
      referenceCode: `RE-${new Date().getFullYear()}-${codeNum}`,
      createdAt: new Date().toISOString(),
      status: 'pending_review', // Strictly starts in pending_review
      ownerManagementToken: secretToken
    };

    const saved = await apiInsertProperty(newListing);
    setProperties(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);
    return saved;
  };

  // Update Property by Owner Token
  const updatePropertyListing = async (
    id: string,
    token: string,
    updates: Partial<PropertyListing>
  ): Promise<boolean> => {
    const success = await apiUpdateProperty(id, token, updates);
    if (success) {
      setProperties(prev => prev.map(p => {
        if (p.id === id && p.ownerManagementToken === token) {
          return { ...p, ...updates, updatedAt: new Date().toISOString() };
        }
        return p;
      }));
    }
    return success;
  };

  // Delete Property by Owner Token
  const deletePropertyListing = async (id: string, token: string): Promise<boolean> => {
    const success = await apiDeleteProperty(id, token);
    if (success) {
      setProperties(prev => prev.filter(p => !(p.id === id && p.ownerManagementToken === token)));
      setFavorites(prev => prev.filter(fId => fId !== id));
    }
    return success;
  };

  // Real Chat Initialization (No automated landlord replies)
  const startChatWithProperty = async (property: PropertyListing, initialNote: string) => {
    if (!initialNote.trim()) {
      throw new Error('Please enter a message for the property owner.');
    }

    const existing = conversations.find(c => c.propertyId === property.id);
    if (existing) {
      setActiveConversationId(existing.id);
      setActivePage('messages');
      await sendMessage(existing.id, initialNote);
      return;
    }

    const newConvId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId: newConvId,
      sender: 'guest',
      senderSessionId: guestSessionId,
      text: initialNote.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    const newConversation: ChatConversation = {
      id: newConvId,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.images[0] || '',
      propertyRent: property.rentAmount,
      propertyCurrency: property.currency,
      propertyCity: property.city,
      ownerName: property.owner.name,
      ownerPhone: `${property.owner.phoneCountryCode} ${property.owner.phone}`,
      ownerWhatsApp: `${property.owner.whatsappCountryCode} ${property.owner.whatsapp}`,
      guestSessionId,
      unreadCount: 0,
      lastMessage: newMsg.text,
      lastMessageTimestamp: newMsg.timestamp,
      messages: [newMsg],
      createdAt: new Date().toISOString()
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConvId);
    setActivePage('messages');

    // Send to backend without any simulated auto-reply
    await apiSendMessage(newConvId, newMsg.text, 'guest', guestSessionId);
  };

  // Send message strictly without fake auto-replies
  const sendMessage = async (conversationId: string, text: string) => {
    if (!text.trim()) return;

    const newMsg = await apiSendMessage(conversationId, text.trim(), 'guest', guestSessionId);

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: text.trim(),
          lastMessageTimestamp: newMsg.timestamp,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const filterProperties = (): PropertyListing[] => {
    return properties.filter(prop => {
      // Must be approved or rented
      if (prop.status !== 'approved' && prop.status !== 'rented') return false;

      // Query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          prop.title.toLowerCase().includes(q) ||
          prop.city.toLowerCase().includes(q) ||
          prop.country.toLowerCase().includes(q) ||
          prop.locality.toLowerCase().includes(q) ||
          prop.category.toLowerCase().includes(q) ||
          prop.bhk.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Country
      if (filters.country !== 'All' && filters.country !== '') {
        if (prop.country.toLowerCase() !== filters.country.toLowerCase()) return false;
      }

      // City
      if (filters.city !== 'All' && filters.city !== '') {
        if (prop.city.toLowerCase() !== filters.city.toLowerCase()) return false;
      }

      // Category
      if (filters.category !== 'All') {
        if (prop.category !== filters.category) return false;
      }

      // Rent
      if (filters.minRent !== '' && prop.rentAmount < Number(filters.minRent)) return false;
      if (filters.maxRent !== '' && prop.rentAmount > Number(filters.maxRent)) return false;

      // Currency
      if (filters.currency !== 'All') {
        if (prop.currency !== filters.currency) return false;
      }

      // Bedrooms
      if (filters.bedrooms !== 'Any') {
        if (prop.bedrooms < Number(filters.bedrooms)) return false;
      }

      // Bathrooms
      if (filters.bathrooms !== 'Any') {
        if (prop.bathrooms < Number(filters.bathrooms)) return false;
      }

      // Furnishing
      if (filters.furnishing !== 'All') {
        if (prop.furnishing !== filters.furnishing) return false;
      }

      // Availability
      if (filters.availability !== 'All') {
        if (prop.availability !== filters.availability) return false;
      }

      // Parking
      if (filters.parking !== 'All') {
        if (prop.parking !== filters.parking) return false;
      }

      // Tenant preference
      if (filters.tenantPreference !== 'All') {
        if (prop.tenantPreference !== 'Any' && prop.tenantPreference !== filters.tenantPreference) {
          return false;
        }
      }

      // Pet Friendly
      if (filters.petFriendlyOnly && !prop.petFriendly) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.rentAmount - b.rentAmount;
      if (filters.sortBy === 'price_desc') return b.rentAmount - a.rentAmount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const updateBackendConfig = (url: string, key: string) => {
    const success = saveSupabaseConfig(url, key);
    setIsBackendConnected(isSupabaseConfigured());
    if (success) {
      refreshData();
    }
  };

  const dismissError = () => setErrorNotice(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <RentalContext.Provider
      value={{
        properties,
        favorites,
        conversations,
        activeConversationId,
        activePage,
        selectedPropertyId,
        managementToken,
        filters,
        preferredCurrency,
        guestSessionId,
        isBackendConnected,
        isLoading,
        errorNotice,
        setPreferredCurrency,
        navigateTo,
        toggleFavorite,
        isFavorite,
        postProperty,
        updatePropertyListing,
        deletePropertyListing,
        startChatWithProperty,
        sendMessage,
        setFilters,
        resetFilters,
        filterProperties,
        activeConversation,
        unreadMessagesCount,
        refreshData,
        updateBackendConfig,
        dismissError
      }}
    >
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
};
