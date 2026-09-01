import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Tv, 
  BookOpen, 
  Star, 
  Sparkles, 
  Plus, 
  Search, 
  ExternalLink,
  PlaySquare,
  Award,
  Layers,
  PlusCircle,
  MinusCircle,
  Clock,
  Compass
} from 'lucide-react';

const SUGGESTIONS = [
  {
    title: "Frieren: Beyond Journey's End",
    type: "Anime",
    tagline: "A quiet fantasy masterpiece exploring life after the hero's quest.",
    image: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
    badgeColor: "bg-blue-950 text-blue-300 border-blue-800/60"
  },
  {
    title: "Violet Evergarden",
    type: "Anime",
    tagline: "A breathtakingly emotional drama about discovering human connection.",
    image: "https://cdn.myanimelist.net/images/anime/1795/95088.jpg",
    badgeColor: "bg-blue-950 text-blue-300 border-blue-800/60"
  },
  {
    title: "Steins;Gate",
    type: "Anime",
    tagline: "Gripping time-travel sci-fi and psychological suspense.",
    image: "https://cdn.myanimelist.net/images/anime/1935/127974.jpg",
    badgeColor: "bg-blue-950 text-blue-300 border-blue-800/60"
  },
  {
    title: "Monster",
    type: "Anime",
    tagline: "A dark, intense psychological thriller masterpiece.",
    image: "https://cdn.myanimelist.net/images/anime/10/18793.jpg",
    badgeColor: "bg-blue-950 text-blue-300 border-blue-800/60"
  }
];

