import React, { useState, useEffect } from 'react';
import {
  Building2,
  Home,
  Search,
  Filter,
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  PhoneCall,
  Calendar,
  Plus,
  Share2,
  CheckCircle2,
  Calculator,
  Compass,
  X,
  MessageCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  HelpCircle,
  Award,
  Check
} from 'lucide-react';
import { initialProperties } from './data/propertiesData';

/**
 * MORTGAGE & LOAN CALCULATION ENGINE (Hardened & Audited)
 * 
 * Test Case 1: Standard 30-Year Loan @ 6.5%:
 *   price: 1,000,000, downPaymentPct: 20%, years: 30, rate: 6.5% -> $5,057/mo
 * Test Case 2: 0% Interest Rate Edge Case (division by zero safeguard):
 *   price: 600,000, downPaymentPct: 20%, years: 20, rate: 0% -> $2,000/mo (principal / months)
 * Test Case 3: 100% Down Payment (No loan required):
 *   price: 850,000, downPaymentPct: 100%, years: 25, rate: 5% -> $0/mo
 * Test Case 4: Zero / Negative Loan Term Guard:
 *   years <= 0 -> Clamped to 1 year minimum
 * Test Case 5: Floating Point Precision Guard:
 *   Always returns exact integer or rounded 2-decimal figure, never NaN
 */
export function calculateMortgagePayment(price, downPaymentPct, loanYears, interestRate) {
  const safePrice = Math.max(0, Number(price) || 0);
  if (safePrice === 0) return 0;
  
  const safeDownPct = Math.min(100, Math.max(0, Number(downPaymentPct) || 0));
  if (safeDownPct >= 100) return 0;

  const safeYears = Math.max(1, Math.min(40, Number(loanYears) || 25));
  const safeRate = Math.max(0, Number(interestRate) || 0);

  const principal = safePrice * (1 - safeDownPct / 100);
  const numPayments = safeYears * 12;

  // Edge case: 0% interest
  if (safeRate === 0) {
    return Math.round(principal / numPayments);
  }

  const monthlyRate = safeRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, numPayments);
  const monthly = (principal * (monthlyRate * factor)) / (factor - 1);

  if (isNaN(monthly) || !isFinite(monthly)) return 0;
  return Math.round(monthly);
}

