import React from 'react';
import { X, ShieldCheck, Mail, Phone, CheckCircle, FileText } from 'lucide-react';

interface StaticInfoModalProps {
  topic: 'about' | 'privacy' | 'terms' | 'contact' | null;
  onClose: () => void;
}

export const StaticInfoModal: React.FC<StaticInfoModalProps> = ({ topic, onClose }) => {
  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {topic === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#167B62]">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-900">About RentEasy</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              RentEasy was founded with one clear mission: to eliminate the friction, exorbitant broker fees, and forced signup barriers in the rental property market worldwide.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <h4 className="text-xs font-bold text-[#167B62] uppercase tracking-wider">100% Free For All</h4>
                <p className="text-xs text-slate-600 mt-1">Zero listing fees for owners, zero search fees for tenants. No subscription tiers, ever.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">No Mandatory Signups</h4>
                <p className="text-xs text-slate-600 mt-1">Browse, view photos, filter, and message or call owners with zero password or OTP gating.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Direct Owner Connection</h4>
                <p className="text-xs text-slate-600 mt-1">Direct phone numbers, verified WhatsApp links, and instant in-app guest messaging.</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <h4 className="text-xs font-bold text-[#167B62] uppercase tracking-wider">Global Reach</h4>
                <p className="text-xs text-slate-600 mt-1">From New York and London to Dubai, Berlin, Tokyo, and Bengaluru.</p>
              </div>
            </div>
          </div>
        )}

        {topic === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#167B62]">
              <Mail className="w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-900">Contact RentEasy Support</h3>
            </div>
            <p className="text-sm text-slate-600">
              Have questions or need assistance with your property listing? Our international support team is ready to assist.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Mail className="w-5 h-5 text-[#167B62]" />
                <div>
                  <div className="text-xs font-semibold text-slate-800">Email Us</div>
                  <div className="text-xs text-slate-500">support@renteasy.global</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Phone className="w-5 h-5 text-[#167B62]" />
                <div>
                  <div className="text-xs font-semibold text-slate-800">Toll-Free International Hotline</div>
                  <div className="text-xs text-slate-500">+1 (800) 555-RENT-EASY (Mon–Fri 8am–8pm UTC)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {topic === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#167B62]">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-900">Privacy Policy</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              RentEasy respects your privacy. Because we do not enforce mandatory user accounts, we do not require your social credentials or passwords to browse rental listings.
            </p>
            <h4 className="text-xs font-bold text-slate-800">1. Data Storage</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your saved properties and guest conversations are preserved locally on your device using browser local storage for seamless immediate access.
            </p>
            <h4 className="text-xs font-bold text-slate-800">2. Owner Contact Information</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When listing a property, you provide contact details exclusively to enable prospective tenants to reach you. We do not sell contact information to third-party marketing companies.
            </p>
          </div>
        )}

        {topic === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#167B62]">
              <FileText className="w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-900">Terms of Service</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              By using RentEasy, you agree to these fair usage terms:
            </p>
            <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
              <li>Listings must represent real, accurate, and available rental properties.</li>
              <li>Owners and managers must not charge unauthorized broker commissions on listings marked direct owner.</li>
              <li>RentEasy acts as an open, free discovery marketplace and does not hold security deposits or arbitrate lease agreements directly.</li>
              <li>Harassment, fraudulent listings, or misleading content will result in immediate removal of the listing.</li>
            </ul>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#167B62] hover:bg-[#126550] rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
