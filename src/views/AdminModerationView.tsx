import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  ArrowLeft,
  Database,
  Lock
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { PropertyListing, ListingStatus } from '../types/rental';
import { apiFetchAllPropertiesForAdmin, apiAdminModerateProperty } from '../services/supabaseClient';

export const AdminModerationView: React.FC = () => {
  const { navigateTo } = useRental();
  const [allListings, setAllListings] = useState<PropertyListing[]>([]);
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadAdminListings = async () => {
    const list = await apiFetchAllPropertiesForAdmin();
    setAllListings(list);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminListings();
    }
  }, [isAuthenticated]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Moderator passkey for marketplace operator
    if (adminKey === 'admin2026' || adminKey === 'renteasy-moderator') {
      setIsAuthenticated(true);
      setStatusMsg(null);
    } else {
      setStatusMsg('Invalid moderator passkey. (Default: admin2026)');
    }
  };

  const handleChangeStatus = async (prop: PropertyListing, newStatus: ListingStatus) => {
    const ok = await apiAdminModerateProperty(adminKey, prop.id, newStatus);
    if (ok) {
      setAllListings(prev => prev.map(p => p.id === prop.id ? { ...p, status: newStatus } : p));
    } else {
      alert('Failed to update status. Please verify your moderator key.');
    }
  };

  const handleDeleteListing = async (prop: PropertyListing) => {
    if (!window.confirm(`Reject and remove "${prop.title}" from active listings?`)) return;
    const ok = await apiAdminModerateProperty(adminKey, prop.id, 'rejected');
    if (ok) {
      setAllListings(prev => prev.map(p => p.id === prop.id ? { ...p, status: 'rejected' } : p));
    }
  };

  const filtered = allListings.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">Moderation Portal</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Review and moderate actual rental listings submitted by users.
            </p>

            {statusMsg && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter moderator passkey (admin2026)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#167B62] focus:bg-white"
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#167B62] hover:bg-[#126550] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Listing Moderation Dashboard
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Total {allListings.length} actual submissions recorded in database
                </p>
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {['all', 'approved', 'pending_review', 'rented', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                      filterStatus === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                {filtered.map((prop) => (
                  <div key={prop.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {prop.images[0] ? (
                        <img src={prop.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0 font-bold">
                          No Photo
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            prop.status === 'approved' ? 'bg-emerald-50 text-emerald-800' :
                            prop.status === 'pending_review' ? 'bg-amber-50 text-amber-800' :
                            prop.status === 'rented' ? 'bg-slate-100 text-slate-800' : 'bg-rose-50 text-rose-800'
                          }`}>
                            {prop.status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{prop.referenceCode}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 truncate mt-1">
                          {prop.title}
                        </h3>

                        <p className="text-xs text-slate-500">
                          {prop.city}, {prop.country} · {prop.currency} {prop.rentAmount.toLocaleString()} / {prop.rentPeriod} · Owner: {prop.owner.name} ({prop.owner.phone})
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <button
                        onClick={() => navigateTo('details', prop.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Preview
                      </button>

                      {prop.status !== 'approved' && (
                        <button
                          onClick={() => handleChangeStatus(prop, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {prop.status !== 'rejected' && (
                        <button
                          onClick={() => handleChangeStatus(prop, 'rejected')}
                          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteListing(prop)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <p className="text-xs text-slate-500">No properties in this status category.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