const FALLBACK_TOP_ANIME = [
  { title: "Fullmetal Alchemist: Brotherhood", rating: 10, status: "Completed", image_url: "https://myanimelist.net/images/anime/1208/94745.jpg" },
  { title: "Frieren: Beyond Journey's End", rating: 10, status: "Completed", image_url: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg" },
  { title: "Steins;Gate", rating: 9, status: "Completed", image_url: "https://cdn.myanimelist.net/images/anime/1935/127974.jpg" }
];

const FALLBACK_TOP_MANGA = [
  { title: "Berserk", rating: 10, status: "Completed", image_url: "https://myanimelist.net/images/manga/1/157897.jpg" },
  { title: "One Piece", rating: 10, status: "Ongoing", image_url: "https://myanimelist.net/images/manga/2/253146.jpg" },
  { title: "Vagabond", rating: 9, status: "Completed", image_url: "https://myanimelist.net/images/manga/1/259070.jpg" }
];

export default function Dashboard({ onNavigate, onOpenAddModal, onQuickAddSuggestion }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [ongoingEntries, setOngoingEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, ongoingData] = await Promise.all([
        api.getStats(),
        api.getEntries({ status: 'Ongoing' })
      ]);
      setStats(statsData);
      setOngoingEntries(ongoingData || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickProgress = async (entry, delta) => {
    const newProgress = Math.max(0, entry.progress + delta);
    try {
      setOngoingEntries(prev => prev.map(e => e.id === entry.id ? { ...e, progress: newProgress } : e));
      await api.updateProgress(entry.id, newProgress);
      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Progress update error:', err);
      loadDashboardData();
    }
  };

  const totalEntries = stats?.totalEntries || 0;
  const animeCount = stats?.animeCount || 0;
  const mangaCount = stats?.mangaCount || 0;
  const meanScore = stats?.meanScore || 0;

  const animePercent = totalEntries > 0 ? Math.round((animeCount / totalEntries) * 100) : 0;
  const mangaPercent = totalEntries > 0 ? Math.round((mangaCount / totalEntries) * 100) : 0;

  const topAnimeList = stats?.topAnime?.length > 0 ? stats.topAnime.slice(0, 3) : FALLBACK_TOP_ANIME;
  const topMangaList = stats?.topManga?.length > 0 ? stats.topManga.slice(0, 3) : FALLBACK_TOP_MANGA;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9 animate-fade-in">
      
      {/* Editorial Welcome Banner */}
      <div className="surface-card rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-white/[0.1]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border border-white/[0.15] p-2.5 flex items-center justify-center flex-shrink-0 shadow-md">
              <img 
                src="/kiroku.png" 
                alt="Kiroku" 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="text-2xl font-bold text-blue-400">K</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome, {user?.username || 'friend'}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-950 text-blue-300 font-mono font-semibold border border-blue-800/60">
                  {totalEntries} tracked
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                Your personal journal for anime episodes, manga chapters, and ratings.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenAddModal('Anime')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm active:scale-95"
            >
              <Tv className="w-4 h-4" />
              <span>+ Add Anime</span>
            </button>
            <button
              onClick={() => onOpenAddModal('Manga')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-700 hover:bg-rose-600 text-white transition-all shadow-sm active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>+ Add Manga</span>
            </button>
            <button
              onClick={() => onNavigate('discover', { type: 'anime' })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-white/[0.1] transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Search Online</span>
            </button>
            <button
              onClick={() => onNavigate('library')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-white/[0.1] transition-all"
            >
              <PlaySquare className="w-4 h-4" />
              <span>My Library</span>
            </button>
          </div>
        </div>
      </div>

      {/* Library Metrics Overview Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Anime Metric */}
        <div className="surface-card rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Anime Collection</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Tv className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tabular-nums font-mono">{animeCount}</span>
            <span className="text-xs text-slate-400 font-medium">titles</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span>Watched: <strong className="text-white font-bold tabular-nums">{stats?.totalEpisodesWatched || 0}</strong> eps</span>
            <span className="font-mono text-slate-200 font-bold">{animePercent}%</span>
          </div>
        </div>

        {/* Manga Metric */}
        <div className="surface-card rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Manga Collection</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tabular-nums font-mono">{mangaCount}</span>
            <span className="text-xs text-slate-400 font-medium">titles</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span>Read: <strong className="text-white font-bold tabular-nums">{stats?.totalChaptersRead || 0}</strong> chs</span>
            <span className="font-mono text-slate-200 font-bold">{mangaPercent}%</span>
          </div>
        </div>

        {/* Mean Rating */}
        <div className="surface-card rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mean Score</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 tabular-nums font-mono">
              {meanScore > 0 ? meanScore : '—'}
            </span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span>Rated Titles</span>
            <span className="font-bold text-white tabular-nums">{stats?.ratedCount || 0} items</span>
          </div>
        </div>

        {/* Total Logged */}
        <div className="surface-card rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Library Total</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tabular-nums font-mono">{totalEntries}</span>
            <span className="text-xs text-slate-400 font-medium">total entries</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span>Database</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" /> Local SQLite
            </span>
          </div>
        </div>

      </div>

      {/* Continue Watching / Reading Shelf (Active Queue) */}
      {ongoingEntries.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Continue Watching & Reading</h2>
            </div>
            <button 
              onClick={() => onNavigate('library', { status: 'Ongoing' })}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View All Ongoing ({ongoingEntries.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ongoingEntries.slice(0, 4).map((entry) => {
              const isAnime = entry.type === 'Anime';
              const progressUnit = isAnime ? 'Ep' : 'Ch';

              return (
                <div 
                  key={entry.id}
                  className="surface-card rounded-2xl p-4 flex flex-col justify-between group transition-all"
                >
                  <div className="flex gap-3.5">
                    {entry.image_url ? (
                      <img 
                        src={entry.image_url} 
                        alt={entry.title} 
                        className="w-16 h-22 object-cover rounded-xl border border-white/[0.1] flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-16 h-22 rounded-xl bg-slate-900 border border-white/[0.08] flex items-center justify-center text-slate-500 flex-shrink-0">
                        {isAnime ? <Tv className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        isAnime ? 'bg-blue-950 text-blue-300 border border-blue-800/60' : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      } mb-1`}>
                        {entry.type}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors" title={entry.title}>
                        {entry.title}
                      </h3>
                      <div className="mt-2 text-xs font-semibold text-slate-300">
                        Logged: <span className="font-mono text-white font-bold">{entry.progress}</span> {progressUnit}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Quick Step:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuickProgress(entry, -1)}
                        disabled={entry.progress <= 0}
                        title="Decrement -1"
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleQuickProgress(entry, 1)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+1 {progressUnit}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Curated Editorial Suggestions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Kiroku Editorial Picks</h2>
          </div>
          <button 
            onClick={() => onNavigate('discover')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>Explore Discovery</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUGGESTIONS.map((item, idx) => (
            <div
              key={idx}
              className="surface-card rounded-2xl flex flex-col justify-between p-4 shadow-sm group transition-all"
            >
              <div className="flex gap-3.5">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-22 object-cover rounded-xl border border-white/[0.1] shadow-sm flex-shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/100x140/0f172a/white?text=No+Cover';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor} mb-1.5`}>
                    {item.type}
                  </span>
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => onQuickAddSuggestion(item)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-blue-600 text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to My List</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Anime & Top Manga Showcases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Anime Showcase */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Top Rated Anime</h2>
            </div>
            <button 
              onClick={() => onNavigate('library', { type: 'Anime' })}
              className="text-xs font-semibold text-slate-400 hover:text-blue-400"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {topAnimeList.map((item, index) => (
              <div 
                key={index}
                className="surface-card flex items-center justify-between p-3.5 rounded-2xl group transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-950 text-blue-300 font-mono font-bold text-xs flex items-center justify-center border border-blue-800/60 flex-shrink-0">
                    0{index + 1}
                  </div>
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-10 h-14 object-cover rounded-lg border border-white/[0.1] flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 text-xs flex-shrink-0">
                      <Tv className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                        {item.status || 'Completed'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pl-3 flex-shrink-0">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-amber-300 tabular-nums font-mono">{item.rating || 10}/10</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Manga Showcase */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-bold text-white">Top Rated Manga</h2>
            </div>
            <button 
              onClick={() => onNavigate('library', { type: 'Manga' })}
              className="text-xs font-semibold text-slate-400 hover:text-rose-400"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {topMangaList.map((item, index) => (
              <div 
                key={index}
                className="surface-card flex items-center justify-between p-3.5 rounded-2xl group transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-rose-950 text-rose-300 font-mono font-bold text-xs flex items-center justify-center border border-rose-800/60 flex-shrink-0">
                    0{index + 1}
                  </div>
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-10 h-14 object-cover rounded-lg border border-white/[0.1] flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 text-xs flex-shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-rose-300 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                        {item.status || 'Ongoing'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pl-3 flex-shrink-0">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-amber-300 tabular-nums font-mono">{item.rating || 10}/10</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}
