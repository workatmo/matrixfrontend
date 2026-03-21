"use client";

import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Super Admin" }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-black border-b border-[#1f1f1f] flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left: Page title */}
      <div>
        <h1 className="text-white font-semibold text-lg">{title}</h1>
        <p className="text-gray-500 text-xs">Super Administrator Panel</p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:bg-[#1f1f1f] hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#1f1f1f] transition-colors"
          >
            <div className="w-8 h-8 bg-[#1f1f1f] border border-[#333] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-white text-sm font-medium leading-none">Admin</p>
              <p className="text-gray-500 text-xs mt-0.5">admin@matrix.com</p>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-[#1f1f1f] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#1f1f1f]">
                <p className="text-white text-sm font-medium">Admin User</p>
                <p className="text-gray-500 text-xs">admin@matrix.com</p>
              </div>
              <div className="p-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#1f1f1f] hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
}
