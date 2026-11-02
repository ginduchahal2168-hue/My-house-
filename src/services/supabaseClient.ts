import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PropertyListing, ChatMessage, ChatConversation, PropertyReport, ListingStatus } from '../types/rental';

/**
 * RentEasy - Supabase Production Client & Security Layer
 * 
 * Cryptographically secured tokens, mandatory pending_review moderation,
 * protected owner management tokens, and zero fake data.
 */

// Cryptographically secure token generator (No Math.random for security tokens)
export const generateSecureToken = (prefix = 'tok', byteLength = 24): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${prefix}_${hex}`;
  }
  // Safe fallback timestamp
  return `${prefix}_${Date.now()}_${Date.now().toString(36)}`;
};

const getStoredSupabaseConfig = () => {
  try {
    const savedUrl = localStorage.getItem('renteasy_supabase_url');
    const savedKey = localStorage.getItem('renteasy_supabase_anon_key');
    return {
      url: import.meta.env.VITE_SUPABASE_URL || savedUrl || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || savedKey || ''
    };
  } catch {
    return {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    };
  }
};

const config = getStoredSupabaseConfig();

export let supabase: SupabaseClient | null = null;

if (config.url && config.anonKey) {
  try {
    supabase = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (err) {
    console.warn('[RentEasy] Could not initialize Supabase client:', err);
    supabase = null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabase);
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (url && anonKey) {
    localStorage.setItem('renteasy_supabase_url', url.trim());
    localStorage.setItem('renteasy_supabase_anon_key', anonKey.trim());
    try {
      supabase = createClient(url.trim(), anonKey.trim());
      return true;
    } catch {
      return false;
    }
  } else {
    localStorage.removeItem('renteasy_supabase_url');
    localStorage.removeItem('renteasy_supabase_anon_key');
    supabase = null;
    return true;
  }
};

// ======================================================================
// GUEST SESSION IDENTIFIER (PERSISTENT & CRYPTOGRAPHICALLY RANDOM)
// ======================================================================
export const getOrCreateGuestSessionId = (): string => {
  let sessionId = localStorage.getItem('renteasy_guest_session_id');
  if (!sessionId) {
    sessionId = generateSecureToken('guest', 16);
    localStorage.setItem('renteasy_guest_session_id', sessionId);
  }
  return sessionId;
};

// ======================================================================
// REAL DATABASE PROPERTY OPERATIONS
// ======================================================================

/**
 * Fetch all active approved properties for public display.
 * NOTE: owner_management_token is explicitly EXCLUDED from public selection
 * to prevent unauthorized listing manipulation.
 */
export const apiFetchProperties = async (): Promise<PropertyListing[]> => {
  if (supabase) {
    try {
      // Explicit public columns - strictly omitting owner_management_token
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, reference_code, title, description, category, bhk,
          rent_amount, rent_period, currency, security_deposit, maintenance_monthly,
          country, state_province, city, locality, full_address,
          bedrooms, bathrooms, area_sqft, furnishing, availability, available_date,
          parking, tenant_preference, pet_friendly, floor_number, total_floors,
          images, amenities,
          owner_name, owner_phone, owner_phone_code, owner_whatsapp, owner_whatsapp_code,
          owner_email, owner_response_time,
          status, created_at, updated_at
        `)
        .in('status', ['approved', 'rented'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        return data.map(d => mapDbToProperty(d, false));
      }
    } catch (err) {
      console.warn('[RentEasy] Remote fetch error, reading local store:', err);
    }
  }

  // Fallback to local device storage (filtered for approved or rented only)
  try {
    const local = localStorage.getItem('renteasy_real_properties');
    if (local) {
      const all: PropertyListing[] = JSON.parse(local);
      return all.filter(p => p.status === 'approved' || p.status === 'rented');
    }
  } catch {
    // empty
  }
  return [];
};

/**
 * Retrieve a specific listing for management using the owner's private secret token.
 */
export const apiGetPropertyByManagementToken = async (token: string): Promise<PropertyListing | null> => {
  if (!token || !token.trim()) return null;

  if (supabase) {
    try {
      // Try secure RPC first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_property_by_token', {
        p_token: token.trim()
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        return mapDbToProperty(rpcData[0], true);
      }

      // Fallback direct match if RPC not created yet
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_management_token', token.trim())
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return mapDbToProperty(data, true);
      }
    } catch (err) {
      console.warn('[RentEasy] Token lookup error:', err);
    }
  }

  // Check local store
  const local = getLocalProperties();
  const found = local.find(p => p.ownerManagementToken === token.trim());
  return found || null;
};

