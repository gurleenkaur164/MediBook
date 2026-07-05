import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorService } from '../services';
import { DoctorCard } from '../components/DoctorCard';
import { CardSkeleton, EmptyState } from '../components/LoadingStates';
import { Navbar } from '../components/Navbar';
import { Search, SlidersHorizontal, X, Stethoscope, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'fee_asc', label: 'Fee: Low to High' },
  { value: 'fee_desc', label: 'Fee: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
];

export const DoctorList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    specialization: searchParams.get('specialization') || '',
    minFee: '',
    maxFee: '',
    sortBy: 'rating',
  });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await doctorService.getAll(params);
      setDoctors(data.data.doctors || []);
      setTotal(data.data.total || 0);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  useEffect(() => {
    doctorService.getSpecializations()
      .then(({ data }) => setSpecializations(data.data.specializations || []))
      .catch(() => {});
  }, []);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const clearFilters = () => applyFilters({ search: '', specialization: '', minFee: '', maxFee: '', sortBy: 'rating' });

  const activeFilterCount = [filters.specialization, filters.minFee, filters.maxFee].filter(Boolean).length;

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8 page-enter">
          <h1 className="text-4xl font-bold text-white mb-2">Find Your <span className="gradient-text">Doctor</span></h1>
          <p className="text-slate-400">Browse {total} verified specialists</p>
        </div>

        {/* Search + Filters bar */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-64">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, specialization, location..."
              value={filters.search}
              onChange={(e) => applyFilters({ ...filters, search: e.target.value })}
              className="input-field pl-10"
            />
          </div>

          <select
            value={filters.sortBy}
            onChange={(e) => applyFilters({ ...filters, sortBy: e.target.value })}
            className="input-field w-auto min-w-40 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              activeFilterCount > 0
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                : 'border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="glass-card p-5 mb-6 grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Specialization</label>
              <select
                value={filters.specialization}
                onChange={(e) => applyFilters({ ...filters, specialization: e.target.value })}
                className="input-field text-sm"
              >
                <option value="">All Specializations</option>
                {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Min Fee (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minFee}
                onChange={(e) => applyFilters({ ...filters, minFee: e.target.value })}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Max Fee (₹)</label>
              <input
                type="number"
                placeholder="10000"
                value={filters.maxFee}
                onChange={(e) => applyFilters({ ...filters, maxFee: e.target.value })}
                className="input-field text-sm"
              />
            </div>
            {activeFilterCount > 0 && (
              <div className="sm:col-span-3 flex justify-end">
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300">
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active specialization chip */}
        {filters.specialization && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-400">Filtered by:</span>
            <button
              onClick={() => applyFilters({ ...filters, specialization: '' })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs"
            >
              {filters.specialization} <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No doctors found"
            description="Try adjusting your search or filters."
            action={<button onClick={clearFilters} className="btn-gradient px-5 py-2.5 rounded-xl text-white text-sm">Clear Filters</button>}
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:border-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                >
                  Previous
                </button>
                <span className="text-slate-500 text-sm">Page {page} of {Math.ceil(total / 12)}</span>
                <button
                  disabled={page >= Math.ceil(total / 12)}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:border-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
