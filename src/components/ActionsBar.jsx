'use client';

import { FileSpreadsheet, Loader2, RotateCcw, Save } from 'lucide-react';

export default function ActionsBar({ onExportExcel, onSave, onReset, saving }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onExportExcel}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <FileSpreadsheet className="h-5 w-5" />
          Baixar Excel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {saving ? 'Salvando…' : 'Salvar Dados no Servidor'}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
        >
          <RotateCcw className="h-5 w-5" />
          Nova Avaliação
        </button>
      </div>
    </section>
  );
}
