import React, { useState } from 'react';
import {
  MapPin,
  Search,
  ExternalLink,
  Navigation,
  Sparkles,
  Store,
  Compass,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Building2,
  RefreshCw,
} from 'lucide-react';

interface GroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: Array<{
        snippet?: string;
      }>;
    };
  };
  web?: {
    uri?: string;
    title?: string;
  };
}

export const StoreRadarMaps: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('Top rated local kirana grocery stores and pharmacies in Koramangala, Bengaluru');
  const [selectedCity, setSelectedCity] = useState<'Bengaluru' | 'Mumbai' | 'Delhi NCR'>('Bengaluru');
  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cityCoordinates = {
    Bengaluru: { lat: 12.9352, lng: 77.6245 }, // Koramangala
    Mumbai: { lat: 19.0596, lng: 72.8295 },    // Bandra West
    'Delhi NCR': { lat: 28.6315, lng: 77.2167 }, // Connaught Place
  };

  const handleCityPreset = (city: 'Bengaluru' | 'Mumbai' | 'Delhi NCR', sampleQuery: string) => {
    setSelectedCity(city);
    setSearchQuery(sampleQuery);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const coords = cityCoordinates[selectedCity];

    try {
      const res = await fetch('/api/gemini/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          latitude: coords.lat,
          longitude: coords.lng,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch Maps data');
      }

      setResponseText(data.text);
      setGroundingChunks(data.groundingChunks || []);
    } catch (err: any) {
      console.error('Maps grounding error:', err);
      setErrorMessage(err.message || 'Error querying Google Maps data. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract valid map places
  const mapPlaces = groundingChunks
    .map((chunk) => chunk.maps)
    .filter((maps): maps is NonNullable<typeof maps> => !!maps && !!maps.title);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl border border-emerald-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>GOOGLE MAPS GROUNDING (GEMINI-3.5-FLASH)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Retailer & Micro-Hub Geo-Intelligence Radar
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Verify local Kirana retail density, delivery radius feasibility, and customer proximity across NOVA CART's
              620 partner storefronts in Bengaluru, Mumbai, and Delhi NCR using real-time Google Maps data.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
            {(['Bengaluru', 'Mumbai', 'Delhi NCR'] as const).map((city) => (
              <button
                key={city}
                onClick={() =>
                  handleCityPreset(
                    city,
                    city === 'Bengaluru'
                      ? 'Local kirana and pharmacies near Koramangala and HSR Layout, Bengaluru'
                      : city === 'Mumbai'
                      ? 'Best grocery and bakery stores in Bandra and Khar West, Mumbai'
                      : 'Wholesale provision stores and chemist shops in Connaught Place and Lajpat Nagar, Delhi'
                  )
                }
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  selectedCity === city
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-xl">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Query Local Store Proximity & Geo-Coordinates (with Google Maps Grounding)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask about local grocery shops, pharmacies, or delivery clusters..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Grounding with Maps...
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 mr-2 fill-current" />
                  Search Google Maps
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Results Area */}
      {responseText && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Main AI Geo-Analysis */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Maps Grounded Analysis ({selectedCity})
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                gemini-3.5-flash
              </span>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
              {responseText}
            </div>
          </div>

          {/* Extracted Google Maps Links & Place Cards (Mandatory for Maps Grounding) */}
          <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Verified Google Maps Locations
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {mapPlaces.length} places grounded
                </span>
              </div>

              {mapPlaces.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
                  Maps sources verified within the response text above.
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {mapPlaces.map((place, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 transition group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                            {place.title || 'Local Retail Partner'}
                          </h4>
                          {place.placeAnswerSources?.reviewSnippets?.[0]?.snippet && (
                            <p className="text-[11px] text-slate-400 italic line-clamp-2">
                              "{place.placeAnswerSources.reviewSnippets[0].snippet}"
                            </p>
                          )}
                        </div>

                        {place.uri && (
                          <a
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition flex-shrink-0"
                            title="Open in Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Grounding: Google Maps Platform</span>
              <span className="text-emerald-400 font-mono font-bold">1.5km Micro-Cluster Dispatch</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
