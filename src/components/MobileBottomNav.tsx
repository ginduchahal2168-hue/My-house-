import React from 'react';
import { Home, Compass, Plus, MessageSquare, Heart } from 'lucide-react';
import { useRental } from '../context/RentalContext';

export const MobileBottomNav: React.FC = () => {
  const { activePage, navigateTo, unreadMessagesCount, favorites } = useRental();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-safe">
      <div className="grid grid-cols-5 items-center h-15 px-2">
        {/* Home */}
        <button
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
            activePage === 'home' ? 'text-[#167B62] font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => navigateTo('explore')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
            activePage === 'explore' ? 'text-[#167B62] font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px]">Explore</span>
        </button>

        {/* Post Property (Center Highlight) */}
        <button
          onClick={() => navigateTo('post')}
          className="flex flex-col items-center justify-center -mt-4 group"
        >
          <div className="w-11 h-11 rounded-full bg-[#167B62] text-white flex items-center justify-center shadow-md shadow-[#167B62]/30 group-active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className={`text-[10px] mt-0.5 font-bold ${activePage === 'post' ? 'text-[#167B62]' : 'text-slate-600'}`}>
            Post Free
          </span>
        </button>

        {/* Messages */}
        <button
          onClick={() => navigateTo('messages')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors relative ${
            activePage === 'messages' ? 'text-[#167B62] font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 stroke-[2]" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#167B62] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Messages</span>
        </button>

        {/* Saved */}
        <button
          onClick={() => navigateTo('favorites')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors relative ${
            activePage === 'favorites' ? 'text-[#167B62] font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 stroke-[2] ${favorites.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">Saved</span>
        </button>
      </div>
    </nav>
  );
};
