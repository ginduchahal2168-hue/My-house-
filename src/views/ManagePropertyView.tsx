import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { ListingStatus, AvailabilityOption, PropertyListing } from '../types/rental';
import { PropertyImageUpload } from '../components/PropertyImageUpload';
import { apiGetPropertyByManagementToken } from '../services/supabaseClient';

export const ManagePropertyView: React.FC = () => {
  const { 
    properties, 
    managementToken, 
    updatePropertyListing, 
    deletePropertyListing, 
    navigateTo 
  } = useRental();

  const [inputToken, setInputToken] = useState<string>(managementToken || '');
  const [tokenVerified, setTokenVerified] = useState<boolean>(Boolean(managementToken));
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Editable fields
  const [rentAmount, setRentAmount] = useState<string>('');
  const [status, setStatus] = useState<ListingStatus>('approved');
  const [availability, setAvailability] = useState<AvailabilityOption>('Immediate');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);

  // Automatically check token if supplied in URL or state
  useEffect(() => {
    const tok = managementToken || inputToken;
    if (tok && tok.trim()) {
      handleLookupToken(tok.trim());
    }
  }, [managementToken]);

  const handleLookupToken = async (tok: string) => {
    setIsVerifying(true);
    setStatusMessage(null);
    try {
      const found = await apiGetPropertyByManagementToken(tok);
      if (found) {
        setProperty(found);
        setTokenVerified(true);
        setRentAmount(String(found.rentAmount));
        setStatus(found.status);
        setAvailability(found.availability);
        setTitle(found.title);
        setDescription(found.description);
        setImages(found.images || []);
        setStatusMessage({ type: 'success', text: `Access granted for "${found.title}"` });
      } else {
        setTokenVerified(false);
        setStatusMessage({ type: 'error', text: 'Invalid management token. Please verify your private management link.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Could not verify token. Please check your network connection.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyToken = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookupToken(inputToken.trim());
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setStatusMessage(null);

    const activeTok = managementToken || inputToken;
    const success = await updatePropertyListing(property.id, activeTok, {
      rentAmount: Number(rentAmount) || property.rentAmount,
      status,
      availability,
      title: title.trim() || property.title,
      description: description.trim() || property.description,
      images
    });

    if (success) {
      setStatusMessage({ type: 'success', text: 'Property listing updated successfully.' });
    } else {
      setStatusMessage({ type: 'error', text: 'Could not update listing. Please verify access.' });
    }
  };

  const handleDeleteListing = async () => {
    if (!property) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${property.title}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    const activeTok = managementToken || inputToken;
    const success = await deletePropertyListing(property.id, activeTok);
    if (success) {
      alert('Listing has been permanently removed from RentEasy.');
      navigateTo('home');
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to delete property.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* If no verified token, ask for it */}
        {!tokenVerified || !property ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#167B62] flex items-center justify-center mb-4">
              <Key className="w-6 h-6" />
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Owner Listing Management
            </h1>
            <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
              Enter the private secret management token provided when you listed your property to edit, mark as rented, or delete your listing.
            </p>

            {statusMessage && (
              <div className={`mb-5 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleVerifyToken} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Owner Management Token
                </label>
                <input
                  type="text"
                  required
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Paste your secret management token"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:border-[#167B62] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 px-4 rounded-xl bg-[#167B62] hover:bg-[#126550] text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
              >
                {isVerifying ? 'Verifying Token...' : 'Access My Listing'}
              </button>
            </form>
          </div>
        ) : (
          /* Verified Owner Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-[#167B62] uppercase tracking-wider">
                  Owner Management Dashboard
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {property.title}
                </h2>
                <span className="text-xs text-slate-400 font-mono">Ref: {property.referenceCode}</span>
              </div>

              <button
                onClick={() => navigateTo('details', property.id)}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5"
                title="View Live Listing"
              >
                <span>View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {statusMessage && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveChanges} className="space-y-4">
              {/* Status Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Listing Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#167B62]"
                >
                  <option value="approved">Active & Available for Rent</option>
                  <option value="rented">Rented Out (Mark as Occupied)</option>
                  <option value="expired">Temporarily Inactive</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mark as "Rented Out" once you find a tenant to pause inquiries without deleting your photos.
                </p>
              </div>

              {/* Monthly Rent */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Rent Amount ({property.currency})
                </label>
                <input
                  type="number"
                  required
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#167B62]"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none"
                >
                  <option value="Immediate">Immediate Move-In</option>
                  <option value="Within 15 Days">Within 15 Days</option>
                  <option value="Next Month">Next Month</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              {/* Property Photographs Management */}
              <div className="pt-2">
                <PropertyImageUpload
                  images={images}
                  onChange={setImages}
                  maxImages={15}
                  maxFileSizeMB={8}
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDeleteListing}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Listing</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#167B62] hover:bg-[#126550] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