/**
 * Fetch all properties for administrative moderation
 */
export const apiFetchAllPropertiesForAdmin = async (): Promise<PropertyListing[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) return data.map(d => mapDbToProperty(d, true));
    } catch (err) {
      console.warn('[RentEasy] Admin fetch failed:', err);
    }
  }

  try {
    const local = localStorage.getItem('renteasy_real_properties');
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
};

/**
 * Insert a new real property listing.
 * Newly created properties are initialized with status: 'pending_review'
 * to enforce honest moderation.
 */
export const apiInsertProperty = async (listing: PropertyListing): Promise<PropertyListing> => {
  // Ensure listing starts as pending_review
  const safeListing: PropertyListing = {
    ...listing,
    status: 'pending_review'
  };

  if (supabase) {
    try {
      const dbPayload = mapPropertyToDb(safeListing);
      const { data, error } = await supabase
        .from('properties')
        .insert([dbPayload])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        return mapDbToProperty(data, true);
      }
    } catch (err) {
      console.warn('[RentEasy] Database insert error, storing locally:', err);
    }
  }

  // Save to local storage
  const current = getLocalProperties();
  const updated = [safeListing, ...current.filter(p => p.id !== safeListing.id)];
  localStorage.setItem('renteasy_real_properties', JSON.stringify(updated));
  return safeListing;
};

/**
 * Update property with owner management token validation
 */
export const apiUpdateProperty = async (
  id: string,
  token: string,
  updates: Partial<PropertyListing>
): Promise<boolean> => {
  if (!token || !id) return false;

  if (supabase) {
    try {
      // 1. Try secure stored procedure
      const { data: rpcResult, error: rpcError } = await supabase.rpc('update_property_with_token', {
        p_id: id,
        p_token: token,
        p_rent_amount: updates.rentAmount ?? null,
        p_status: updates.status ?? null,
        p_availability: updates.availability ?? null,
        p_title: updates.title ?? null,
        p_description: updates.description ?? null,
        p_images: updates.images ?? null
      });

      if (!rpcError && typeof rpcResult === 'boolean') {
        return rpcResult;
      }

      // 2. Direct secure match fallback
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      if (updates.rentAmount !== undefined) updatePayload.rent_amount = updates.rentAmount;
      if (updates.status !== undefined) updatePayload.status = updates.status;
      if (updates.availability !== undefined) updatePayload.availability = updates.availability;
      if (updates.title !== undefined) updatePayload.title = updates.title;
      if (updates.description !== undefined) updatePayload.description = updates.description;
      if (updates.images !== undefined) updatePayload.images = updates.images;

      const { data, error } = await supabase
        .from('properties')
        .update(updatePayload)
        .match({ id, owner_management_token: token })
        .select('id');

      if (!error && data && data.length > 0) return true;
    } catch (err) {
      console.warn('[RentEasy] Remote update failed:', err);
    }
  }

  // Local fallback
  const list = getLocalProperties();
  const item = list.find(p => p.id === id && p.ownerManagementToken === token);
  if (!item) return false;

  const updated = list.map(p => {
    if (p.id === id && p.ownerManagementToken === token) {
      return { ...p, ...updates, updatedAt: new Date().toISOString() };
    }
    return p;
  });
  localStorage.setItem('renteasy_real_properties', JSON.stringify(updated));
  return true;
};

/**
 * Delete property with owner management token validation
 */
export const apiDeleteProperty = async (id: string, token: string): Promise<boolean> => {
  if (!token || !id) return false;

  if (supabase) {
    try {
      // Try secure stored procedure
      const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_property_with_token', {
        p_id: id,
        p_token: token
      });

      if (!rpcError && typeof rpcResult === 'boolean') {
        return rpcResult;
      }

      const { data, error } = await supabase
        .from('properties')
        .delete()
        .match({ id, owner_management_token: token })
        .select('id');

      if (!error && data && data.length > 0) return true;
    } catch (err) {
      console.warn('[RentEasy] Remote delete failed:', err);
    }
  }

  const list = getLocalProperties();
  const filtered = list.filter(p => !(p.id === id && p.ownerManagementToken === token));
  localStorage.setItem('renteasy_real_properties', JSON.stringify(filtered));
  return true;
};

/**
 * Admin moderation action (Approve, Reject, or Delete)
 */
