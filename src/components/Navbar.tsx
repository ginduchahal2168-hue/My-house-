import React, { useState } from 'react';
import { Home, Compass, MessageSquare, Heart, PlusCircle, Globe, ShieldCheck } from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { Currency } from '../types/rental';

export const Navbar: React.FC = () => {
  const { 
    activePage, 
    navigateTo, 
    unreadMessagesCount, 
    favorites, 
    preferredCurrency, 
    setPreferredCurrency 
  } = useRental();

  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  const currencies: { code: Currency; symbol: string; label: string }[] = [
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
    { code: 'INR', symbol: '₹', label: 'INR (₹)' },
    { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)' },
    { code: 'AUD', symbol: 'AU$', label: 'AUD (AU$)' },
    { code: 'AED', symbol: 'AED', label: 'AED (د.إ)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Optional Top Trust Strip */}
      <div className="bg-[#167B62] text-white text-[12px] font-medium py-1 px-4 text-center hidden sm:flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
          100% Free Forever · No Signup Required · Zero Commission · Direct Owner Contact
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-17">
          {/* Zone 1: Single element Brand Wordmark */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167B62] rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-[#167B62] flex items-center justify-center text-white shadow-sm shadow-[#167B62]/20 group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                Rent<span className="text-[#167B62]">Easy</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 tracking-wider">
                FIND · RENT · CONNECT
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-slate-600">
            <button
              onClick={() => navigateTo('home')}
              className={`hover:text-[#167B62] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activePage === 'home' ? 'border-[#167B62] text-[#167B62]' : 'border-transparent'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('explore')}
              className={`hover:text-[#167B62] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
                activePage === 'explore' ? 'border-[#167B62] text-[#167B62]' : 'border-transparent'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Properties
            </button>
            <button
              onClick={() => navigateTo('messages')}
              className={`hover:text-[#167B62] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 relative ${
                activePage === 'messages' ? 'border-[#167B62] text-[#167B62]' : 'border-transparent'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Messages
              {unreadMessagesCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#167B62] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigateTo('favorites')}
              className={`hover:text-[#167B62] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
                activePage === 'favorites' ? 'border-[#167B62] text-[#167B62]' : 'border-transparent'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              Saved ({favorites.length})
            </button>
          </nav>

          {/* Zone 3: Primary action + Currency switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Currency selector */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                title="Select currency"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{preferredCurrency}</span>
              </button>

              {showCurrencyMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Currency
                  </div>
                  {currencies.map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setPreferredCurrency(curr.code);
                        setShowCurrencyMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                        preferredCurrency === curr.code ? 'font-bold text-[#167B62] bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{curr.label}</span>
                      <span className="text-slate-400">{curr.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* List Property Primary Action */}
            <button
              onClick={() => navigateTo('post')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#167B62] hover:bg-[#126550] rounded-xl shadow-sm shadow-[#167B62]/20 transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.2]" />
              <span>List Property · <span className="text-emerald-200 font-bold">Free</span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
