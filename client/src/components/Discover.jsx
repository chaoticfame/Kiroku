import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Search, 
  Tv, 
  BookOpen, 
  Star, 
  Plus, 
  Flame, 
  Info, 
  AlertCircle
} from 'lucide-react';

export default function Discover({ initialType = 'anime', onQuickAddFromJikan }) {
  const [searchType, setSearchType] = useState(initialType);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadTopItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTopJikan(searchType, 12);
      setResults(data);
    } catch (err) {
      console.error('Failed to fetch top items:', err);
      setError(err.message || 'Failed to load top titles from Jikan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      loadTopItems();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.searchJikan(searchType, query.trim(), 16);
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      loadTopItems();
    } else {
      handleSearch();
    }
  }, [searchType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Discover & Search</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-950 text-blue-300 border border-blue-800/60 font-mono">
              Jikan API v4
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search millions of anime and manga titles and add them directly to your Kiroku tracker.
          </p>
        </div>

        {/* Search Type Selector */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/[0.08] self-start md:self-auto">
          <button
            onClick={() => { setSearchType('anime'); setQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              searchType === 'anime'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Search Anime</span>
          </button>
          <button
            onClick={() => { setSearchType('manga'); setQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              searchType === 'manga'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Search Manga</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              searchType === 'anime'
                ? "Search anime by title (e.g., Attack on Titan, Jujutsu Kaisen)..."
                : "Search manga by title (e.g., Chainsaw Man, Berserk)..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3.5 text-sm surface-input rounded-2xl text-white placeholder-slate-500 focus:outline-none transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Section Title */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          {query.trim() ? (
            <>
              <Search className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">
                Search Results for "{query}"
              </h2>
            </>
          ) : (
            <>
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Worldwide Top {searchType === 'anime' ? 'Anime' : 'Manga'}
              </h2>
            </>
          )}
        </div>
        <span className="text-xs text-slate-400 font-medium">{results.length} titles</span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="surface-card rounded-2xl p-4 space-y-3 animate-pulse">
              <div className="aspect-[3/4] bg-slate-900 rounded-xl" />
              <div className="h-4 bg-slate-900 rounded w-3/4" />
              <div className="h-3 bg-slate-900 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {results.map((item) => {
            const isAnime = searchType === 'anime';
            const countLabel = isAnime ? `${item.episodes || '?'} Ep` : `${item.chapters || '?'} Ch`;

            return (
              <div
                key={item.mal_id}
                className="surface-card rounded-2xl overflow-hidden flex flex-col justify-between group transition-all"
              >
                {/* Poster image */}
                <div className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x400/0f172a/white?text=No+Cover';
                    }}
                  />

                  {/* Rating Tag */}
                  {item.score && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-slate-950/90 px-2 py-0.5 rounded-md border border-white/[0.12] text-amber-300 text-xs font-bold shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="tabular-nums">{item.score}</span>
                    </div>
                  )}

                  {/* Type Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      isAnime ? 'bg-blue-600 text-white' : 'bg-rose-700 text-white'
                    }`}>
                      {isAnime ? 'Anime' : 'Manga'}
                    </span>
                  </div>

                  {/* Ep/Ch tag */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950/90 text-slate-300 border border-white/[0.1] backdrop-blur-sm tabular-nums">
                      {countLabel}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1 group-hover:text-blue-300 transition-colors" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.synopsis || 'No description available.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
                    <button
                      onClick={() => onQuickAddFromJikan({
                        type: isAnime ? 'Anime' : 'Manga',
                        title: item.title,
                        image_url: item.image_url,
                        total_episodes: item.episodes || item.chapters || 0
                      })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Track Title</span>
                    </button>

                    <button
                      onClick={() => setSelectedItem(item)}
                      title="View Details"
                      className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/[0.08] transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl surface-card rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row gap-5">
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className="w-32 h-44 object-cover rounded-2xl border border-white/[0.12] flex-shrink-0 shadow-md"
              />
              <div className="space-y-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-mono">
                  {searchType === 'anime' ? 'Anime' : 'Manga'}
                </span>
                <h3 className="text-xl font-extrabold text-white">{selectedItem.title}</h3>
                {selectedItem.score && (
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="tabular-nums">Score: {selectedItem.score} / 10 (MAL)</span>
                  </div>
                )}
                <p className="text-xs text-slate-400 tabular-nums">
                  {searchType === 'anime' ? `Episodes: ${selectedItem.episodes || 'Unknown'}` : `Chapters: ${selectedItem.chapters || 'Unknown'}`}
                </p>
                {selectedItem.genres && selectedItem.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedItem.genres.map((g, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-white/[0.08]">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 border-t border-white/[0.08] pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Synopsis</h4>
              <p className="text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-2">
                {selectedItem.synopsis || 'No synopsis provided.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-white/[0.08]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const toAdd = {
                    type: searchType === 'anime' ? 'Anime' : 'Manga',
                    title: selectedItem.title,
                    image_url: selectedItem.image_url,
                    total_episodes: selectedItem.episodes || selectedItem.chapters || 0
                  };
                  setSelectedItem(null);
                  onQuickAddFromJikan(toAdd);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
              >
                + Add to My Kiroku List
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
