import React, { useState } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Maximize2, ExternalLink, X, Heart } from 'lucide-react';
import { PropertyListing } from '../types/rental';
import { useRental } from '../context/RentalContext';

interface PropertyMapProps {
  properties: PropertyListing[];
  selectedProperty?: PropertyListing | null;
  onSelectProperty?: (property: PropertyListing) => void;
  heightClass?: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty: externalSelected,
  onSelectProperty,
  heightClass = 'h-[600px]'
}) => {
  const { navigateTo, isFavorite, toggleFavorite } = useRental();
  const [activePinId, setActivePinId] = useState<string | null>(externalSelected?.id || (properties[0]?.id ?? null));
  const [zoomLevel, setZoomLevel] = useState(12);

  const activeProperty = properties.find(p => p.id === activePinId) || externalSelected || properties[0];

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'CA$',
    AUD: 'AU$',
    AED: 'AED '
  };

  const handlePinClick = (prop: PropertyListing) => {
    setActivePinId(prop.id);
    if (onSelectProperty) {
      onSelectProperty(prop);
    }
  };

  // Generate deterministic coordinates for visual distribution in simulation canvas
  const getPinPosition = (index: number, total: number) => {
    // Distribute pins aesthetically in a circular / organic grid
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = 18 + (col / Math.max(cols - 1, 1)) * 64 + (index % 2 === 0 ? 3 : -3);
    const y = 18 + (row / Math.max(Math.ceil(total / cols) - 1, 1)) * 64 + (index % 3 === 0 ? -4 : 4);
    return { left: `${Math.min(Math.max(x, 10), 85)}%`, top: `${Math.min(Math.max(y, 10), 82)}%` };
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 bg-[#e5e9ec] shadow-inner select-none`}>
      {/* Map Graphic Canvas Background */}
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle street grid pattern */}
          <defs>
            <pattern id="city-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#d5dbe0" strokeWidth="1.5" />
              <path d="M 50 0 L 50 100 M 0 50 L 100 50" fill="none" stroke="#dce2e7" strokeWidth="0.8" strokeDasharray="3 3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#edf1f4" />
          <rect width="100%" height="100%" fill="url(#city-grid)" />
          {/* Water body simulation */}
          <path
            d="M -50 400 Q 200 350, 450 480 T 950 420 T 1450 500 L 1450 800 L -50 800 Z"
            fill="#c8ddec"
            opacity="0.6"
          />
          {/* Main arterial highway lines */}
          <path d="M -100 150 Q 500 250, 1500 200" fill="none" stroke="#fbe49e" strokeWidth="8" opacity="0.7" />
          <path d="M 300 -50 Q 400 600, 600 1200" fill="none" stroke="#fbe49e" strokeWidth="8" opacity="0.7" />
          {/* Green parks */}
          <rect x="15%" y="22%" width="120" height="90" rx="15" fill="#cbe6d2" opacity="0.7" />
          <rect x="68%" y="15%" width="140" height="110" rx="20" fill="#cbe6d2" opacity="0.7" />
          <rect x="45%" y="60%" width="160" height="100" rx="24" fill="#cbe6d2" opacity="0.6" />
        </svg>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-white rounded-xl shadow-md border border-slate-200/80 p-1 flex flex-col">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
            aria-label="Zoom in"
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200 my-0.5" />
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 1, 8))}
            aria-label="Zoom out"
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            if (properties[0]) handlePinClick(properties[0]);
          }}
          className="bg-white rounded-xl shadow-md border border-slate-200/80 p-2 text-slate-700 hover:text-[#167B62] transition-colors"
          title="Recenter"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Top Map Location Banner */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#167B62]" />
        <span className="text-xs font-semibold text-slate-800">
          Showing {properties.length} rental properties on map
        </span>
      </div>

      {/* Interactive Property Map Pins */}
      <div className="absolute inset-0 z-10">
        {properties.map((prop, idx) => {
          const isSelected = prop.id === activePinId;
          const pos = getPinPosition(idx, properties.length);
          const symbol = currencySymbols[prop.currency] || '$';

          return (
            <button
              key={prop.id}
              onClick={() => handlePinClick(prop)}
              style={{ left: pos.left, top: pos.top }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all transform hover:scale-110 focus:outline-none ${
                isSelected ? 'z-30 scale-110' : 'z-20'
              }`}
            >
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-md transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white ring-2 ring-[#167B62] ring-offset-2'
                    : 'bg-white text-slate-800 hover:bg-slate-900 hover:text-white border border-slate-200'
                }`}
              >
                <span>{symbol}{prop.rentAmount >= 1000 ? `${(prop.rentAmount / 1000).toFixed(prop.rentAmount % 1000 === 0 ? 0 : 1)}k` : prop.rentAmount}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Property Popup Card */}
      {activeProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-84 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex gap-3 relative">
            <button
              onClick={() => setActivePinId(null)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center z-10"
              aria-label="Close preview"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Thumbnail */}
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
              {activeProperty.images && activeProperty.images[0] ? (
                <img
                  src={activeProperty.images[0]}
                  alt={activeProperty.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-200">
                  Home
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between pr-4">
              <div>
                <span className="text-[11px] font-semibold text-[#167B62] uppercase tracking-wider">
                  {activeProperty.bhk} · {activeProperty.city}
                </span>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                  {activeProperty.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeProperty.bedrooms} bd · {activeProperty.bathrooms} ba {activeProperty.areaSqFt ? `· ${activeProperty.areaSqFt} sq.ft` : ''}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-sm font-extrabold text-slate-900">
                  {currencySymbols[activeProperty.currency] || '$'}{activeProperty.rentAmount.toLocaleString()}
                  <span className="text-[10px] font-normal text-slate-500">/{activeProperty.rentPeriod}</span>
                </span>

                <button
                  onClick={() => navigateTo('details', activeProperty.id)}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-[#167B62] hover:bg-[#126550] rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
