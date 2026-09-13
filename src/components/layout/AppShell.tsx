"use client";

import React from "react";
import { BottomNavigation } from "./BottomNavigation";
import { SideNavigation } from "./SideNavigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg md:justify-center">
      <SideNavigation />
      <div className="flex w-full max-w-2xl flex-1 flex-col pb-20 md:mx-auto md:max-w-3xl md:pb-6">
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}
