'use client'
import React, { useEffect, useState } from 'react';
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
  const [medical, setMedical] = useState('');
  const [sortBy, setSortBy] = useState('patient_id');
  const [order, setOrder] = useState<'asc'|'desc'>('asc');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData(){
      setLoading(true); setError(null);
      try {
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('page', String(page));
        if (debouncedQ) params.set('q', debouncedQ);
        if (medical) params.set('medical', medical);
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
  }, [page, limit, debouncedQ, medical, sortBy, order]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="px-8 pb-8">
      <div className="flex items-center justify-between bg-slate-50 border rounded p-4">
        <div className="flex items-center gap-3 w-full pr-4">
          <div className="relative flex-1">
            <input
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
              placeholder="Search by invoice number, name, amount..."
              className="w-full bg-white border p-3 rounded shadow-sm placeholder:text-slate-400"
            />
            <svg className="absolute right-3 top-3 opacity-40" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2"/></svg>
          </div>

          <button className="px-4 py-2 border rounded bg-white flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 10h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 14h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Filter
          </button>
        </div>

        <div className="ml-6">
          <select value={medical} onChange={e => { setMedical(e.target.value); setPage(1); }} className="border px-3 py-2 rounded bg-white">
            <option value="">All issues</option>
            <option value="fever">Fever</option>
            <option value="headache">Headache</option>
            <option value="sprained ankle">Sprained ankle</option>
            <option value="rash">Rash</option>
          </select>
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
                      <div className="text-xs text-slate-500">{String(p.patient_id).padStart(3,'0')}</div>
                    </td>

                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                          { (p.patient_name || '').split(' ').map(s=>s[0]).slice(0,2).join('') }
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
        <div className="text-sm text-slate-600">Showing {total === 0 ? 0 : (page-1)*limit+1} - {Math.min(total, page*limit)} of {total} results</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <div className="text-sm">Page {page} / {totalPages}</div>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
