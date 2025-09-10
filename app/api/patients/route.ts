import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

type Contact = {
  address?: string | null
  number?: string | null
  email?: string | null
}

export type Patient = {
  patient_id: number
  patient_name: string
  age: number
  photo_url?: string | null
  contact: Contact[]
  medical_issue?: string | null
}

type SortableField = 'patient_id' | 'patient_name' | 'age'

let cached: Patient[] | null = null

async function loadData(): Promise<Patient[]> {
  if (cached) return cached
  const filePath = path.join(process.cwd(), 'data', 'patients.json')
  const raw = await fs.readFile(filePath, 'utf-8')
  cached = JSON.parse(raw) as Patient[]
  return cached
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const params = url.searchParams

    const limit = Math.max(1, Math.min(100, Number(params.get('limit') || '20')))
    const page = Math.max(1, Number(params.get('page') || '1'))
    const q = (params.get('q') || '').toLowerCase().trim()
    const medical = params.get('medical')?.toLowerCase()?.trim() || null
    const minAge = Number(params.get('minAge') || '0')
    const maxAge = Number(params.get('maxAge') || '150')
    const sortBy: SortableField = (params.get('sortBy') as SortableField) || 'patient_id'
    const order: 'asc' | 'desc' =
      (params.get('order') || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc'

    const data = await loadData()
    let filtered = data

    if (q) {
      filtered = filtered.filter((p) => {
        const phone = p.contact?.[0]?.number || ''
        const email = (p.contact?.[0]?.email || '').toLowerCase()
        return (
          String(p.patient_id).includes(q) ||
          p.patient_name?.toLowerCase().includes(q) ||
          phone.includes(q) ||
          email.includes(q)
        )
      })
    }

    if (medical) {
      filtered = filtered.filter((p) => (p.medical_issue || '').toLowerCase() === medical)
    }

    if (minAge > 0 || maxAge < 150) {
      filtered = filtered.filter((p) => p.age >= minAge && p.age <= maxAge)
    }

    filtered = filtered.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal
      }

      return order === 'asc'
        ? String(aVal || '').localeCompare(String(bVal || ''))
        : String(bVal || '').localeCompare(String(aVal || ''))
    })

    const start = (page - 1) * limit
    const pageData = filtered.slice(start, start + limit)

    return NextResponse.json({
      total: filtered.length,
      page,
      limit,
      data: pageData,
    })
  } catch (err) {
    if (err instanceof Error) {
      console.error('API Error', err.message)
      return NextResponse.json({ error: 'Failed to load patients', detail: err.message }, { status: 500 })
    }
    console.error('Unknown API error', err)
    return NextResponse.json({ error: 'Failed to load patients' }, { status: 500 })
  }
}
