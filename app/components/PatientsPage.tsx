'use client'
import PatientsTable from './PatientsTable'

export default function PatientsPage() {
  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Patient Directory</h1>
            <div className="text-sm text-slate-500 mt-1">1000 Patient Found</div>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded shadow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Add
            </button>

            <button className="inline-flex items-center gap-2 border px-3 py-2 rounded bg-white hover:bg-slate-50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Download PDF Report
            </button>
          </div>
        </div>

        <div className="mt-4 border-b" />

        <div className="mt-4">
          <div className="flex items-center gap-6">
            <div className="flex gap-6 border-b-2 border-transparent">
              <button className="pb-3 border-b-2 border-blue-600 text-sm font-medium text-blue-700">Table View</button>
              <button className="pb-3 text-sm font-medium text-slate-500">Card View</button>
            </div>
          </div>
        </div>
      </div>

      <PatientsTable />
    </div>
  )
}
