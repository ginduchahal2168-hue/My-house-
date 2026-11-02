import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  AlertCircle,
  Copy, 
  CheckCircle2, 
  ExternalLink,
  Camera,
  Loader2
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { 
  PropertyCategory, 
  Currency, 
  RentPeriod,
  FurnishingStatus, 
  AvailabilityOption, 
  ParkingOption, 
  TenantPreference,
  PropertyListing
} from '../types/rental';
import { CATEGORIES_METADATA, ALL_AMENITIES_LIST } from '../data/sampleProperties';
import { PropertyImageUpload } from '../components/PropertyImageUpload';

export const PostPropertyView: React.FC = () => {
  const { postProperty, navigateTo } = useRental();

  const [step, setStep] = useState<number>(1);
  const [createdListing, setCreatedListing] = useState<PropertyListing | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State: Strictly NO fake defaults
  const [category, setCategory] = useState<PropertyCategory | ''>('');
  const [bhk, setBhk] = useState('');

  // Location
  const [country, setCountry] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  // Price & Terms
  const [rentAmount, setRentAmount] = useState<string>('');
  const [rentPeriod, setRentPeriod] = useState<RentPeriod>('monthly');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [securityDeposit, setSecurityDeposit] = useState<string>('');
  const [maintenanceMonthly, setMaintenanceMonthly] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityOption>('Immediate');
  const [availableDate, setAvailableDate] = useState('');

  // Specs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [bathrooms, setBathrooms] = useState<string>('');
  const [areaSqFt, setAreaSqFt] = useState<string>('');
  const [furnishing, setFurnishing] = useState<FurnishingStatus>('Unfurnished');
  const [parking, setParking] = useState<ParkingOption>('None');
  const [tenantPreference, setTenantPreference] = useState<TenantPreference>('Any');
  const [petFriendly, setPetFriendly] = useState<boolean>(false);
  const [floorNumber, setFloorNumber] = useState<string>('');
  const [totalFloors, setTotalFloors] = useState<string>('');

  // Amenities
  const [amenities, setAmenities] = useState<string[]>([]);

  // Photos (strictly real user uploads, max 15)
  const [images, setImages] = useState<string[]>([]);

  // Owner contact
  const [ownerName, setOwnerName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+1');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [responseTime, setResponseTime] = useState('Within 1 hour');

  const toggleAmenity = (item: string) => {
    setAmenities(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  // Step Validation logic
  const validateCurrentStep = (): boolean => {
    setFormError(null);

    if (step === 1) {
      if (!category) {
        setFormError('Please select a property category to continue.');
        return false;
      }
      if (!bhk.trim()) {
        setFormError('Please enter the BHK or Room type.');
        return false;
      }
    }

    if (step === 2) {
      if (!country.trim()) {
        setFormError('Please enter or select the country.');
        return false;
      }
      if (!city.trim()) {
        setFormError('City is required.');
        return false;
      }
      if (!locality.trim()) {
        setFormError('Locality or neighborhood is required.');
        return false;
      }
    }

    if (step === 3) {
      const numRent = Number(rentAmount);
      if (!rentAmount || isNaN(numRent) || numRent <= 0) {
        setFormError('Please enter a valid monthly rent amount greater than zero.');
        return false;
      }
    }

    if (step === 4) {
      if (!title.trim() || title.length < 5) {
        setFormError('Please enter a descriptive property title (minimum 5 characters).');
        return false;
      }
      if (!description.trim() || description.length < 15) {
        setFormError('Please provide a property description (minimum 15 characters).');
        return false;
      }
      if (!bedrooms || isNaN(Number(bedrooms)) || Number(bedrooms) < 0) {
        setFormError('Please specify the number of bedrooms.');
        return false;
      }
      if (!bathrooms || isNaN(Number(bathrooms)) || Number(bathrooms) < 1) {
        setFormError('Please specify the number of bathrooms (minimum 1).');
        return false;
      }
    }

    if (step === 6) {
      if (images.length === 0) {
        setFormError('Please upload at least 1 real photograph of the property from your phone or device.');
        return false;
      }
    }

    if (step === 7) {
      if (!ownerName.trim()) {
        setFormError('Please enter the property owner or manager name.');
        return false;
      }
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 6) {
        setFormError('Please enter a valid contact phone number.');
        return false;
      }
      const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, '');
      if (!cleanWhatsApp || cleanWhatsApp.length < 6) {
        setFormError('Please enter a valid WhatsApp number.');
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleSubmitListing = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const saved = await postProperty({
        title: title.trim(),
        description: description.trim(),
        category: category as PropertyCategory,
        bhk: bhk.trim(),
        rentAmount: Number(rentAmount),
        rentPeriod,
        currency,
        securityDeposit: Number(securityDeposit) || 0,
        maintenanceMonthly: Number(maintenanceMonthly) || 0,
        country: country.trim(),
        stateProvince: stateProvince.trim(),
        city: city.trim(),
        locality: locality.trim(),
        fullAddress: fullAddress.trim() || `${locality.trim()}, ${city.trim()}, ${country.trim()}`,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        areaSqFt: areaSqFt ? Number(areaSqFt) : undefined,
        furnishing,
        availability,
        availableDate: availableDate || undefined,
        parking,
        tenantPreference,
        petFriendly,
        floorNumber: floorNumber ? Number(floorNumber) : undefined,
        totalFloors: totalFloors ? Number(totalFloors) : undefined,
        images,
        amenities,
        owner: {
          name: ownerName.trim(),
          phone: phone.trim(),
          phoneCountryCode,
          whatsapp: whatsapp.trim(),
          whatsappCountryCode,
          email: email.trim() || undefined,
          responseTime
        }
      });

      setCreatedListing(saved);
      setStep(9); // Success screen
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit property. Please verify your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    'Property Type',
    'Location',
    'Rental Price',
    'Details',
    'Amenities',
    'Photos',
    'Owner Contact',
    'Review & Submit'
  ];

  // ==========================================================
  // SUCCESS SCREEN (STEP 9)
  // ==========================================================
  if (step === 9 && createdListing) {
    const mgmtLink = `${window.location.origin}/#manage?ref=${createdListing.referenceCode}&token=${createdListing.ownerManagementToken}`;

    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#167B62] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>

          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Status: Submitted · Pending Review
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Property Submitted for Review!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Thank you for listing with RentEasy. To ensure marketplace safety and eliminate fake postings, our moderation team reviews every submission before public listing. You can track and manage your property anytime using your private link below.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Listing Reference ID:</span>
              <span className="font-mono font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {createdListing.referenceCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Property:</span>
              <span className="font-bold text-slate-800 truncate max-w-xs">{createdListing.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Rent:</span>
              <span className="font-bold text-[#167B62]">{createdListing.currency} {createdListing.rentAmount.toLocaleString()} / {createdListing.rentPeriod}</span>
            </div>
          </div>

          {/* Secure Private Owner Management Link */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left mb-6">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#167B62]" />
              <span>Private Owner Management Link (Zero Login Required)</span>
            </div>
            <p className="text-[11px] text-emerald-900/80 mb-2 leading-relaxed">
              Save this private link! It allows you to edit the rent, update details, mark the property as rented, or delete the listing without creating a user account.
            </p>
            <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 pl-3 border border-emerald-200">
              <input
                type="text"
                readOnly
                value={mgmtLink}
                className="text-xs text-slate-700 bg-transparent flex-1 outline-none truncate font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(mgmtLink);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1.5 bg-[#167B62] text-white rounded-lg text-xs font-semibold hover:bg-[#126550] transition-colors shrink-0 flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigateTo('details', createdListing.id)}
              className="flex-1 py-3 px-4 rounded-xl bg-[#167B62] hover:bg-[#126550] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>View Your Live Listing</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setStep(1);
                setCreatedListing(null);
                setImages([]);
                setTitle('');
                setDescription('');
              }}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors"
            >
              Post Another Property
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#167B62] mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Free · No Registration Required · Direct Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            List Your Property on RentEasy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real accommodation listings submitted by real property owners
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>Step {step} of 8: {stepsList[step - 1]}</span>
            <span className="text-[#167B62]">{Math.round((step / 8) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#167B62] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Error notification */}
        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          {/* STEP 1: PROPERTY TYPE */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Select Property Category *</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the category that matches your rental space
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES_METADATA.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      if (cat.name.includes('BHK')) {
                        setBhk(cat.name);
                      } else if (cat.name.includes('Studio')) {
                        setBhk('Studio');
                      } else if (cat.name.includes('Room')) {
                        setBhk('Room');
                      } else {
                        setBhk('Residential');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      category === cat.name
                        ? 'border-[#167B62] bg-emerald-50/70 text-slate-900 ring-2 ring-[#167B62]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{cat.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{cat.description}</div>
                  </button>
                ))}
              </div>

              {category && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    BHK / Sub-Type Descriptor *
                  </label>
                  <input
                    type="text"
                    value={bhk}
                    onChange={(e) => setBhk(e.target.value)}
                    placeholder="e.g. 2 BHK, Studio, Room, Duplex, Villa"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#167B62] focus:bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Property Location</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter real location details so tenants can find your property
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States, United Kingdom, Canada, India"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-[#167B62] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State / Province</label>
                  <input
                    type="text"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    placeholder="e.g. New York, Greater London, Ontario"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#167B62] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New York, London, Toronto, Dubai"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#167B62] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Locality / Neighborhood *</label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Tribeca, Camden, Koramangala, Downtown"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#167B62] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Street Address (Optional)</label>
                <input
                  type="text"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="Building number, Street, Postal code"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#167B62] focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 3: RENTAL PRICE */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Rental Price & Financial Terms</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set your actual pricing. No commission will be deducted.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#167B62]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CAD">CAD (CA$)</option>
                    <option value="AUD">AUD (AU$)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Rent Amount *</label>
                  <input
                    type="number"
                    required
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#167B62] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Rent Period</label>
                  <select
                    value={rentPeriod}
                    onChange={(e) => setRentPeriod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#167B62]"
                  >
                    <option value="monthly">Per Month</option>
                    <option value="weekly">Per Week</option>
                    <option value="yearly">Per Year</option>
                    <option value="daily">Per Day</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Security Deposit</label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#167B62]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Maintenance (0 if included)</label>
                  <input
                    type="number"
                    value={maintenanceMonthly}
                    onChange={(e) => setMaintenanceMonthly(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#167B62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#167B62]"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Within 15 Days">Within 15 Days</option>
                    <option value="Next Month">Next Month</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Available Date (Optional)</label>
                  <input
                    type="date"
                    value={availableDate}
                    onChange={(e) => setAvailableDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#167B62]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PROPERTY DETAILS */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Property Details & Specifications</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provide truthful specifications of your rental unit
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunny 2 Bedroom Apartment with Balcony in Tribeca"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#167B62]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the rooms, layout, proximity to public transit, natural light, and quietness..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#167B62]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bedrooms *</label>
                  <input
                    type="number"
                    required
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bathrooms *</label>
                  <input
                    type="number"
                    required
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    placeholder="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Area (sq.ft)</label>
                  <input
                    type="number"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                    placeholder="e.g. 850"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Furnishing</label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  >
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Parking</label>
                  <select
                    value={parking}
                    onChange={(e) => setParking(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  >
                    <option value="None">None</option>
                    <option value="Car & Bike Covered">Car & Bike Covered</option>
                    <option value="Car Only">Car Only</option>
                    <option value="Bike Only">Bike Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tenant Preference</label>
                  <select
                    value={tenantPreference}
                    onChange={(e) => setTenantPreference(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  >
                    <option value="Any">All Welcome</option>
                    <option value="Family">Family Preferred</option>
                    <option value="Bachelor">Bachelor Preferred</option>
                    <option value="Student">Student Friendly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="petFriendly"
                  checked={petFriendly}
                  onChange={(e) => setPetFriendly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#167B62] focus:ring-[#167B62]"
                />
                <label htmlFor="petFriendly" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Pet Friendly accommodation
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: AMENITIES */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Amenities & Inclusions</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select all real amenities that your rental property provides
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ALL_AMENITIES_LIST.map((amenity) => {
                  const isChecked = amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-emerald-50/80 border-[#167B62] text-[#167B62]'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-1">{amenity}</span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-[#167B62] text-white' : 'border border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: UPLOAD REAL PHOTOS (MAX 15) */}
          {step === 6 && (
            <div className="space-y-4">
              <PropertyImageUpload
                images={images}
                onChange={setImages}
                maxImages={15}
                maxFileSizeMB={8}
              />
            </div>
          )}

          {/* STEP 7: OWNER CONTACT */}
          {step === 7 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Owner Contact Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tenants will call and message you directly using these coordinates.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#167B62] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Direct Phone Number for Calls *</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                    placeholder="+1"
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none"
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#167B62] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Number *</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={whatsappCountryCode}
                    onChange={(e) => setWhatsappCountryCode(e.target.value)}
                    placeholder="+1"
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none"
                  />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="WhatsApp number"
                    className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#167B62] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#167B62] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Typical Response Time</label>
                <select
                  value={responseTime}
                  onChange={(e) => setResponseTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                >
                  <option value="Under 15 minutes">Under 15 minutes</option>
                  <option value="Within 1 hour">Within 1 hour</option>
                  <option value="Within a few hours">Within a few hours</option>
                  <option value="Same day">Same day</option>
                </select>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-[#167B62] shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Password Guarantee:</strong> You do not need to register an account or remember a password. After submitting, you receive a private secret management link to modify or delete your property at any time.
                </span>
              </div>
            </div>
          )}

          {/* STEP 8: REVIEW & SUBMIT */}
          {step === 8 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Review & Submit Your Listing</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm all details before publishing to the live marketplace
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex gap-4">
                {images[0] && (
                  <img
                    src={images[0]}
                    alt="Listing preview"
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-[#167B62] uppercase tracking-wider">
                    {category} · {furnishing}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {locality}, {city}, {country}
                  </p>
                  <div className="text-sm font-extrabold text-slate-900 mt-2">
                    {currency} {Number(rentAmount).toLocaleString()} / {rentPeriod}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Bedrooms</span>
                  <span className="font-bold text-slate-800">{bedrooms} Beds</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Bathrooms</span>
                  <span className="font-bold text-slate-800">{bathrooms} Baths</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Photos</span>
                  <span className="font-bold text-slate-800">{images.length} Real Photos</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Deposit</span>
                  <span className="font-bold text-slate-800">{currency} {securityDeposit || '0'}</span>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong>Owner Contact:</strong> {ownerName} · Phone: {phoneCountryCode} {phone} · WhatsApp: {whatsappCountryCode} {whatsapp}
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#167B62] shrink-0" />
                <span>100% Free Listing: $0 fees, $0 commissions, zero subscription traps.</span>
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            ) : <div />}

            {step < 8 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#167B62] hover:bg-[#126550] rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitListing}
                disabled={isSubmitting}
                className="px-6 py-3 text-xs sm:text-sm font-extrabold text-white bg-[#167B62] hover:bg-[#126550] rounded-xl flex items-center gap-2 shadow-lg shadow-[#167B62]/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Publish Real Listing</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
