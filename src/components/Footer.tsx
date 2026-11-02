import React from 'react';
import { Home, ShieldCheck, Heart, Database, Lock, Key } from 'lucide-react';
import { useRental } from '../context/RentalContext';

interface FooterProps {
  onOpenInfoModal: (topic: 'about' | 'privacy' | 'terms' | 'contact') => void;
  onOpenDatabaseSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInfoModal, onOpenDatabaseSettings }) => {
  const { navigateTo, setFilters } = useRental();

  const handleCityFilter = (city: string) => {
    setFilters(prev => ({ ...prev, city, country: 'All' }));
    navigateTo('explore');
  };

  const handleCategoryFilter = (cat: import('../types/rental').PropertyCategory) => {
    setFilters(prev => ({ ...prev, category: cat }));
    navigateTo('explore');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#167B62] flex items-center justify-center text-white shadow-sm">
                <Home className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Rent<span className="text-emerald-400">Easy</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-400 tracking-wider">
                  FIND · RENT · CONNECT
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The 100% free international property rental marketplace. Direct connection between property owners and tenants across the globe with zero commissions and no mandatory signups.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Free · No Subscription · Zero Brokerage</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Property Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleCategoryFilter('Studio Apartments')} className="hover:text-white transition-colors">
                  Studio Apartments
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryFilter('1 BHK')} className="hover:text-white transition-colors">
                  1 BHK Flats
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryFilter('2 BHK')} className="hover:text-white transition-colors">
                  2 BHK Homes
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryFilter('3 BHK')} className="hover:text-white transition-colors">
                  3 BHK Homes
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryFilter('Villas')} className="hover:text-white transition-colors">
                  Villas
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryFilter('Offices')} className="hover:text-white transition-colors">
                  Commercial Offices
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Top Destinations
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleCityFilter('New York')} className="hover:text-white transition-colors">
                  Rentals in New York
                </button>
              </li>
              <li>
                <button onClick={() => handleCityFilter('London')} className="hover:text-white transition-colors">
                  Rentals in London
                </button>
              </li>
              <li>
                <button onClick={() => handleCityFilter('Dubai')} className="hover:text-white transition-colors">
                  Rentals in Dubai
                </button>
              </li>
              <li>
                <button onClick={() => handleCityFilter('Berlin')} className="hover:text-white transition-colors">
                  Rentals in Berlin
                </button>
              </li>
              <li>
                <button onClick={() => handleCityFilter('Bengaluru')} className="hover:text-white transition-colors">
                  Rentals in Bengaluru
                </button>
              </li>
              <li>
                <button onClick={() => handleCityFilter('Toronto')} className="hover:text-white transition-colors">
                  Rentals in Toronto
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Governance */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Platform & Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => navigateTo('manage')} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Owner Listing Manager</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenDatabaseSettings} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Supabase Live Database</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin')} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Moderator Dashboard</span>
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfoModal('about')} className="hover:text-white transition-colors">
                  About RentEasy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfoModal('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfoModal('terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} RentEasy. All rights reserved. Zero Commission Rental Network.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('post')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Post a Property – 100% Free
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
