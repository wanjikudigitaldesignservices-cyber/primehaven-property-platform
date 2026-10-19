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
  ArrowRight
} from 'lucide-react';
import { initialProperties } from './data/propertiesData';

export default function App() {
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('primehaven_properties');
    return saved ? JSON.parse(saved) : initialProperties;
  });

  const [savedFavorites, setSavedFavorites] = useState(() => {
    const saved = localStorage.getItem('primehaven_favs');
    return saved ? JSON.parse(saved) : [];
  });

  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'For Sale', 'For Rent'
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000000);
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
  const [loanYears, setLoanYears] = useState(25);
  const [interestRate, setInterestRate] = useState(11.5);

  // New Property Form State
  const [newProperty, setNewProperty] = useState({
    title: '',
    type: 'Apartment',
    status: 'For Sale',
    price: '',
    rentPeriod: 'month',
    location: 'Kilimani, Nairobi',
    bedrooms: '3',
    bathrooms: '2',
    sqft: '2200',
    description: '',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    agentName: 'Alice Muthoni',
    agentPhone: '+254 700 123 456',
    agentCompany: 'Apex Premier Realty',
  });

  // Tour Booking Form
  const [tourForm, setTourForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    timeSlot: '10:00 AM',
    notes: '',
  });

  useEffect(() => {
    localStorage.setItem('primehaven_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('primehaven_favs', JSON.stringify(savedFavorites));
  }, [savedFavorites]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleFavorite = (propertyId, e) => {
    e?.stopPropagation();
    setSavedFavorites(prev => {
      const exists = prev.includes(propertyId);
      const updated = exists ? prev.filter(id => id !== propertyId) : [...prev, propertyId];
      showToast(exists ? 'Removed from saved properties.' : 'Added to your private portfolio!');
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
      description: newProperty.description || 'Exclusive luxury residence in a prime high-growth neighborhood.',
      image: newProperty.image,
      images: [newProperty.image],
      amenities: ['CCTV Security', 'Solar Water Heating', 'Designated Parking', 'High Speed Internet'],
      agent: {
        name: newProperty.agentName,
        company: newProperty.agentCompany,
        phone: newProperty.agentPhone,
        email: 'listings@primehaven.luxury',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      },
    };

    setProperties(prev => [created, ...prev]);
    setIsListModalOpen(false);
    showToast(`Property "${created.title}" successfully listed!`);
  };

  const handleScheduleTour = (e) => {
    e.preventDefault();
    setIsScheduleTourOpen(false);
    showToast(`VIP Viewing booked for ${tourForm.date} at ${tourForm.timeSlot}. The agent has been notified.`);
  };

  // Filter logic
  const filteredProperties = properties.filter(p => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesType = typeFilter === 'All' || p.type === typeFilter;
    const matchesLocation =
      searchLocation === '' ||
      p.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
      p.title.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesPrice = p.price <= maxPrice;
    const matchesBeds =
      bedroomsFilter === 'Any' ||
      (bedroomsFilter === '4+' ? p.bedrooms >= 4 : p.bedrooms === Number(bedroomsFilter));
    return matchesStatus && matchesType && matchesLocation && matchesPrice && matchesBeds;
  });

  // Calculate Mortgage Monthly Payment
  const calculateMortgage = (price) => {
    if (!price || price < 50000) return null;
    const principal = price * (1 - downPaymentPct / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanYears * 12;
    const monthly =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    return Math.round(monthly);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-amber-400 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-amber-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Luxury Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Building2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                PRIMEHAVEN
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full bg-amber-500/10">
                LUXURY REALTY
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Prime Commercial & Residential Estates</p>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {['All', 'For Sale', 'For Rent'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'All' ? 'Browse All' : st === 'For Sale' ? 'Buy Property' : 'Rent Property'}
            </button>
          ))}
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFavoritesOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          >
            <Heart className="w-4 h-4" />
            {savedFavorites.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-lg">
                {savedFavorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsListModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>List a Property</span>
          </button>
        </div>
      </nav>

      {/* Hero Banner with Integrated Search */}
      <section className="relative py-12 md:py-20 px-6 overflow-hidden border-b border-slate-800 bg-radial from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Over 1,200 High-Yield Listings in Nairobi & Environs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-serif">
            Discover Exceptional Estates, <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Villas & Penthouses
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Direct marketplace connecting verified landlords, high-net-worth buyers, corporate tenants, and premier licensed real estate agents.
          </p>

          {/* Search Card */}
          <div className="mt-8 p-3 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Location or Keyword</label>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                <MapPin className="w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  placeholder="Karen, Kilimani, Westlands..."
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Property Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Property Types</option>
                <option value="Luxury Villa">Luxury Villa</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Apartment">Modern Apartment</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Commercial Office">Commercial Suites</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bedrooms</label>
              <select
                value={bedroomsFilter}
                onChange={e => setBedroomsFilter(e.target.value)}
                className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Any">Any Bedrooms</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4+">4+ Bedrooms</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {}}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Search {filteredProperties.length} Homes</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Properties Section */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full space-y-6">
        {/* Results Header & Quick Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white font-serif">Curated Prime Listings</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredProperties.length} verified exclusive properties matching your criteria
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Budget Limit:</span>
            <input
              type="range"
              min="1000"
              max="1000000"
              step="5000"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-32 accent-amber-400"
            />
            <span className="text-xs font-mono font-bold text-amber-400">
              ${maxPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => {
            const isFav = savedFavorites.includes(property.id);
            return (
              <div
                key={property.id}
                onClick={() => {
                  setSelectedProperty(property);
                  setActiveGalleryIndex(0);
                }}
                className="group rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/50 transition-all duration-300 overflow-hidden cursor-pointer shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                        {property.status}
                      </span>
                      {property.featured && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
                          Featured
                        </span>
                      )}
                    </div>

                    <button
                      onClick={e => toggleFavorite(property.id, e)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                        isFav
                          ? 'bg-amber-400 text-slate-950 shadow-lg'
                          : 'bg-slate-950/60 text-white hover:text-amber-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-slate-950' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                      <div>
                        <span className="text-2xl font-extrabold font-mono text-amber-300">
                          ${property.price.toLocaleString()}
                        </span>
                        {property.rentPeriod && (
                          <span className="text-xs text-slate-300 ml-1">/{property.rentPeriod}</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-300 font-medium">{property.type}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{property.location}</span>
                    </div>

                    <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {property.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>

                    {/* Features Badges */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-amber-400" />
                        <span>{property.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 text-amber-400" />
                        <span>{property.bathrooms} Baths</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{property.sqft.toLocaleString()} SqFt</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agent & Inquiry Footer */}
                <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={property.agent.avatar}
                      alt={property.agent.name}
                      className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                    />
                    <div className="text-[11px]">
                      <div className="font-semibold text-white">{property.agent.name}</div>
                      <div className="text-slate-500">{property.agent.company}</div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ======================= MODAL: PROPERTY DETAILS & MORTGAGE ======================= */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gallery Section */}
            <div className="space-y-3 mb-6">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={selectedProperty.images?.[activeGalleryIndex] || selectedProperty.image}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                    {selectedProperty.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white">
                    {selectedProperty.type}
                  </span>
                </div>
              </div>

              {selectedProperty.images && selectedProperty.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {selectedProperty.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeGalleryIndex === idx ? 'border-amber-400 scale-105' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specs & Pricing */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedProperty.location} ({selectedProperty.neighborhood})</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                  {selectedProperty.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                  <span>{selectedProperty.bedrooms} Bedrooms</span>
                  <span>•</span>
                  <span>{selectedProperty.bathrooms} Bathrooms</span>
                  <span>•</span>
                  <span>{selectedProperty.sqft.toLocaleString()} SqFt Built Area</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-extrabold font-mono text-amber-400">
                  ${selectedProperty.price.toLocaleString()}
                  {selectedProperty.rentPeriod && (
                    <span className="text-sm text-slate-400 font-normal">/{selectedProperty.rentPeriod}</span>
                  )}
                </div>
                <div className="text-xs text-emerald-400 mt-1 font-semibold">
                  Verified Clean Title Deed & Ready For Transfer
                </div>
              </div>
            </div>

            {/* Description & Amenities */}
            <div className="py-6 border-b border-slate-800 space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Property Overview</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{selectedProperty.description}</p>

              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 pt-2">Features & Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProperty.amenities?.map((amenity, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Mortgage Calculator (if For Sale) */}
            {selectedProperty.status === 'For Sale' && (
              <div className="py-6 border-b border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>Interactive Mortgage Payment Estimator</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <label className="text-slate-400 block mb-1">Down Payment ({downPaymentPct}%)</label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={downPaymentPct}
                      onChange={e => setDownPaymentPct(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                    <div className="text-white font-bold font-mono mt-1">
                      ${Math.round(selectedProperty.price * (downPaymentPct / 100)).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <label className="text-slate-400 block mb-1">Loan Tenure ({loanYears} Years)</label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={loanYears}
                      onChange={e => setLoanYears(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                    <div className="text-white font-bold font-mono mt-1">{loanYears} Years Repayment</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <label className="text-slate-400 block mb-1">Interest Rate ({interestRate}%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={interestRate}
                      onChange={e => setInterestRate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded text-white font-bold"
                    />
                    <div className="text-amber-400 font-extrabold font-mono text-base mt-1">
                      ~${calculateMortgage(selectedProperty.price)?.toLocaleString()} / mo
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Direct Contact Actions */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProperty.agent.avatar}
                  alt={selectedProperty.agent.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-400"
                />
                <div>
                  <div className="font-bold text-white text-sm">{selectedProperty.agent.name}</div>
                  <div className="text-xs text-slate-400">{selectedProperty.agent.company}</div>
                  <div className="text-xs text-amber-400 font-mono">{selectedProperty.agent.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={`https://wa.me/254721889900?text=${encodeURIComponent(
                    `Hello PrimeHaven, I am interested in inquiring about ${selectedProperty.title} (${selectedProperty.id}) listed at $${selectedProperty.price}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Agent</span>
                </a>

                <button
                  onClick={() => setIsScheduleTourOpen(true)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Private Tour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: LIST A NEW PROPERTY ======================= */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsListModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-serif">Publish Property Listing</h3>
                <p className="text-xs text-slate-400">List your property for rent or sale to thousands of verified prospects</p>
              </div>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Property Title / Residence Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amber Ridge Signature Penthouse"
                  value={newProperty.title}
                  onChange={e => setNewProperty({ ...newProperty, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Listing Type</label>
                  <select
                    value={newProperty.status}
                    onChange={e => setNewProperty({ ...newProperty, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Property Category</label>
                  <select
                    value={newProperty.type}
                    onChange={e => setNewProperty({ ...newProperty, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Luxury Villa">Luxury Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Apartment">Modern Apartment</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Commercial Office">Commercial Suites</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Price in USD ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 450000 or 2500"
                    value={newProperty.price}
                    onChange={e => setNewProperty({ ...newProperty, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Location / Suburb</label>
                  <input
                    type="text"
                    placeholder="e.g. Westlands, Nairobi"
                    value={newProperty.location}
                    onChange={e => setNewProperty({ ...newProperty, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Bedrooms</label>
                  <input
                    type="number"
                    value={newProperty.bedrooms}
                    onChange={e => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Bathrooms</label>
                  <input
                    type="number"
                    value={newProperty.bathrooms}
                    onChange={e => setNewProperty({ ...newProperty, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Area (SqFt)</label>
                  <input
                    type="number"
                    value={newProperty.sqft}
                    onChange={e => setNewProperty({ ...newProperty, sqft: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">High Resolution Image URL</label>
                <input
                  type="url"
                  value={newProperty.image}
                  onChange={e => setNewProperty({ ...newProperty, image: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  placeholder="Highlight key design choices, finishes, and neighborhood conveniences..."
                  value={newProperty.description}
                  onChange={e => setNewProperty({ ...newProperty, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsListModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-400/20"
                >
                  Publish Listing to PrimeHaven
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: SCHEDULE TOUR ======================= */}
      {isScheduleTourOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsScheduleTourOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Book VIP Property Tour</h3>
                <p className="text-xs text-slate-400">Choose your convenient date for private viewing</p>
              </div>
            </div>

            <form onSubmit={handleScheduleTour} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Michael Mwangi"
                  value={tourForm.name}
                  onChange={e => setTourForm({ ...tourForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={tourForm.phone}
                    onChange={e => setTourForm({ ...tourForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Preferred Time</label>
                  <select
                    value={tourForm.timeSlot}
                    onChange={e => setTourForm({ ...tourForm, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="10:00 AM">10:00 AM Morning</option>
                    <option value="02:00 PM">02:00 PM Afternoon</option>
                    <option value="04:30 PM">04:30 PM Sunset View</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={tourForm.date}
                  onChange={e => setTourForm({ ...tourForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleTourOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  Confirm Viewing Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= DRAWER: SAVED FAVORITES ======================= */}
      {isFavoritesOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border-l border-slate-800 max-w-md w-full p-6 shadow-2xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h3 className="font-bold text-base text-white">Saved Properties ({savedFavorites.length})</h3>
                </div>
                <button
                  onClick={() => setIsFavoritesOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 overflow-y-auto max-h-[70vh]">
                {savedFavorites.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">No properties saved yet.</p>
                ) : (
                  properties
                    .filter(p => savedFavorites.includes(p.id))
                    .map(p => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3"
                      >
                        <img src={p.image} alt={p.title} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                          <p className="text-[11px] text-slate-400">{p.location}</p>
                          <div className="text-xs font-mono font-bold text-amber-400 mt-1">
                            ${p.price.toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={e => toggleFavorite(p.id, e)}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>

            <button
              onClick={() => setIsFavoritesOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
