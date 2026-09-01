import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Tv, BookOpen, Star, AlertCircle } from 'lucide-react';

export default function AddModal({ isOpen, onClose, onSuccess, initialData = null, defaultType = 'Anime' }) {
  const isEditing = !!initialData?.id;

  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Plan to Watch');
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const getStatusOptions = (curType) => {
    if (curType === 'Manga') {
      return ['Plan to Read', 'Ongoing', 'Completed', 'On Hold', 'Dropped'];
    }
    return ['Plan to Watch', 'Ongoing', 'Completed', 'On Hold', 'Dropped'];
  };

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || defaultType);
      setTitle(initialData.title || '');
      setStatus(initialData.status || (initialData.type === 'Manga' ? 'Plan to Read' : 'Plan to Watch'));
      setProgress(initialData.progress || 0);
      setRating(initialData.rating || 0);
      setImageUrl(initialData.image_url || '');
    } else {
      setType(defaultType);
      setTitle('');
      setStatus(defaultType === 'Manga' ? 'Plan to Read' : 'Plan to Watch');
      setProgress(0);
      setRating(0);
      setImageUrl('');
    }
    setError(null);
  }, [initialData, defaultType, isOpen]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'Manga' && status === 'Plan to Watch') {
      setStatus('Plan to Read');
    } else if (newType === 'Anime' && status === 'Plan to Read') {
      setStatus('Plan to Watch');
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    const planned = type === 'Manga' ? 'Plan to Read' : 'Plan to Watch';
    if (newStatus === planned) {
      setProgress(0);
      setRating(0);
    } else if (newStatus === 'Completed') {
      if (progress === 0) setProgress(1);
      if (rating === 0) setRating(8);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }

    const plannedStatus = type === 'Manga' ? 'Plan to Read' : 'Plan to Watch';
    if (status === plannedStatus) {
      if (progress !== 0 || rating !== 0) {
        setError(`${plannedStatus} entries should keep progress and rating at 0.`);
        return;
      }
    } else if (status === 'Completed') {
      if (progress <= 0) {
        setError('Completed entries need progress greater than 0.');
        return;
      }
      if (rating <= 0) {
        setError('Completed entries need a rating from 1 to 10.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        type,
        title: title.trim(),
        status,
        progress: parseInt(progress) || 0,
        rating: parseInt(rating) || 0,
        image_url: imageUrl.trim() || null
      };

      if (isEditing) {
        await api.updateEntry(initialData.id, payload);
      } else {
        await api.addEntry(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Check your input and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const statusList = getStatusOptions(type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg surface-card rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
              {type === 'Anime' ? <Tv className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Entry' : 'Add New Title'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Update status, progress, or score' : 'Save to your personal Kiroku library'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('Anime')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  type === 'Anime'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/[0.08] hover:text-white'
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Anime</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('Manga')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  type === 'Manga'
                    ? 'bg-rose-700 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/[0.08] hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Manga</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frieren: Beyond Journey's End"
              className="w-full px-3.5 py-2.5 surface-input rounded-xl text-white text-sm focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Status <span className="text-rose-400">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3.5 py-2.5 surface-input rounded-xl text-white text-sm focus:outline-none"
            >
              {statusList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Progress & Rating Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {type === 'Anime' ? 'Episodes' : 'Chapters'}
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="w-full px-3.5 py-2.5 surface-input rounded-xl text-white text-sm focus:outline-none tabular-nums font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Score (0 to 10)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3.5 py-2.5 surface-input rounded-xl text-white text-sm focus:outline-none tabular-nums font-mono"
                />
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Poster Image URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Poster Image URL <span className="text-slate-500">(Optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://myanimelist.net/images/..."
                className="flex-1 px-3.5 py-2.5 surface-input rounded-xl text-white text-sm focus:outline-none placeholder-slate-500"
              />
              {imageUrl && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/[0.1] bg-slate-950 flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add to List'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
