import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Send, Globe, Share2 } from 'lucide-react';
import { PropertyListing } from '../types/rental';

interface ShareModalProps {
  property: PropertyListing;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ property, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const shareText = `Check out this rental on RentEasy: ${property.title} in ${property.city} (${property.currency} ${property.rentAmount}/${property.rentPeriod}) - 100% Free Direct Owner Rental!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: shareText,
        url: currentUrl
      }).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#167B62] flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Share this Property</h3>
            <p className="text-xs text-slate-500">Send to friends, roommates or family</p>
          </div>
        </div>

        {/* Property mini snippet */}
        <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3 mb-5 border border-slate-200/70">
          {property.images && property.images[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
              Home
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{property.title}</h4>
            <p className="text-[11px] text-slate-500 truncate">{property.locality}, {property.city}</p>
            <p className="text-xs font-extrabold text-[#167B62] mt-0.5">
              {property.currency} {property.rentAmount.toLocaleString()} / {property.rentPeriod}
            </p>
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator ? (
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>More Options</span>
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
            </button>
          )}
        </div>

        {/* Copy Link Input Bar */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 mb-1.5 block">Or copy listing link directly</label>
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1.5 pl-3">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="bg-transparent text-xs text-slate-700 flex-1 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white text-slate-900 hover:text-[#167B62] rounded-lg text-xs font-semibold shadow-xs border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
