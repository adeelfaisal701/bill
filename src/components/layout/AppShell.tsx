"use client";

import React from "react";
import { BottomNavigation } from "./BottomNavigation";
import { SideNavigation } from "./SideNavigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-bg">
      <SideNavigation />
      <div className="mobile-app-content flex min-w-0 flex-1 flex-col pb-20 md:pb-6">
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}
