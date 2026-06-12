'use client';

import { Activity, LogOut, User } from 'lucide-react';

export default function AppHeader({ userName, onLogout }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight text-slate-800 sm:text-lg">
              Y-Balance Test
            </h1>
            <p className="truncate text-xs text-slate-500">YBT-LQ · Quadrante Inferior</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">
            <User className="h-3.5 w-3.5" />
            {userName}
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
