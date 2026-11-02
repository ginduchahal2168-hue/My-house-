import React, { useState } from 'react';
import { Heart, MapPin, Bed, Bath, Maximize2, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { PropertyListing } from '../types/rental';
import { useRental } from '../context/RentalContext';

interface PropertyCardProps {
  property: PropertyListing;
  layout?: 'grid' | 'list';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, layout = 'grid' }) => {
  const { isFavorite, toggleFavorite, navigateTo } = useRental();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const favorited = isFavorite(property.id);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images.length <= 1) return;
    setActiveImageIndex(prev => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images.length <= 1) return;
    setActiveImageIndex(prev => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
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

  const currentImage = property.images && property.images.length > 0 
    ? property.images[activeImageIndex] || property.images[0] 
    : null;

  if (layout === 'list') {
    return (
      <div 
        onClick={() => navigateTo('details', property.id)}
        className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col md:flex-row"
      >
        {/* Left: Image */}
        <div className="relative md:w-80 h-56 md:h-auto shrink-0 overflow-hidden bg-slate-100">
          {currentImage && !imageError ? (
            <img
              src={currentImage}
              alt={property.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-6 text-center">
              <Home className="w-10 h-10 mb-2 stroke-[1.5]" />
              <span className="text-xs font-semibold text-slate-600">{property.category}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">{property.city}</span>
            </div>
          )}

          {/* Rented Tag */}
          {property.status === 'rented' && (
            <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
              Rented Out
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            aria-label="Save property"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all shadow-sm active:scale-90"
          >
            <Heart className={`w-4 h-4 ${favorited ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>

          {/* Multi-image indicators */}
          {property.images && property.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                aria-label="Previous photo"
                className="opacity-0 group-hover:opacity-100 absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-800 shadow transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextImage}
                aria-label="Next photo"
                className="opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-800 shadow transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Right: Info */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#167B62] uppercase tracking-wide">
                {property.bhk} · {property.category}
              </span>
              <span className="text-xs text-slate-500">
                {property.furnishing}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-[#167B62] transition-colors">
              {property.title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{property.locality}, {property.city}, {property.country}</span>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
              {property.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-600 mt-3.5 pt-3 border-t border-slate-100">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-slate-400" />
                  {property.bedrooms} Beds
                </span>
              )}
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                {property.bathrooms} Baths
              </span>
              {property.areaSqFt && (
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                  {property.areaSqFt} sq.ft
                </span>
              )}
              <span className="text-emerald-700 font-medium">
                Available: {property.availability}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div>
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {currencySymbols[property.currency] || property.currency}{formatPrice(property.rentAmount)}
              </span>
              <span className="text-xs text-slate-500 ml-1">/ {property.rentPeriod}</span>
            </div>

            <button
              onClick={() => navigateTo('details', property.id)}
              className="px-4 py-2 text-xs font-semibold text-[#167B62] bg-emerald-50 hover:bg-[#167B62] hover:text-white rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div
      onClick={() => navigateTo('details', property.id)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {currentImage && !imageError ? (
          <img
            src={currentImage}
            alt={property.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-6 text-center">
            <Home className="w-10 h-10 mb-2 stroke-[1.5]" />
            <span className="text-xs font-semibold text-slate-600">{property.category}</span>
            <span className="text-[11px] text-slate-400 mt-0.5">{property.city}</span>
          </div>
        )}

        {/* Status Tag */}
        {property.status === 'rented' && (
          <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
            Rented Out
          </div>
        )}

        {/* Favorite Icon */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Save property"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all shadow-sm active:scale-90"
        >
          <Heart className={`w-4 h-4 ${favorited ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>

        {/* Multi-image indicators */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="Previous photo"
              className="opacity-0 group-hover:opacity-100 absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-800 shadow transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Next photo"
              className="opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-800 shadow transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1">
              {property.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-[#167B62] uppercase tracking-wide text-[11px]">
              {property.bhk} · {property.category}
            </span>
            <span>{property.furnishing}</span>
          </div>

          <h3 className="font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-[#167B62] transition-colors text-[15px]">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{property.locality}, {property.city}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-slate-400" />
                {property.bedrooms} Beds
              </span>
            )}
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              {property.bathrooms} Baths
            </span>
            {property.areaSqFt && (
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                {property.areaSqFt} sq.ft
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100">
          <div>
            <span className="text-lg font-extrabold text-slate-900 tabular-nums">
              {currencySymbols[property.currency] || property.currency}{formatPrice(property.rentAmount)}
            </span>
            <span className="text-[11px] text-slate-400 ml-1">/ {property.rentPeriod}</span>
          </div>

          <button
            onClick={() => navigateTo('details', property.id)}
            className="px-3 py-1.5 text-xs font-semibold text-[#167B62] bg-emerald-50 hover:bg-[#167B62] hover:text-white rounded-lg transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
