import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Map as MapIcon, 
  RotateCcw, 
  X, 
  Home,
  ChevronLeft,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { PropertyCard } from '../components/PropertyCard';
import { CATEGORIES_METADATA } from '../data/sampleProperties';
import { Currency, PropertyCategory } from '../types/rental';

export const ExploreView: React.FC = () => {
  const { filters, setFilters, resetFilters, filterProperties, navigateTo } = useRental();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredListings = filterProperties();
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage) || 1;
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'AED', 'JPY'];

  const activeFiltersCount = [
    filters.searchQuery !== '',
    filters.country !== 'All' && filters.country !== '',
    filters.city !== 'All' && filters.city !== '',
    filters.locality !== '',
    filters.category !== 'All',
    filters.minRent !== '',
    filters.maxRent !== '',
    filters.currency !== 'All',
    filters.bedrooms !== 'Any',
    filters.bathrooms !== 'Any',
    filters.furnishing !== 'All',
    filters.availability !== 'All',
    filters.parking !== 'All',
    filters.tenantPreference !== 'All',
    filters.petFriendlyOnly
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-16">
      {/* Top Search & Filter Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-17 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                  setCurrentPage(1);
                }}
                placeholder="Search city, neighborhood, or property title..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#167B62] focus:bg-white transition-all font-medium"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View, Sort and Filter buttons */}
            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#167B62]"
                >
                  <option value="latest">Latest Added</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid View"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List View"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Filter Sheet Trigger */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs relative"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#167B62]" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#167B62] text-white text-[9px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ========================================================== */}
          {/* DESKTOP FILTER SIDEBAR                                     */}
          {/* ========================================================== */}
          <div className="hidden lg:block lg:col-span-1 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs sticky top-36 max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#167B62]" />
                <h3 className="text-sm font-bold text-slate-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="space-y-4 pt-4 text-xs">
              {/* Category */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-[#167B62]"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES_METADATA.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={filters.country === 'All' ? '' : filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value || 'All' }))}
                  placeholder="e.g. United States, UK, India"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium outline-none focus:border-[#167B62]"
                />
              </div>

              {/* City */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={filters.city === 'All' ? '' : filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value || 'All' }))}
                  placeholder="e.g. London, New York, Dubai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium outline-none focus:border-[#167B62]"
                />
              </div>

              {/* Locality */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Locality
                </label>
                <input
                  type="text"
                  value={filters.locality}
                  onChange={(e) => setFilters(prev => ({ ...prev, locality: e.target.value }))}
                  placeholder="Neighborhood name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium outline-none focus:border-[#167B62]"
                />
              </div>

              {/* Currency & Rent Range */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Rent Range
                  </label>
                  <select
                    value={filters.currency}
                    onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value as any }))}
                    className="text-[10px] font-bold text-[#167B62] bg-emerald-50 rounded-md px-1.5 py-0.5 border border-emerald-200"
                  >
                    <option value="All">All Currencies</option>
                    {currencies.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minRent}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRent: e.target.value ? Number(e.target.value) : '' }))}
                    placeholder="Min"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-[#167B62]"
                  />
                  <input
                    type="number"
                    value={filters.maxRent}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxRent: e.target.value ? Number(e.target.value) : '' }))}
                    placeholder="Max"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-[#167B62]"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Bedrooms
                </label>
                <div className="flex items-center gap-1.5">
                  {['Any', 1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, bedrooms: num as any }))}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        filters.bedrooms === num
                          ? 'bg-[#167B62] text-white border-[#167B62]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num === 4 ? '4+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Bathrooms
                </label>
                <div className="flex items-center gap-1.5">
                  {['Any', 1, 2, 3].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, bathrooms: num as any }))}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        filters.bathrooms === num
                          ? 'bg-[#167B62] text-white border-[#167B62]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num === 3 ? '3+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Furnishing
                </label>
                <select
                  value={filters.furnishing}
                  onChange={(e) => setFilters(prev => ({ ...prev, furnishing: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-[#167B62]"
                >
                  <option value="All">Any Furnishing</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-[#167B62]"
                >
                  <option value="All">Any Availability</option>
                  <option value="Immediate">Immediate Move-In</option>
                  <option value="Within 15 Days">Within 15 Days</option>
                  <option value="Next Month">Next Month</option>
                </select>
              </div>

              {/* Pet Friendly */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={filters.petFriendlyOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, petFriendlyOnly: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#167B62] focus:ring-[#167B62]"
                />
                <span className="font-medium text-slate-700">Pet friendly only</span>
              </label>
            </div>
          </div>

          {/* ========================================================== */}
          {/* SEARCH RESULTS CONTENT                                     */}
          {/* ========================================================== */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {filters.city !== 'All' && filters.city ? `Properties in ${filters.city}` : 'Rental Listings'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {filteredListings.length} actual property listing{filteredListings.length === 1 ? '' : 's'}
                </p>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="lg:hidden text-xs text-rose-600 font-semibold"
                >
                  Clear filters ({activeFiltersCount})
                </button>
              )}
            </div>

            {filteredListings.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedListings.map(prop => (
                      <PropertyCard key={prop.id} property={prop} layout="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedListings.map(prop => (
                      <PropertyCard key={prop.id} property={prop} layout="list" />
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <span className="text-xs text-slate-500">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Honest Empty Search State */
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No properties found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No rental accommodations currently match your filter criteria.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => navigateTo('post')}
                    className="px-5 py-2.5 rounded-xl bg-[#167B62] hover:bg-[#126550] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post a Property in This Area</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 py-4 flex-1 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES_METADATA.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={filters.city === 'All' ? '' : filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value || 'All' }))}
                  placeholder="Enter city"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Budget Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minRent}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRent: e.target.value ? Number(e.target.value) : '' }))}
                    placeholder="Min"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                  <input
                    type="number"
                    value={filters.maxRent}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxRent: e.target.value ? Number(e.target.value) : '' }))}
                    placeholder="Max"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="w-1/3 py-3 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-2/3 py-3 text-xs font-semibold text-white bg-[#167B62] rounded-xl shadow-md"
              >
                Show {filteredListings.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
