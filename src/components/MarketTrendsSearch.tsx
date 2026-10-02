import React, { useState } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  Sparkles,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  FileText,
  Building,
  Target,
} from 'lucide-react';

interface WebChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export const MarketTrendsSearch: React.FC = () => {
  const [query, setQuery] = useState(
    'Indian quick-commerce market delivery time benchmarks, cancellation rates, and customer retention strategies 2025 2026'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<WebChunk[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presets = [
    {
      label: 'Quick-Commerce SLA Benchmarks',
      text: 'What are current average delivery times and cancellation rates for Indian quick commerce platforms like Zepto, Blinkit, and Instamart?',
    },
    {
      label: 'FMCG Kirana Margins & Stockouts',
      text: 'How do Indian neighborhood Kirana stores handle real-time inventory and supplier restocks for fast-moving items?',
    },
    {
      label: 'Repeat Retention Strategies',
      text: 'What retention mechanics and loyalty models work best for high-frequency grocery shoppers in Indian metros?',
    },
  ];

  const handleSearch = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch search grounding data');
      }

      setResponseText(data.text);
      setGroundingChunks(data.groundingChunks || []);
    } catch (err: any) {
      console.error('Search grounding error:', err);
      setErrorMessage(err.message || 'Error querying Google Search data.');
    } finally {
      setIsLoading(false);
    }
  };

  const webSources = groundingChunks
    .map((chunk) => chunk.web)
    .filter((web): web is NonNullable<typeof web> => !!web && !!web.uri);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl border border-blue-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-300 backdrop-blur-md">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>GOOGLE SEARCH GROUNDING (GEMINI-3.5-FLASH)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Quick-Commerce Market Trends & Competitor Intelligence
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Ground your business turnaround decisions with real-time web intelligence on competitor delivery SLAs,
              discount breakage trends, Kirana partner retention, and FMCG consumer purchasing patterns in India.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 text-xs">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 font-medium">Live Web Search Verification</span>
          </div>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 font-bold whitespace-nowrap flex-shrink-0">
          Suggested Audits:
        </span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(p.text);
              handleSearch(p.text);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold whitespace-nowrap transition flex-shrink-0"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Search Input Box */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-3"
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Search Topic / Competitive Benchmark Query
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-blue-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about quick-commerce trends, FMCG pricing, delivery strategies..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Searching Web...
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 mr-2" />
                  Search Google
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

      {/* Results Section */}
      {responseText && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Main AI Text Output */}
          <div className="lg:col-span-8 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Search Grounded Market Intelligence
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold">
                gemini-3.5-flash
              </span>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
              {responseText}
            </div>
          </div>

          {/* Sources and Citations */}
          <div className="lg:col-span-4 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">
                    Cited Web Sources
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {webSources.length} sources
                </span>
              </div>

              {webSources.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
                  Web sources referenced directly in the summary above.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {webSources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-blue-500/40 transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition line-clamp-1">
                          {source.title || source.uri}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 flex-shrink-0 ml-1.5" />
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                        {source.uri}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              Live Google Search Grounding with citations
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
