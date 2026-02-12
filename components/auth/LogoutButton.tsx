"use client";

import { LogOut } from 'lucide-react';
import { logout } from '@/lib/auth/logout';

{/*
  
  LogoutButton component renders a button that triggers the logout process.
  It confirms with the user before proceeding with logout.
  
  */}

export default function LogoutButton() {
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}