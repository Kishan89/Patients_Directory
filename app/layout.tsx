import './globals.css'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Patient Directory',
  description: 'Frontend assignment using Next.js, Tailwind, and TypeScript',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   <html lang="en">
  <body className="bg-gray-50 text-gray-900 antialiased">
    <header className="bg-white text-gray-900 border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div>
            <div className="text-2xl font-semibold">Patient Directory</div>
            <div className="text-sm text-gray-500 mt-1">1000 Patient Found</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-700 px-4 py-2 rounded-md shadow-sm border"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download PDF Report
            </button>
          </div>
        </div>
      </div>
    </header>

    <main className="max-w-7xl mx-auto p-6">
      <div className="bg-white border rounded-lg shadow-sm">
        {children}
      </div>
    </main>
  </body>
</html>
  )
}
