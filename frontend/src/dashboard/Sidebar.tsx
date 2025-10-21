"use client";

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Building,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  User2,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useAuthStore from "./stores/UserStore"; // ✅ token-only store

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileToggle: (open: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Property Management", href: "/dashboard/properties", icon: Building },
  { name: "Requested Properties", href: "/dashboard/requested-properties", icon: FileText },
  { name: "My Profile", href: "/dashboard/my-profile", icon: User2 },
];

export default function Sidebar({ isMobileOpen, onMobileToggle }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onMobileToggle(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          "fixed lg:sticky z-50 h-full lg:h-screen top-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border flex-shrink-0">
          {!collapsed && <h1 className="text-xl font-bold text-sidebar-foreground">Admin Panel</h1>}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMobileToggle(false)}
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground",
                    isActive
                      ? "bg-blue-900 text-white hover:bg-blue-800"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2 lg:block hidden"
                  )}
                  onClick={() => onMobileToggle(false)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500",
              collapsed && "justify-center px-2"
            )}
            onClick={handleLogout} // ✅ logout using Zustand store
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </Button>
          {!collapsed && (
            <div className="text-sm text-sidebar-foreground/60 mt-2">ISONGA Dashboard</div>
          )}
        </div>
      </div>
    </>
  );
}
