'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';

type Patient = {
  patient_id: number;
  patient_name: string;
  age: number;
  photo_url?: string | null;
  contact?: { address?: string | null; number?: string | null; email?: string | null }[];
  medical_issue?: string | null;
};

export default function PatientsTable() {
  const [data, setData] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 350);
  
  const [filters, setFilters] = useState({
    medical: '',
    minAge: '',
    maxAge: '',
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const [sortBy, setSortBy] = useState('patient_id');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true); setError(null);
      try {
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('page', String(page));
        if (debouncedQ) params.set('q', debouncedQ);
        if (appliedFilters.medical) params.set('medical', appliedFilters.medical);
        if (appliedFilters.minAge) params.set('minAge', appliedFilters.minAge);
        if (appliedFilters.maxAge) params.set('maxAge', appliedFilters.maxAge);
        if (sortBy) { params.set('sortBy', sortBy); params.set('order', order); }

        const res = await fetch(`/api/patients?${params.toString()}`);
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        if (!mounted) return;
        setData(json.data);
        setTotal(json.total);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Unknown error');
      } finally { if (mounted) setLoading(false); }
    }
    fetchData();
    return () => { mounted = false; }
  }, [page, limit, debouncedQ, appliedFilters, sortBy, order]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const cleared = { medical: '', minAge: '', maxAge: '' };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
    setShowFilters(false);
  };
  
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="px-8 pb-8">
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 border rounded p-4">
        <div className="relative w-full md:flex-1">
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by ID, name, phone, or email..."
            className="w-full bg-white border p-3 rounded shadow-sm placeholder:text-slate-400"
          />
          <svg className="absolute right-3 top-3 opacity-40" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" /></svg>
        </div>

        <div className="relative w-full md:w-auto" ref={filterRef}>
          <button onClick={() => setShowFilters(s => !s)} className="w-full md:w-auto px-4 py-3 border rounded bg-white flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Filter
          </button>
          
          {showFilters && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-10 p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Medical Issue</label>
                  <select value={filters.medical} onChange={e => setFilters(f => ({ ...f, medical: e.target.value }))} className="w-full border px-3 py-2 rounded bg-white">
                    <option value="">Any</option>
                    <option value="fever">Fever</option>
                    <option value="headache">Headache</option>
                    <option value="sprained ankle">Sprained Ankle</option>
                    <option value="rash">Rash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Age Range</label>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={filters.minAge} onChange={e => setFilters(f => ({ ...f, minAge: e.target.value }))} className="w-full border p-2 rounded" />
                    <span className="text-slate-500">-</span>
                    <input type="number" placeholder="Max" value={filters.maxAge} onChange={e => setFilters(f => ({ ...f, maxAge: e.target.value }))} className="w-full border p-2 rounded" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button onClick={handleClearFilters} className="text-sm text-slate-600 hover:underline">Clear Filters</button>
                <button onClick={handleApplyFilters} className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">Apply</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading…</div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : (
          <table className="min-w-full table-fixed">
            <thead className="text-sm text-slate-600">
              <tr>
                <th className="text-left py-3 pr-6 w-[80px]">ID</th>
                <th className="text-left py-3 pr-6 w-[360px]">Name</th>
                <th className="text-left py-3 pr-6 w-[80px]">Age</th>
                <th className="text-left py-3 pr-6 w-[160px]">Medical Issue</th>
                <th className="text-left py-3 pr-6 w-[300px]">Address</th>
                <th className="text-left py-3 pr-6 w-[180px]">Phone Number</th>
                <th className="text-left py-3 pr-6 w-[260px]">Email ID</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {data.map((p) => {
                const phone = p.contact?.[0]?.number || 'N/A';
                const email = p.contact?.[0]?.email || 'N/A';
                const address = p.contact?.[0]?.address || 'N/A';
                const phoneIsNA = phone === 'N/A';
                const emailIsNA = email === 'N/A';
                return (
                  <tr key={p.patient_id} className="border-t hover:bg-slate-50">
                    <td className="py-4 pr-6">
                      <div className="text-xs text-slate-500">{String(p.patient_id).padStart(3, '0')}</div>
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                          {(p.patient_name || '').split(' ').map(s => s[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="text-slate-900 font-medium truncate">{p.patient_name}</div>
                          <div className="text-xs text-slate-400">Age {p.age}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-6">{p.age}</td>
                    <td className="py-4 pr-6 font-medium">{p.medical_issue || 'N/A'}</td>
                    <td className="py-4 pr-6">{address}</td>
                    <td className={`py-4 pr-6 ${phoneIsNA ? 'text-red-600' : 'text-emerald-600 font-medium'}`}>
                      {phoneIsNA ? 'N/A' : <a href={`tel:${phone}`} className="hover:underline">{phone}</a>}
                    </td>
                    <td className={`${emailIsNA ? 'text-red-600' : 'text-emerald-600'} py-4 pr-6`}>
                      {emailIsNA ? 'N/A' : <a href={`mailto:${email}`} className="hover:underline">{email}</a>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-slate-600">Showing {total === 0 ? 0 : (page - 1) * limit + 1} - {Math.min(total, page * limit)} of {total} results</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <div className="text-sm">Page {page} / {totalPages}</div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}