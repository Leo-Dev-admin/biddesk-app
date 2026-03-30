import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BidDesk — Procurement OS for Homebuilders',
  description: 'Manage bid packages, compare vendors, and streamline procurement across all your communities.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bd-bg text-bd-text antialiased">
        {children}
      </body>
    </html>
  )
}
