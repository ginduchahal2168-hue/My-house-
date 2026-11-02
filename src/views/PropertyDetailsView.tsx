import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Flag, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Calendar, 
  ShieldCheck, 
  Phone, 
  MessageCircle, 
  MessageSquare, 
  CheckCircle2, 
  Image as ImageIcon,
  Copy,
  Check,
  Building,
  Key
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { ImageGalleryModal } from '../components/ImageGalleryModal';
import { ShareModal } from '../components/ShareModal';
import { ReportModal } from '../components/ReportModal';

export const PropertyDetailsView: React.FC = () => {
  const { 
    properties, 
    selectedPropertyId, 
    navigateTo, 
    isFavorite, 
    toggleFavorite,
    startChatWithProperty 
  } = useRental();

  const property = properties.find(p => p.id === selectedPropertyId);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatInquiryText, setChatInquiryText] = useState('');

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Building className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Property not found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          This listing may have been rented or removed by the property owner.
        </p>
        <button
          onClick={() => navigateTo('explore')}
          className="mt-5 px-5 py-2.5 bg-[#167B62] text-white rounded-xl text-xs font-bold"
        >
          Explore All Properties
        </button>
      </div>
    );
  }

  const favorited = isFavorite(property.id);

  const openGallery = (index: number) => {
    if (!property.images || property.images.length === 0) return;
    setGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  const handleCopyPhone = () => {
    const fullPhone = `${property.owner.phoneCountryCode}${property.owner.phone}`;
    navigator.clipboard.writeText(fullPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleWhatsAppClick = () => {
    const text = `Hi ${property.owner.name}, I am contacting you regarding your rental property "${property.title}" (Ref: ${property.referenceCode}) on RentEasy. Is it available for viewing?`;
    const cleanNumber = `${property.owner.whatsappCountryCode}${property.owner.whatsapp}`.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleInitiateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInquiryText.trim()) return;

    await startChatWithProperty(property, chatInquiryText.trim());
    setShowChatModal(false);
  };

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'CA$',
    AUD: 'AU$',
    AED: 'AED '
  };

  const symbol = currencySymbols[property.currency] || '$';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-16">
      {/* Breadcrumb strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => navigateTo('explore')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to listings</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors text-xs font-semibold ${
                favorited
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-rose-500' : ''}`} />
              <span>{favorited ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
              title="Report listing"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Title & Location Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#167B62] uppercase tracking-wide">
              {property.bhk} · {property.category}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">{property.furnishing}</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-400 font-mono">Ref: {property.referenceCode}</span>
            {property.status === 'rented' && (
              <span className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md ml-auto">
                Rented Out
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {property.title}
          </h1>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mt-2">
            <MapPin className="w-4 h-4 text-[#167B62] shrink-0" />
            <span>{property.locality}, {property.city}, {property.country}</span>
          </div>
        </div>

        {/* ========================================================== */}
        {/* IMAGE GALLERY GRID (REAL PHOTOGRAPHS ONLY)                 */}
        {/* ========================================================== */}
        {property.images && property.images.length > 0 ? (
          <div className="relative rounded-3xl overflow-hidden mb-10 shadow-sm border border-slate-200/80 bg-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[320px] sm:h-[420px]">
              <div
                onClick={() => openGallery(0)}
                className="md:col-span-2 h-full cursor-pointer relative group overflow-hidden"
              >
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 h-full">
                {property.images.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => openGallery(idx + 1)}
                    className="relative h-[205px] cursor-pointer group overflow-hidden"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => openGallery(0)}
              className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md hover:bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md border border-slate-200 flex items-center gap-1.5 transition-all"
            >
              <ImageIcon className="w-4 h-4 text-[#167B62]" />
              <span>View all {property.images.length} photos</span>
            </button>
          </div>
        ) : (
          <div className="rounded-3xl p-12 bg-slate-100 text-center mb-10 border border-slate-200 text-slate-400">
            <Building className="w-12 h-12 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs">No photographs provided for this listing.</p>
          </div>
        )}

        {/* ========================================================== */}
        {/* MAIN DETAILS & STICKY CONTACT SPLIT                        */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* Specs Bar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <Bed className="w-5 h-5 text-[#167B62] mx-auto mb-1" />
                <div className="text-base font-extrabold text-slate-900">{property.bedrooms} Beds</div>
                <div className="text-[11px] text-slate-500">Bedrooms</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <Bath className="w-5 h-5 text-[#167B62] mx-auto mb-1" />
                <div className="text-base font-extrabold text-slate-900">{property.bathrooms} Baths</div>
                <div className="text-[11px] text-slate-500">Bathrooms</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <Maximize2 className="w-5 h-5 text-[#167B62] mx-auto mb-1" />
                <div className="text-base font-extrabold text-slate-900">
                  {property.areaSqFt ? property.areaSqFt : '—'}
                </div>
                <div className="text-[11px] text-slate-500">Square Feet</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <Calendar className="w-5 h-5 text-[#167B62] mx-auto mb-1" />
                <div className="text-base font-extrabold text-slate-900">{property.availability}</div>
                <div className="text-[11px] text-slate-500">Availability</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-4">About this property</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
                {property.floorNumber && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Floor</span>
                    <span className="font-semibold text-slate-800">Floor {property.floorNumber} {property.totalFloors ? `of ${property.totalFloors}` : ''}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[11px]">Parking</span>
                  <span className="font-semibold text-slate-800">{property.parking}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tenant Preference</span>
                  <span className="font-semibold text-slate-800">{property.tenantPreference}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pet Policy</span>
                  <span className="font-semibold text-slate-800">{property.petFriendly ? 'Pet Friendly' : 'No Pets'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Security Deposit</span>
                  <span className="font-semibold text-slate-800">
                    {property.securityDeposit > 0 ? `${symbol}${property.securityDeposit.toLocaleString()}` : 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Maintenance Fee</span>
                  <span className="font-semibold text-slate-800">
                    {property.maintenanceMonthly > 0 ? `${symbol}${property.maintenanceMonthly.toLocaleString()}/mo` : 'Included'}
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Amenities & Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#167B62] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================== */}
          {/* RIGHT: PRICING & 3 PROMINENT CONTACT MODES                 */}
          {/* ========================================================== */}
          <div className="lg:col-span-1 sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl">
              <div className="pb-5 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    {symbol}{property.rentAmount.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ {property.rentPeriod}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#167B62]" />
                  <span>100% Free · Direct Landlord Contact</span>
                </div>
              </div>

              {/* Owner Info */}
              <div className="py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#167B62] font-bold text-lg flex items-center justify-center shrink-0">
                  {property.owner.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{property.owner.name}</h4>
                  <p className="text-[11px] text-slate-400">Property Landlord</p>
                  {property.owner.responseTime && (
                    <p className="text-[11px] text-[#167B62] font-medium">Responds {property.owner.responseTime}</p>
                  )}
                </div>
              </div>

              {/* 3 PROMINENT CONTACT BUTTONS */}
              <div className="pt-5 space-y-3">
                {/* 1. CALL OWNER */}
                <button
                  onClick={() => setShowCallModal(true)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 stroke-[2.2]" />
                  <span>Call Owner</span>
                </button>

                {/* 2. WHATSAPP OWNER */}
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 stroke-[2.2]" />
                  <span>WhatsApp Owner</span>
                </button>

                {/* 3. CHAT WITH OWNER */}
                <button
                  onClick={() => setShowChatModal(true)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#167B62] font-bold text-xs sm:text-sm border border-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                  <span>Chat on RentEasy (Free)</span>
                </button>
              </div>

              {/* Owner manage shortcut */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => navigateTo('manage')}
                  className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center justify-center gap-1 mx-auto"
                >
                  <Key className="w-3 h-3" />
                  <span>Manage this listing as owner</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Dialog */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#167B62] flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Direct Landlord Contact</h3>
            <p className="text-xs text-slate-500 mt-1">
              Call <span className="font-semibold text-slate-800">{property.owner.name}</span> regarding Ref: {property.referenceCode}
            </p>

            <div className="my-5 p-3 bg-slate-100 rounded-2xl flex items-center justify-between border border-slate-200">
              <span className="text-sm font-extrabold text-slate-900 tracking-wider">
                {property.owner.phoneCountryCode} {property.owner.phone}
              </span>
              <button
                onClick={handleCopyPhone}
                className="p-1.5 bg-white text-slate-700 hover:text-[#167B62] rounded-lg border border-slate-200 shadow-xs"
              >
                {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${property.owner.phoneCountryCode}${property.owner.phone}`}
                className="py-2.5 px-4 rounded-xl bg-[#167B62] text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Dial Now</span>
              </a>
              <button
                onClick={() => setShowCallModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Chat Inquiry Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-base font-bold text-slate-900">Send Inquiry to Landlord</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your message will be sent directly to <span className="font-semibold text-slate-800">{property.owner.name}</span>.
            </p>

            <form onSubmit={handleInitiateChat} className="mt-4 space-y-3">
              <textarea
                rows={3}
                required
                value={chatInquiryText}
                onChange={(e) => setChatInquiryText(e.target.value)}
                placeholder="Hi, I am interested in viewing this property. When is it available for an inspection?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#167B62] focus:bg-white"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChatModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#167B62] hover:bg-[#126550] text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={property.images}
        initialIndex={galleryIndex}
        title={property.title}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        property={property}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        property={property}
      />
    </div>
  );
};