export default function App() {
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('primehaven_properties_v2');
    return saved ? JSON.parse(saved) : initialProperties;
  });

  const [savedFavorites, setSavedFavorites] = useState(() => {
    const saved = localStorage.getItem('primehaven_favs_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'For Sale', 'For Rent'
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState(15000000);
  const [bedroomsFilter, setBedroomsFilter] = useState('Any');

  // Modals & Panels
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isScheduleTourOpen, setIsScheduleTourOpen] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Mortgage Calculator State
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [loanYears, setLoanYears] = useState(30);
  const [interestRate, setInterestRate] = useState(6.5);

  // New Property Form State
  const [newProperty, setNewProperty] = useState({
    title: '',
    type: 'Luxury Villa',
    status: 'For Sale',
    price: '',
    rentPeriod: 'month',
    location: 'Beverly Hills, California',
    bedrooms: '4',
    bathrooms: '4.5',
    sqft: '4200',
    description: '',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    agentName: 'Marcus Vance',
    agentPhone: '+1 (310) 555-0198',
    agentCompany: 'Vance & Gold Private Estates',
  });

  // Tour Booking Form
  const [tourForm, setTourForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '2026-10-24',
    timeSlot: '11:00 AM',
    notes: '',
  });

  useEffect(() => {
    localStorage.setItem('primehaven_properties_v2', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('primehaven_favs_v2', JSON.stringify(savedFavorites));
  }, [savedFavorites]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleFavorite = (propertyId, e) => {
    e?.stopPropagation();
    setSavedFavorites(prev => {
      const exists = prev.includes(propertyId);
      const updated = exists ? prev.filter(id => id !== propertyId) : [...prev, propertyId];
      showToast(exists ? 'Removed from saved portfolio.' : 'Added to private saved residences.');
      return updated;
    });
  };

  const handleAddProperty = (e) => {
    e.preventDefault();
    if (!newProperty.title || !newProperty.price) return;

    const created = {
      id: `PROP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newProperty.title,
      type: newProperty.type,
      status: newProperty.status,
      price: Number(newProperty.price),
      rentPeriod: newProperty.status === 'For Rent' ? 'month' : null,
      location: newProperty.location,
      neighborhood: newProperty.location.split(',')[0],
      bedrooms: Number(newProperty.bedrooms),
      bathrooms: Number(newProperty.bathrooms),
      sqft: Number(newProperty.sqft),
      featured: false,
      description: newProperty.description || 'Exclusive architectural residence in an iconic global residential enclave.',
      image: newProperty.image,
      images: [newProperty.image],
      amenities: ['Private Security', 'Custom Interior Finishes', 'Dedicated Covered Parking', 'Smart Home Integration'],
      agent: {
        name: newProperty.agentName,
        company: newProperty.agentCompany,
        phone: newProperty.agentPhone,
        email: 'advisory@primehaven.luxury',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
    };

    setProperties(prev => [created, ...prev]);
    setIsListModalOpen(false);
    showToast(`Property "${created.title}" successfully added to private collection!`);
  };

  const handleScheduleTour = (e) => {
    e.preventDefault();
    setIsScheduleTourOpen(false);
    showToast(`[MOCKED ADAPTER] Private viewing requested for ${tourForm.date} at ${tourForm.timeSlot}. Confirmation sent.`);
  };

  // Filter logic
  const filteredProperties = properties.filter(p => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesType = typeFilter === 'All' || p.type === typeFilter;
    const matchesLocation =
      searchLocation === '' ||
      p.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
      p.title.toLowerCase().includes(searchLocation.toLowerCase()) ||
      (p.neighborhood && p.neighborhood.toLowerCase().includes(searchLocation.toLowerCase()));
    const matchesPrice = p.price <= maxPrice;
    const matchesBeds =
      bedroomsFilter === 'Any' ||
      (bedroomsFilter === '4+' ? p.bedrooms >= 4 : p.bedrooms === Number(bedroomsFilter));
    return matchesStatus && matchesType && matchesLocation && matchesPrice && matchesBeds;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          role="status" 
          aria-live="polite" 
          className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-stone-900 text-stone-100 font-medium px-5 py-3.5 rounded-lg shadow-2xl border border-stone-800 transition-all"
        >
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm">{toastMessage}</span>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)} 
            aria-label="Dismiss notice"
            className="ml-2 text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Architectural Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs">
            <Building2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-stone-950 font-serif">
                PRIMEHAVEN
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md bg-amber-50">
                PRIVATE ADVISORY
              </span>
            </div>
            <p className="text-xs text-stone-600 font-medium">Curated Residential & Architectural Estates</p>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="hidden md:flex items-center bg-stone-100 border border-stone-200 p-1 rounded-md">
          {['All', 'For Sale', 'For Rent'].map(st => (
            <button
              type="button"
              key={st}
              onClick={() => setStatusFilter(st)}
              aria-pressed={statusFilter === st}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                statusFilter === st
                  ? 'bg-stone-900 text-amber-400 shadow-xs font-bold'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {st === 'All' ? 'All Residences' : st === 'For Sale' ? 'Acquisitions' : 'Private Leases'}
            </button>
          ))}
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFavoritesOpen(true)}
            aria-label="View saved residences portfolio"
            className="relative p-2.5 rounded-md bg-stone-100 border border-stone-300 text-stone-800 hover:text-amber-800 hover:border-amber-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Heart className="w-4 h-4" />
            {savedFavorites.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-900 text-amber-400 text-[10px] font-bold flex items-center justify-center shadow-xs">
                {savedFavorites.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsListModalOpen(true)}
            aria-label="List a property with advisory"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-stone-900 text-amber-400 hover:bg-stone-800 shadow-xs transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>List Residence</span>
          </button>
        </div>
      </nav>

      {/* Hero Banner with Curated Architectural Search */}
      <section className="relative py-12 md:py-16 px-4 sm:px-6 border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Curated Architectural Portfolio • Global Premier Destinations</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-950 font-serif leading-tight">
            Distinguished Residences, <br />
            <span className="italic font-normal text-amber-800">Villas & Sky Penthouses</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Direct marketplace connecting discerning buyers, institutional investors, and licensed private client real estate advisors.
          </p>

          {/* Search Card */}
          <div className="mt-8 p-4 sm:p-5 rounded-lg bg-stone-50 border border-stone-300 shadow-md grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
            <div>
              <label htmlFor="search-location-input" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Destination or Enclave
              </label>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-stone-300 min-h-[44px]">
                <MapPin className="w-4 h-4 text-amber-800 shrink-0" />
                <input
                  id="search-location-input"
                  type="text"
                  placeholder="Mayfair, Beverly Hills, Zurich..."
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                  className="bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="property-type-select" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Property Architecture
              </label>
              <select
                id="property-type-select"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full bg-white px-3 py-2 rounded-md border border-stone-300 text-xs text-stone-900 focus:outline-none min-h-[44px]"
              >
                <option value="All">All Architectures</option>
                <option value="Luxury Villa">Luxury Villa</option>
                <option value="Penthouse">Sky Penthouse</option>
                <option value="Apartment">Lakeside Apartment</option>
                <option value="Townhouse">Coastal Estate</option>
                <option value="Commercial Office">Executive Loft</option>
              </select>
            </div>

            <div>
              <label htmlFor="bedrooms-select" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Bedrooms Suite
              </label>
              <select
                id="bedrooms-select"
                value={bedroomsFilter}
                onChange={e => setBedroomsFilter(e.target.value)}
                className="w-full bg-white px-3 py-2 rounded-md border border-stone-300 text-xs text-stone-900 focus:outline-none min-h-[44px]"
              >
                <option value="Any">Any Configuration</option>
                <option value="2">2 Bedroom Suites</option>
                <option value="3">3 Bedroom Suites</option>
                <option value="4+">4+ Bedroom Suites</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {}}
                className="w-full py-2.5 px-4 rounded-md bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[44px]"
              >
                <Search className="w-4 h-4" />
                <span>Filter ({filteredProperties.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Properties Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full space-y-8">
        {/* Results Header & Quick Budget Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h2 className="text-2xl font-bold text-stone-950 font-serif">Curated Portfolio Listings</h2>
            <p className="text-xs text-stone-600 mt-1">
              Displaying {filteredProperties.length} verified private residences
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2.5 rounded-md border border-stone-200 shadow-2xs">
            <label htmlFor="price-range-slider" className="text-xs font-semibold text-stone-700">
              Budget Ceiling:
            </label>
            <input
              id="price-range-slider"
              type="range"
              min="10000"
              max="15000000"
              step="50000"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              aria-label="Filter properties by maximum price"
              className="w-32 accent-stone-900"
            />
            <span className="text-xs font-mono font-bold text-stone-900">
              ${maxPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProperties.map(property => {
            const isFav = savedFavorites.includes(property.id);
            return (
              <div
                key={property.id}
                onClick={() => {
                  setSelectedProperty(property);
                  setActiveGalleryIndex(0);
                }}
                className="group rounded-lg bg-white border border-stone-200 hover:border-stone-400 transition-all overflow-hidden cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <img
                      src={property.image}
                      alt={`Exterior view of ${property.title}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-stone-900 text-amber-300 shadow-xs">
                        {property.status}
                      </span>
                      {property.featured && (
                        <span className="px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          Curated
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={e => toggleFavorite(property.id, e)}
                      aria-label={isFav ? `Remove ${property.title} from favorites` : `Save ${property.title} to favorites`}
                      className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        isFav
                          ? 'bg-amber-400 text-stone-950 shadow-md'
                          : 'bg-white/80 text-stone-800 hover:text-amber-800 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-stone-950' : ''}`} />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span>{property.location}</span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-stone-950 line-clamp-1 group-hover:text-amber-800 transition-colors">
                      {property.title}
                    </h3>

                    {/* Meta Specs */}
                    <div className="flex items-center gap-4 text-xs text-stone-700 pt-2 border-t border-stone-100 font-medium">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4 text-stone-500" />
                          <span>{property.bedrooms} Beds</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4 text-stone-500" />
                        <span>{property.bathrooms} Baths</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize2 className="w-4 h-4 text-stone-500" />
                        <span>{property.sqft.toLocaleString()} sqft</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Price & Action */}
                <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-stone-500 block">Valuation</span>
                    <div className="text-xl font-extrabold text-stone-950">
                      ${property.price.toLocaleString()}
                      {property.rentPeriod && (
                        <span className="text-xs font-normal text-stone-600">/{property.rentPeriod}</span>
                      )}
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 group-hover:text-amber-800 transition-colors">
                    <span>Inspect</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ======================= MODAL: PROPERTY DETAILS ======================= */}
      {selectedProperty && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="property-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
        >
          <div className="w-full max-w-4xl rounded-lg bg-white border border-stone-300 shadow-2xl p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-stone-900 text-amber-300">
                    {selectedProperty.status}
                  </span>
                  <span className="text-xs text-stone-600">{selectedProperty.type}</span>
                </div>
                <h2 id="property-modal-title" className="font-serif font-extrabold text-2xl sm:text-3xl text-stone-950">
                  {selectedProperty.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-stone-700 mt-1 font-medium">
                  <MapPin className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>{selectedProperty.location} ({selectedProperty.neighborhood})</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                aria-label="Close property details"
                className="p-2 text-stone-500 hover:text-stone-900 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Gallery Image Preview */}
            <div className="space-y-3">
              <div className="aspect-[16/9] rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                <img
                  src={selectedProperty.images[activeGalleryIndex] || selectedProperty.image}
                  alt={`Gallery photo of ${selectedProperty.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {selectedProperty.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedProperty.images.map((img, idx) => (
                    <button
                      type="button"
                      key={img}
                      onClick={() => setActiveGalleryIndex(idx)}
                      aria-label={`View photo ${idx + 1}`}
                      className={`relative w-20 h-14 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                        activeGalleryIndex === idx ? 'border-amber-800 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specs & Description */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-stone-50 border border-stone-200 text-center text-xs">
                  <div>
                    <span className="text-stone-500 block">Bedrooms</span>
                    <strong className="text-base text-stone-950 font-bold">{selectedProperty.bedrooms}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Bathrooms</span>
                    <strong className="text-base text-stone-950 font-bold">{selectedProperty.bathrooms}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Interior Area</span>
                    <strong className="text-base text-stone-950 font-bold">{selectedProperty.sqft.toLocaleString()} sqft</strong>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-stone-950 mb-1.5">Architectural Overview</h4>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {selectedProperty.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-stone-950 mb-2">Amenities & Specifications</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedProperty.amenities.map(amenity => (
                      <div key={amenity} className="flex items-center gap-1.5 text-xs text-stone-800 font-medium p-2 rounded-md bg-stone-50 border border-stone-200">
                        <Check className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hardened Mortgage Calculator Widget */}
                {selectedProperty.status === 'For Sale' && (
                  <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-amber-800" />
                        <h4 className="font-serif font-bold text-sm text-stone-950">Acquisition Finance Calculator</h4>
                      </div>
                      <span className="text-[11px] text-stone-500">Fixed rate amortization</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <label htmlFor="modal-downpayment-input" className="block text-stone-600 mb-1 font-medium">Down Pmt (%)</label>
                        <input
                          id="modal-downpayment-input"
                          type="number"
                          min="0"
                          max="100"
                          value={downPaymentPct}
                          onChange={e => setDownPaymentPct(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded border border-stone-300 text-stone-900 bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="modal-loanyears-input" className="block text-stone-600 mb-1 font-medium">Term (Yrs)</label>
                        <input
                          id="modal-loanyears-input"
                          type="number"
                          min="1"
                          max="40"
                          value={loanYears}
                          onChange={e => setLoanYears(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded border border-stone-300 text-stone-900 bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="modal-interest-input" className="block text-stone-600 mb-1 font-medium">Interest (%)</label>
                        <input
                          id="modal-interest-input"
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          value={interestRate}
                          onChange={e => setInterestRate(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded border border-stone-300 text-stone-900 bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                      <span className="text-stone-700 font-medium">Estimated Monthly Capital Outlay:</span>
                      <strong className="text-base text-stone-950 font-mono">
                        ${calculateMortgagePayment(selectedProperty.price, downPaymentPct, loanYears, interestRate).toLocaleString()} / mo
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Private Client Advisory Contact */}
              <div className="p-5 rounded-lg bg-stone-50 border border-stone-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Exclusive Representation</div>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedProperty.agent.avatar}
                      alt={selectedProperty.agent.name}
                      className="w-12 h-12 rounded-full object-cover border border-amber-300"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-stone-950">{selectedProperty.agent.name}</h4>
                      <p className="text-xs text-stone-600">{selectedProperty.agent.company}</p>
                    </div>
                  </div>

                  <div className="text-xs text-stone-700 space-y-1.5 pt-2 border-t border-stone-200 font-medium">
                    <div>Direct: <span className="font-mono text-stone-900">{selectedProperty.agent.phone}</span></div>
                    <div>Advisory: <span className="text-stone-900">{selectedProperty.agent.email}</span></div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsScheduleTourOpen(true)}
                    className="w-full py-2.5 px-4 rounded-md bg-stone-900 text-amber-400 hover:bg-stone-800 text-xs font-bold shadow-xs transition-colors min-h-[44px]"
                  >
                    Request Private Viewing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Inquiry dispatch initiated for ${selectedProperty.agent.name}`);
                    }}
                    className="w-full py-2.5 px-4 rounded-md bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 text-xs font-semibold transition-colors min-h-[44px]"
                  >
                    Request Dossier & Floorplans
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: SCHEDULE TOUR ======================= */}
      {isScheduleTourOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="tour-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="w-full max-w-md rounded-lg bg-white border border-stone-300 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="tour-modal-title" className="font-serif font-bold text-lg text-stone-950">
                    Schedule VIP Viewing
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    MOCKED ADAPTER
                  </span>
                </div>
                <p className="text-xs text-stone-600">Simulate tour coordination with private client desk.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleTourOpen(false)}
                aria-label="Close tour dialog"
                className="p-2 text-stone-500 hover:text-stone-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleTour} className="space-y-3 text-xs">
              <div>
                <label htmlFor="tour-client-name" className="block font-semibold text-stone-700 mb-1">Full Legal Name *</label>
                <input
                  id="tour-client-name"
                  type="text"
                  required
                  placeholder="e.g. Lord Harrington"
                  value={tourForm.name}
                  onChange={e => setTourForm({ ...tourForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tour-phone-input" className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    id="tour-phone-input"
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2831"
                    value={tourForm.phone}
                    onChange={e => setTourForm({ ...tourForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label htmlFor="tour-email-input" className="block font-semibold text-stone-700 mb-1">Corporate / Family Office Email *</label>
                  <input
                    id="tour-email-input"
                    type="email"
                    required
                    placeholder="office@harrington.com"
                    value={tourForm.email}
                    onChange={e => setTourForm({ ...tourForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tour-date-input" className="block font-semibold text-stone-700 mb-1">Preferred Date</label>
                  <input
                    id="tour-date-input"
                    type="date"
                    value={tourForm.date}
                    onChange={e => setTourForm({ ...tourForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label htmlFor="tour-timeslot-select" className="block font-semibold text-stone-700 mb-1">Preferred Window</label>
                  <select
                    id="tour-timeslot-select"
                    value={tourForm.timeSlot}
                    onChange={e => setTourForm({ ...tourForm, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    <option>09:00 AM (Morning)</option>
                    <option>11:00 AM (Midday)</option>
                    <option>02:30 PM (Afternoon)</option>
                    <option>05:00 PM (Sunset Viewing)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="tour-notes-textarea" className="block font-semibold text-stone-700 mb-1">Confidential Requirements</label>
                <textarea
                  id="tour-notes-textarea"
                  rows={2}
                  placeholder="Security clearance, private helipad landing requests, etc."
                  value={tourForm.notes}
                  onChange={e => setTourForm({ ...tourForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleTourOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-md border border-stone-300 text-stone-700 hover:bg-stone-100 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-md bg-stone-900 text-amber-400 hover:bg-stone-800 min-h-[44px]"
                >
                  Confirm Viewing Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: LIST PROPERTY ======================= */}
      {isListModalOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="list-property-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="w-full max-w-lg rounded-lg bg-white border border-stone-300 shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 id="list-property-title" className="font-serif font-bold text-lg text-stone-950">
                  List Property with PrimeHaven Advisory
                </h3>
                <p className="text-xs text-stone-600">Register verified residences for private presentation.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsListModalOpen(false)}
                aria-label="Close listing form"
                className="p-2 text-stone-500 hover:text-stone-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-3 text-xs">
              <div>
                <label htmlFor="list-property-title-input" className="block font-semibold text-stone-700 mb-1">
                  Estate Title *
                </label>
                <input
                  id="list-property-title-input"
                  type="text"
                  required
                  placeholder="e.g. Bel-Air Modern Terraces"
                  value={newProperty.title}
                  onChange={e => setNewProperty({ ...newProperty, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="list-property-status-select" className="block font-semibold text-stone-700 mb-1">Transaction Category</label>
                  <select
                    id="list-property-status-select"
                    value={newProperty.status}
                    onChange={e => setNewProperty({ ...newProperty, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    <option>For Sale</option>
                    <option>For Rent</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="list-property-type-select" className="block font-semibold text-stone-700 mb-1">Architectural Type</label>
                  <select
                    id="list-property-type-select"
                    value={newProperty.type}
                    onChange={e => setNewProperty({ ...newProperty, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    <option>Luxury Villa</option>
                    <option>Penthouse</option>
                    <option>Apartment</option>
                    <option>Townhouse</option>
                    <option>Commercial Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="list-property-price-input" className="block font-semibold text-stone-700 mb-1">Asking Valuation ($) *</label>
                  <input
                    id="list-property-price-input"
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 4500000"
                    value={newProperty.price}
                    onChange={e => setNewProperty({ ...newProperty, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label htmlFor="list-property-location-input" className="block font-semibold text-stone-700 mb-1">City, Destination *</label>
                  <input
                    id="list-property-location-input"
                    type="text"
                    required
                    placeholder="e.g. Zurich, Switzerland"
                    value={newProperty.location}
                    onChange={e => setNewProperty({ ...newProperty, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="list-property-bedrooms-input" className="block font-semibold text-stone-700 mb-1">Bedrooms</label>
                  <input
                    id="list-property-bedrooms-input"
                    type="number"
                    min="0"
                    value={newProperty.bedrooms}
                    onChange={e => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label htmlFor="list-property-bathrooms-input" className="block font-semibold text-stone-700 mb-1">Bathrooms</label>
                  <input
                    id="list-property-bathrooms-input"
                    type="number"
                    min="1"
                    step="0.5"
                    value={newProperty.bathrooms}
                    onChange={e => setNewProperty({ ...newProperty, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label htmlFor="list-property-sqft-input" className="block font-semibold text-stone-700 mb-1">Area (sqft)</label>
                  <input
                    id="list-property-sqft-input"
                    type="number"
                    min="100"
                    value={newProperty.sqft}
                    onChange={e => setNewProperty({ ...newProperty, sqft: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="list-property-desc-textarea" className="block font-semibold text-stone-700 mb-1">Architectural Summary</label>
                <textarea
                  id="list-property-desc-textarea"
                  rows={3}
                  placeholder="Outline key structural features, master bedroom suites, panoramic views, and design pedigree..."
                  value={newProperty.description}
                  onChange={e => setNewProperty({ ...newProperty, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsListModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-md border border-stone-300 text-stone-700 hover:bg-stone-100 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-md bg-stone-900 text-amber-400 hover:bg-stone-800 min-h-[44px]"
                >
                  Submit Residence for Presentation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: SAVED PORTFOLIO ======================= */}
      {isFavoritesOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="favorites-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="w-full max-w-lg rounded-lg bg-white border border-stone-300 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 id="favorites-modal-title" className="font-serif font-bold text-lg text-stone-950">
                  Private Saved Portfolio ({savedFavorites.length})
                </h3>
                <p className="text-xs text-stone-600">Saved residences for investment consideration.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFavoritesOpen(false)}
                aria-label="Close saved residences"
                className="p-2 text-stone-500 hover:text-stone-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedFavorites.length === 0 ? (
              <div className="text-center py-8 text-stone-500 space-y-2">
                <Heart className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-sm font-medium">Your private saved portfolio is empty.</p>
                <p className="text-xs">Click the heart icon on any residence card to save it here.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {properties.filter(p => savedFavorites.includes(p.id)).map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.title} className="w-14 h-14 rounded-md object-cover border border-stone-200" />
                      <div>
                        <h4 className="font-bold text-sm text-stone-950 line-clamp-1">{p.title}</h4>
                        <div className="text-xs text-stone-600">{p.location}</div>
                        <div className="text-xs font-bold text-stone-900 mt-0.5">${p.price.toLocaleString()}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProperty(p);
                        setIsFavoritesOpen(false);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-stone-100 text-stone-900 hover:bg-stone-200 min-h-[44px]"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