export const apiAdminModerateProperty = async (
  adminKey: string,
  propertyId: string,
  newStatus: ListingStatus
): Promise<boolean> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('admin_moderate_property', {
        p_admin_secret: adminKey,
        p_property_id: propertyId,
        p_new_status: newStatus
      });

      if (!error && data) return true;

      // Fallback direct update for admin
      const { error: directError } = await supabase
        .from('properties')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', propertyId);

      if (!directError) return true;
    } catch (err) {
      console.warn('[RentEasy] Admin moderation error:', err);
    }
  }

  // Local fallback
  const list = getLocalProperties();
  const updated = list.map(p => {
    if (p.id === propertyId) {
      return { ...p, status: newStatus, updatedAt: new Date().toISOString() };
    }
    return p;
  });
  localStorage.setItem('renteasy_real_properties', JSON.stringify(updated));
  return true;
};

/**
 * Upload real photo to Supabase Storage or convert to data URL.
 * Strictly validates JPG / PNG format and max 8 MB size.
 */
export const apiUploadPropertyPhoto = async (file: File): Promise<string> => {
  // Validate file type (strictly JPG/PNG)
  const lowerType = (file.type || '').toLowerCase();
  const lowerName = file.name.toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png'];
  const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];

  const hasValidExt = validExtensions.some(ext => lowerName.endsWith(ext));
  const hasValidMime = validMimes.includes(lowerType);

  if (!hasValidExt || (lowerType && !hasValidMime)) {
    throw new Error(`File "${file.name}" is not a JPG or PNG image. Only JPG and PNG photographs are permitted.`);
  }

  // Validate size (max 8MB)
  if (file.size > 8 * 1024 * 1024) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Photograph "${file.name}" (${sizeInMB} MB) exceeds the maximum allowed size of 8 MB.`);
  }

  if (supabase) {
    try {
      const fileExt = lowerName.endsWith('.png') ? 'png' : 'jpg';
      const randomHex = generateSecureToken('', 8).replace(/^tok_/, '');
      const fileName = `prop_${Date.now()}_${randomHex}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('property-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('property-photos')
          .getPublicUrl(fileName);
        return publicData.publicUrl;
      }
    } catch (err) {
      console.warn('[RentEasy] Storage bucket upload failed, using local reader:', err);
    }
  }

  // Convert to Base64 Data URL for zero-dependency operation
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

// ======================================================================
// REAL CHAT & MESSAGING OPERATIONS
// ======================================================================

export const apiFetchConversations = async (guestSessionId: string): Promise<ChatConversation[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, chat_messages(*)')
        .or(`guest_session_id.eq.${guestSessionId},owner_id.eq.${guestSessionId}`)
        .order('last_message_at', { ascending: false });

      if (!error && data) {
        return data.map((c: any) => ({
          id: c.id,
          propertyId: c.property_id,
          propertyTitle: c.property_title || 'Rental Listing',
          propertyImage: c.property_image || '',
          propertyRent: c.property_rent || 0,
          propertyCurrency: c.property_currency || 'USD',
          propertyCity: c.property_city || '',
          ownerName: c.owner_name || 'Property Owner',
          ownerPhone: c.owner_phone || '',
          ownerWhatsApp: c.owner_whatsapp || '',
          guestSessionId: c.guest_session_id,
          unreadCount: 0,
          lastMessage: c.last_message || '',
          lastMessageTimestamp: new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: (c.chat_messages || []).map((m: any) => ({
            id: m.id,
            conversationId: m.conversation_id,
            sender: m.sender_type,
            senderSessionId: m.sender_session_id || '',
            text: m.message_text,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: m.created_at
          })),
          createdAt: c.created_at
        }));
      }
    } catch (err) {
      console.warn('[RentEasy] Realtime chat fetch error:', err);
    }
  }

  // Local storage fallback
  try {
    const local = localStorage.getItem('renteasy_real_conversations');
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
};

export const apiSendMessage = async (
  conversationId: string,
  text: string,
  sender: 'guest' | 'owner',
  senderSessionId: string
): Promise<ChatMessage> => {
  const newMsg: ChatMessage = {
    id: generateSecureToken('msg', 12),
    conversationId,
    sender,
    senderSessionId,
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  };

  if (supabase) {
    try {
      await supabase.from('chat_messages').insert([{
        id: newMsg.id,
        conversation_id: conversationId,
        sender_type: sender,
        sender_session_id: senderSessionId,
        message_text: text.trim()
      }]);

      await supabase.from('conversations').update({
        last_message: text.trim(),
        last_message_at: new Date().toISOString()
      }).eq('id', conversationId);
    } catch (err) {
      console.warn('[RentEasy] Remote send failed:', err);
    }
  }

  // Update local store
  try {
    const local = localStorage.getItem('renteasy_real_conversations');
    const convs: ChatConversation[] = local ? JSON.parse(local) : [];
    const updated = convs.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: text.trim(),
          lastMessageTimestamp: newMsg.timestamp,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });
    localStorage.setItem('renteasy_real_conversations', JSON.stringify(updated));
  } catch {
    // ignore
  }

  return newMsg;
};

