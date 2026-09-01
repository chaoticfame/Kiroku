import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  LayoutGrid, 
  List, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Star, 
  Tv, 
  BookOpen, 
  ArrowUpDown,
  PlusCircle,
  MinusCircle
} from 'lucide-react';

const STATUS_BADGES = {
  'Plan to Watch': 'bg-blue-950/90 text-blue-300 border-blue-800/70',
  'Plan to Read': 'bg-blue-950/90 text-blue-300 border-blue-800/70',
  'Ongoing': 'bg-emerald-950/90 text-emerald-300 border-emerald-800/70',
  'Completed': 'bg-purple-950/90 text-purple-300 border-purple-800/70',
  'On Hold': 'bg-amber-950/90 text-amber-300 border-amber-800/70',
  'Dropped': 'bg-rose-950/90 text-rose-300 border-rose-800/70',
  'Hiatus': 'bg-orange-950/90 text-orange-300 border-orange-800/70'
};

export default function Library({ initialType = 'All', onOpenAddModal, onEditEntry }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filters & Search
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await api.getEntries({
        type: typeFilter,
        status: statusFilter,
        search: searchQuery,
        sort: sortBy
      });
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [typeFilter, statusFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEntries();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleIncrement = async (entry, delta) => {
    const newProgress = Math.max(0, entry.progress + delta);
    try {
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, progress: newProgress } : e));
      await api.updateProgress(entry.id, newProgress);
    } catch (err) {
      console.error('Failed to update progress:', err);
      fetchEntries();
    }
  };

  const handleDelete = async (entryId, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from your list?`)) {
      try {
        setEntries(prev => prev.filter(e => e.id !== entryId));
        await api.deleteEntry(entryId);
      } catch (err) {
        alert(err.message || 'Failed to delete entry');
        fetchEntries();
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('⚠️ Are you sure you want to clear ALL entries in your library?')) {
      try {
        await api.clearAllEntries();
        setEntries([]);
      } catch (err) {
        alert(err.message || 'Failed to clear list');
        fetchEntries();
      }
    }
  };

  const statusOptions = typeFilter === 'Manga' 
    ? ['All', 'Ongoing', 'Plan to Read', 'Completed', 'On Hold', 'Dropped']
    : typeFilter === 'Anime'
    ? ['All', 'Ongoing', 'Plan to Watch', 'Completed', 'On Hold', 'Dropped']
    : ['All', 'Ongoing', 'Plan to Watch', 'Plan to Read', 'Completed', 'On Hold', 'Dropped'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>My Library</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700 font-mono">
              {entries.length} items
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage, update, and track your anime and manga collection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenAddModal(typeFilter !== 'All' ? typeFilter : 'Anime')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Entry</span>
          </button>

          {entries.length > 0 && (
            <button
              onClick={handleClearAll}
              title="Clear all entries"
              className="p-2 text-white hover:text-rose-200 hover:bg-rose-950/60 border border-white/[0.08] rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Grid / List View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/[0.08]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white hover:bg-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white hover:bg-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="surface-card p-4 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm surface-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['All', 'Anime', 'Manga'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  typeFilter === t
                    ? t === 'Anime'
                      ? 'bg-blue-600 text-white'
                      : t === 'Manga'
                      ? 'bg-rose-700 text-white'
                      : 'bg-slate-700 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {t === 'Anime' && <Tv className="w-3.5 h-3.5 inline mr-1" />}
                {t === 'Manga' && <BookOpen className="w-3.5 h-3.5 inline mr-1" />}
                {t}
              </button>
            ))}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="surface-input text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="recent">Recently Added</option>
              <option value="rating-desc">Rating: Highest First</option>
              <option value="rating-asc">Rating: Lowest First</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="progress-desc">Progress: Highest First</option>
            </select>
          </div>

        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/[0.06]">
          <span className="text-xs text-slate-400 mr-2 font-medium">Status:</span>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && (
        <div className="surface-card rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/[0.08] flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No titles in this view</h3>
          <p className="text-sm text-slate-400">
            {searchQuery || statusFilter !== 'All' || typeFilter !== 'All'
              ? 'Try adjusting your search terms or filter selection.'
              : 'Your library is empty. Start by logging your favorite anime or manga!'}
          </p>
          <button
            onClick={() => onOpenAddModal('Anime')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Add Title</span>
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && viewMode === 'grid' && entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {entries.map((entry) => {
            const isAnime = entry.type === 'Anime';
            const progressUnit = isAnime ? 'Ep' : 'Ch';
            const statusClass = STATUS_BADGES[entry.status] || 'bg-slate-900 text-slate-300 border-white/[0.1]';

            return (
              <div
                key={entry.id}
                className="surface-card rounded-2xl overflow-hidden flex flex-col justify-between group transition-all"
              >
                {/* Poster & Type Badge */}
                <div className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden">
                  {entry.image_url ? (
                    <img
                      src={entry.image_url}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/300x400/0f172a/white?text=No+Poster';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950 gap-2">
                      {isAnime ? <Tv className="w-10 h-10" /> : <BookOpen className="w-10 h-10" />}
                      <span className="text-xs font-bold uppercase">{entry.type}</span>
                    </div>
                  )}

                  {/* Badges on Poster */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isAnime ? 'bg-blue-600 text-white' : 'bg-rose-700 text-white'
                      }`}
                    >
                      {entry.type}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-slate-950/90 px-2 py-0.5 rounded-md border border-white/[0.12] text-amber-300 text-xs font-bold shadow-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="tabular-nums">{entry.rating > 0 ? `${entry.rating}/10` : '—'}</span>
                  </div>

                  {/* Status Pill Bottom */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ${statusClass}`}>
                      {entry.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1 group-hover:text-blue-400 transition-colors" title={entry.title}>
                      {entry.title}
                    </h3>
                  </div>

                  {/* Progress Counter Stepper */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
                    <span className="text-xs text-slate-400 font-medium">
                      Progress: <strong className="text-white font-bold tabular-nums">{entry.progress}</strong> {progressUnit}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleIncrement(entry, -1)}
                        disabled={entry.progress <= 0}
                        title="Decrement -1"
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleIncrement(entry, 1)}
                        title="Increment +1"
                        className="p-1 rounded-md text-blue-400 hover:text-white hover:bg-blue-600 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
                    <button
                      onClick={() => onEditEntry(entry)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(entry.id, entry.title)}
                      className="p-1.5 text-white hover:text-rose-200 rounded-lg hover:bg-rose-950/60 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {!loading && viewMode === 'table' && entries.length > 0 && (
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-xs uppercase font-bold text-slate-400 border-b border-white/[0.08]">
                <tr>
                  <th className="px-4 py-3.5">Cover</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5">Rating</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {entries.map((entry) => {
                  const isAnime = entry.type === 'Anime';
                  const statusClass = STATUS_BADGES[entry.status] || 'bg-slate-900 text-slate-300 border-white/[0.1]';

                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5">
                        {entry.image_url ? (
                          <img
                            src={entry.image_url}
                            alt=""
                            className="w-9 h-12 object-cover rounded-lg border border-white/[0.1]"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-9 h-12 rounded-lg bg-slate-900 border border-white/[0.08] flex items-center justify-center text-slate-500">
                            {isAnime ? <Tv className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isAnime ? 'bg-blue-950 text-blue-300 border border-blue-800/60' : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-white max-w-xs truncate">
                        {entry.title}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusClass}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white tabular-nums">
                            {entry.progress} {isAnime ? 'Ep' : 'Ch'}
                          </span>
                          <button
                            onClick={() => handleIncrement(entry, -1)}
                            disabled={entry.progress <= 0}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleIncrement(entry, 1)}
                            className="p-1 rounded text-blue-400 hover:text-white hover:bg-blue-600"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1 text-amber-300 font-bold tabular-nums">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{entry.rating > 0 ? `${entry.rating}/10` : '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right space-x-2">
                        <button
                          onClick={() => onEditEntry(entry)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id, entry.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
