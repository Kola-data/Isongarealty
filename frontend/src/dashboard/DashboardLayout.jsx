"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"

export default function DashboardLayout({ children, currentPath = "/" }) {
  const [currentRoute, setCurrentRoute] = useState(currentPath)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleNavigation = (path) => {
    setCurrentRoute(path)
    setIsMobileSidebarOpen(false)
    // In a real app, you'd use router.push(path) here
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentPath={currentRoute}
        onNavigate={handleNavigation}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={setIsMobileSidebarOpen}
      />
      <main className="flex-1 overflow-auto">
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 rounded-md hover:bg-accent">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
