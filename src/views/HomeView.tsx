import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight,
  Home,
  CheckCircle2,
  Building,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { PropertyCard } from '../components/PropertyCard';
import { CATEGORIES_METADATA } from '../data/sampleProperties';
import { PropertyCategory } from '../types/rental';

export const HomeView: React.FC = () => {
  const { properties, navigateTo, setFilters, isLoading } = useRental();

  const [locationInput, setLocationInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory | 'All'>('All');
  const [budgetRange, setBudgetRange] = useState<string>('any');

  // Real database properties only (approved or rented)
  const realListings = properties.filter(p => p.status === 'approved' || p.status === 'rented');
  const recentListings = [...realListings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  // Derive genuine popular destinations dynamically from real user listings only
  const activeDestinations = Array.from(
    new Map(
      realListings
        .filter(p => p.city && p.country)
        .map(p => [`${p.city.toLowerCase()}_${p.country.toLowerCase()}`, { city: p.city, country: p.country }])
    ).values()
  );

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => {
      let minRent: number | '' = '';
      let maxRent: number | '' = '';

      if (budgetRange === 'under-1000') {
        maxRent = 1000;
      } else if (budgetRange === '1000-2500') {
        minRent = 1000;
        maxRent = 2500;
      } else if (budgetRange === '2500-5000') {
        minRent = 2500;
        maxRent = 5000;
      } else if (budgetRange === '5000-plus') {
        minRent = 5000;
      }

      return {
        ...prev,
        searchQuery: locationInput,
        category: selectedCategory,
        minRent,
        maxRent
      };
    });
    navigateTo('explore');
  };

  const handleCategoryClick = (category: PropertyCategory) => {
    setFilters(prev => ({ ...prev, category }));
    navigateTo('explore');
  };

  const handleDestinationClick = (destCity: string) => {
    setFilters(prev => ({ ...prev, city: destCity, country: 'All', searchQuery: '' }));
    navigateTo('explore');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ============================================================ */}
      {/* HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section className="relative pt-8 pb-16 sm:pb-20 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-[#126550] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
          <div className="max-w-3xl">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200 mb-4 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>100% Free · Zero Commission · Direct Owner Contact</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Find a place you'll love.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-200/90 leading-relaxed font-normal max-w-2xl">
              Discover rooms, apartments and homes for rent around the world. Connect directly with verified property owners without middlemen or listing charges.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('explore')}
                className="px-6 py-3 rounded-xl bg-[#167B62] hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-[#167B62]/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <span>Explore Properties</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateTo('post')}
                className="px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm border border-white/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                List Your Property – Free
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SEARCH WIDGET CARD                                           */}
          {/* ============================================================ */}
          <div className="mt-10 sm:mt-12 bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/80 text-slate-900">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Input */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#167B62]" />
                  <span>Where</span>
                </label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="City, locality, or country"
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#167B62] focus:bg-white transition-colors"
                />
              </div>

              {/* Property Category */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-[#167B62]" />
                  <span>Property Type</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#167B62] focus:bg-white transition-colors"
                >
                  <option value="All">All Categories (15 Types)</option>
                  {CATEGORIES_METADATA.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rent Budget Selector */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#167B62]" />
                  <span>Monthly Budget</span>
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#167B62] focus:bg-white transition-colors"
                >
                  <option value="any">Any Budget</option>
                  <option value="under-1000">Under $1,000</option>
                  <option value="1000-2500">$1,000 – $2,500</option>
                  <option value="2500-5000">$2,500 – $5,000</option>
                  <option value="5000-plus">$5,000+</option>
                </select>
              </div>

              {/* Submit CTA */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 px-6 rounded-xl bg-[#167B62] hover:bg-[#126550] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#167B62]/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 h-11"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search Rentals</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STATIC CATEGORY SELECTOR BAR (ZERO FAKE COUNTS)              */}
      {/* ============================================================ */}
      <section className="py-5 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Browse by Accommodation Type
            </h2>
            <button
              onClick={() => navigateTo('explore')}
              className="text-xs font-semibold text-[#167B62] hover:underline flex items-center gap-1"
            >
              <span>View all categories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {CATEGORIES_METADATA.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-[#167B62] text-xs font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#167B62]" />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PROPERTIES SECTION / FRESH INSTALL EMPTY STATE              */}
      {/* ============================================================ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {realListings.length > 0 ? (
            /* REAL PROPERTIES PRESENT */
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-semibold text-[#167B62] uppercase tracking-wider">
                    Verified Listings
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Available Rental Properties
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {realListings.length} direct owner listing{realListings.length === 1 ? '' : 's'} available
                  </p>
                </div>

                <button
                  onClick={() => navigateTo('explore')}
                  className="text-xs sm:text-sm font-bold text-[#167B62] hover:text-[#126550] flex items-center gap-1 group"
                >
                  <span>Explore all listings</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentListings.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} layout="grid" />
                ))}
              </div>
            </div>
          ) : (
            /* COMPLETELY FRESH FIRST INSTALL EMPTY STATE */
            <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200/90 shadow-sm text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#167B62] flex items-center justify-center mx-auto mb-5 shadow-xs">
                <Home className="w-8 h-8 stroke-[1.8]" />
              </div>

              <span className="text-xs font-bold text-[#167B62] uppercase tracking-wider">
                Welcome to RentEasy!
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
                No rental properties have been listed yet.
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                Be the first person to list a property in your area! Reach verified tenants directly with zero middleman charges, zero listing fees, and no account passwords required.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigateTo('post')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#167B62] hover:bg-[#126550] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#167B62]/20 transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Your Property – Completely Free</span>
                </button>

                <button
                  onClick={() => navigateTo('explore')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors"
                >
                  Browse Search Page
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* POPULAR SEARCH SHORTCUTS (DERIVED FROM REAL LISTINGS)        */}
      {/* ============================================================ */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Popular Destinations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct search shortcuts based on active property locations
            </p>
          </div>

          {activeDestinations.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {activeDestinations.map((dest) => (
                <button
                  key={`${dest.city}_${dest.country}`}
                  onClick={() => handleDestinationClick(dest.city)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-[#167B62] text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#167B62]" />
                  <span>{dest.city}, {dest.country}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center max-w-xl mx-auto">
              <MapPin className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No destination shortcuts yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                As real properties are submitted across cities and countries, genuine location shortcuts will automatically appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 15 CATEGORY DIRECTORY                                        */}
      {/* ============================================================ */}
      <section className="py-14 sm:py-18 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold text-[#167B62] uppercase tracking-wider">
              Directory
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Browse by Property Type
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select any category to view available listings or post in that segment
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {CATEGORIES_METADATA.map((cat) => (
              <div
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#167B62] group-hover:bg-[#167B62] group-hover:text-white flex items-center justify-center transition-colors mb-2.5">
                    <Building className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#167B62] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#167B62] font-semibold">
                  <span>Explore</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW RENTEASY WORKS (3 STEPS)                                */}
      {/* ============================================================ */}
      <section className="py-14 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#167B62] uppercase tracking-wider">
              Transparent · Commission-Free
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How RentEasy Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Connecting property owners and seekers directly across the globe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white text-[#167B62] font-extrabold text-sm flex items-center justify-center shadow-xs border border-slate-200 mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Free Search & Exploration</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Browse rental properties by country, city, category, and budget. No account creation or forced signups.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Free Browsing</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#167B62] text-white font-extrabold text-sm flex items-center justify-center shadow-xs mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Direct Owner Contact</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Connect directly with actual landlords using their phone number, WhatsApp link, or the built-in guest chat.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Middlemen</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white text-[#167B62] font-extrabold text-sm flex items-center justify-center shadow-xs border border-slate-200 mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Zero Commission Move-In</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Schedule physical viewings, finalize lease terms directly, and move in without paying broker commissions.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>No Booking Charges</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHY CHOOSE RENTEASY                                          */}
      {/* ============================================================ */}
      <section className="py-14 sm:py-20 bg-[#167B62] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Core Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Why RentEasy is Different
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
              RentEasy is an open international rental discovery platform designed to eliminate friction and broker charges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <h3 className="text-sm font-bold text-white">100% Free Forever</h3>
              <p className="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">
                No listing fees for landlords, no search fees for tenants, and zero booking commission charges.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <h3 className="text-sm font-bold text-white">No Mandatory Signup</h3>
              <p className="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">
                Browse listings, view photographs, and message or call landlords without entering passwords or phone OTPs.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <h3 className="text-sm font-bold text-white">Direct Communication</h3>
              <p className="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">
                Direct phone calling, verified WhatsApp messaging with prefilled template, and realtime chat.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <h3 className="text-sm font-bold text-white">Private Owner Access</h3>
              <p className="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">
                Owners receive a secure private link to update or delete listings without requiring an account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