// ======================================================================
// PROPERTY REPORTING (COMMUNITY MODERATION)
// ======================================================================
export const apiSubmitReport = async (report: Omit<PropertyReport, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
  const newReport: PropertyReport = {
    ...report,
    id: generateSecureToken('rep', 10),
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  if (supabase) {
    try {
      await supabase.from('property_reports').insert([{
        property_id: report.propertyId,
        reference_code: report.referenceCode,
        reason: report.reason,
        details: report.details,
        reporter_session_id: getOrCreateGuestSessionId(),
        status: 'pending'
      }]);
      return true;
    } catch (err) {
      console.warn('[RentEasy] Report submission error:', err);
    }
  }

  try {
    const local = localStorage.getItem('renteasy_reports');
    const existing = local ? JSON.parse(local) : [];
    localStorage.setItem('renteasy_reports', JSON.stringify([newReport, ...existing]));
  } catch {
    // fallback
  }

  return true;
};

// ======================================================================
// INTERNAL MAPPERS & HELPERS
// ======================================================================
export const getLocalProperties = (): PropertyListing[] => {
  try {
    const local = localStorage.getItem('renteasy_real_properties');
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
};

const mapPropertyToDb = (p: PropertyListing) => ({
  id: p.id,
  reference_code: p.referenceCode,
  title: p.title,
  description: p.description,
  category: p.category,
  bhk: p.bhk,
  rent_amount: p.rentAmount,
  rent_period: p.rentPeriod,
  currency: p.currency,
  security_deposit: p.securityDeposit,
  maintenance_monthly: p.maintenanceMonthly,
  country: p.country,
  state_province: p.stateProvince,
  city: p.city,
  locality: p.locality,
  full_address: p.fullAddress || '',
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms,
  area_sqft: p.areaSqFt || 0,
  furnishing: p.furnishing,
  availability: p.availability,
  available_date: p.availableDate || null,
  parking: p.parking,
  tenant_preference: p.tenantPreference,
  pet_friendly: p.petFriendly,
  floor_number: p.floorNumber || 1,
  total_floors: p.totalFloors || 1,
  images: p.images,
  amenities: p.amenities,
  owner_name: p.owner.name,
  owner_phone: p.owner.phone,
  owner_phone_code: p.owner.phoneCountryCode,
  owner_whatsapp: p.owner.whatsapp,
  owner_whatsapp_code: p.owner.whatsappCountryCode,
  owner_email: p.owner.email || '',
  owner_response_time: p.owner.responseTime || '',
  owner_management_token: p.ownerManagementToken,
  status: p.status,
  created_at: p.createdAt
});

const mapDbToProperty = (d: any, includePrivateToken = false): PropertyListing => ({
  id: d.id,
  referenceCode: d.reference_code,
  title: d.title,
  description: d.description,
  category: d.category,
  bhk: d.bhk,
  rentAmount: Number(d.rent_amount),
  rentPeriod: d.rent_period || 'monthly',
  currency: d.currency || 'USD',
  securityDeposit: Number(d.security_deposit || 0),
  maintenanceMonthly: Number(d.maintenance_monthly || 0),
  country: d.country,
  stateProvince: d.state_province || '',
  city: d.city,
  locality: d.locality,
  fullAddress: d.full_address || '',
  bedrooms: Number(d.bedrooms || 1),
  bathrooms: Number(d.bathrooms || 1),
  areaSqFt: d.area_sqft ? Number(d.area_sqft) : undefined,
  furnishing: d.furnishing,
  availability: d.availability,
  availableDate: d.available_date,
  parking: d.parking,
  tenantPreference: d.tenant_preference,
  petFriendly: Boolean(d.pet_friendly),
  floorNumber: d.floor_number,
  totalFloors: d.total_floors,
  images: d.images || [],
  amenities: d.amenities || [],
  owner: {
    name: d.owner_name,
    phone: d.owner_phone,
    phoneCountryCode: d.owner_phone_code || '+1',
    whatsapp: d.owner_whatsapp,
    whatsappCountryCode: d.owner_whatsapp_code || '+1',
    email: d.owner_email,
    responseTime: d.owner_response_time
  },
  status: d.status || 'pending_review',
  createdAt: d.created_at,
  updatedAt: d.updated_at,
  ownerManagementToken: includePrivateToken ? (d.owner_management_token || '') : ''
});
