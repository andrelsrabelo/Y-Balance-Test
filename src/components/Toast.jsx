'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

/** Notificação flutuante (sucesso/erro). Renderiza nada quando `toast` é null. */
export default function Toast({ toast }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div
      role="status"
      className={`animate-toast-in fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
        isSuccess ? 'bg-emerald-600' : 'bg-red-600'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{toast.message}</span>
    </div>
  );
}
