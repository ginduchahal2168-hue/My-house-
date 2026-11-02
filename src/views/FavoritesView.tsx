import React from 'react';
import { Heart, Compass, ArrowRight, Trash2 } from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { PropertyCard } from '../components/PropertyCard';

export const FavoritesView: React.FC = () => {
  const { properties, favorites, navigateTo } = useRental();

  const savedListings = properties.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Saved Properties
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {savedListings.length} accommodation listings saved to your local device. No account required.
            </p>
          </div>

          <button
            onClick={() => navigateTo('explore')}
            className="self-start sm:self-auto text-xs sm:text-sm font-bold text-[#167B62] hover:text-[#126550] flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Discover more rentals</span>
          </button>
        </div>

        {savedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedListings.map(prop => (
              <PropertyCard key={prop.id} property={prop} layout="grid" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No saved properties yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tap the heart icon on any room, apartment or villa to save it here for quick access and direct comparison.
            </p>
            <button
              onClick={() => navigateTo('explore')}
              className="mt-6 px-6 py-2.5 rounded-xl bg-[#167B62] hover:bg-[#126550] text-white font-bold text-xs shadow-md shadow-[#167B62]/20 transition-all inline-flex items-center gap-1.5"
            >
              <span>Explore Properties Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
