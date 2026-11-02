import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { PropertyListing } from '../types/rental';

interface ReportModalProps {
  property: PropertyListing;
  isOpen: boolean;
  onClose: () => void;
}

import { apiSubmitReport } from '../services/supabaseClient';

export const ReportModal: React.FC<ReportModalProps> = ({ property, isOpen, onClose }) => {
  const [reason, setReason] = useState<string>('Already rented / unavailable');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiSubmitReport({
      propertyId: property.id,
      referenceCode: property.referenceCode,
      reason,
      details: details.trim() || undefined
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
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

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Report this Listing</h3>
                <p className="text-xs text-slate-500">Ref: {property.referenceCode}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  What is the issue with this listing?
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#167B62] focus:bg-white"
                >
                  <option value="Already rented / unavailable">Already rented / unavailable</option>
                  <option value="Incorrect price or hidden fees demanded">Incorrect price or hidden fees demanded</option>
                  <option value="Inaccurate photos or false address">Inaccurate photos or false address</option>
                  <option value="Suspected fraud or broker pretending to be owner">Suspected fraud / broker middleman</option>
                  <option value="Offensive content or inappropriate behavior">Offensive content or behavior</option>
                  <option value="Other concern">Other concern</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional context to assist community moderation..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#167B62] focus:bg-white"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                RentEasy strictly investigates fake owners and commission fees. All verified owner listings must stay 100% free and genuine.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mb-3" />
            <h4 className="text-base font-bold text-slate-900">Thank you for reporting</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Our community moderation team has received the report for reference {property.referenceCode} and will audit this listing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
