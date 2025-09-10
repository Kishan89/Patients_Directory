// app/api/patients/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

type Contact = { address?: string | null; number?: string | null; email?: string | null; };
type Patient = {
  patient_id: number;
  patient_name: string;
  age: number;
  photo_url?: string | null;
  contact: Contact[];
  medical_issue?: string | null;
};

let cached: Patient[] | null = null;

async function loadData(): Promise<Patient[]> {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), 'data', 'patients.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  cached = JSON.parse(raw) as Patient[];
  return cached;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const limit = Math.max(1, Math.min(100, Number(params.get('limit') || '20')));
    const page = Math.max(1, Number(params.get('page') || '1'));
    const q = (params.get('q') || '').toLowerCase().trim(); // search
    const medical = params.get('medical')?.toLowerCase()?.trim() || null;
    const sortBy = params.get('sortBy') || 'patient_id';
    const order = (params.get('order') || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';

    const data = await loadData();

    let filtered = data;

    // Search across id, name, phone, email
    if (q) {
      filtered = filtered.filter(p => {
        const phone = p.contact?.[0]?.number || '';
        const email = (p.contact?.[0]?.email || '').toLowerCase();
        return String(p.patient_id).includes(q)
          || p.patient_name?.toLowerCase().includes(q)
          || phone.includes(q)
          || email.includes(q);
      });
    }

    // Filter by medical_issue
    if (medical) {
      filtered = filtered.filter(p => (p.medical_issue || '').toLowerCase() === medical);
    }

    // Sorting (support 'age' and 'patient_name' or numeric)
    filtered = filtered.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return order === 'asc'
        ? String(aVal || '').localeCompare(String(bVal || ''))
        : String(bVal || '').localeCompare(String(aVal || ''));
    });

    const start = (page - 1) * limit;
    const pageData = filtered.slice(start, start + limit);

    return NextResponse.json({
      total: filtered.length,
      page,
      limit,
      data: pageData,
    });
  } catch (err) {
    console.error('API Error', err);
    return NextResponse.json({ error: 'Failed to load patients' }, { status: 500 });
  }
}
