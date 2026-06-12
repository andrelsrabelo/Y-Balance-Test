'use client';

import { Footprints } from 'lucide-react';
import { DIRECTIONS, fmt } from '@/lib/calculations';
import { DecimalInput } from './inputs';

/**
 * Bloco de coleta de um apoio (esquerdo ou direito):
 * 3 direções x 3 tentativas, com média em tempo real por direção.
 */
export default function CollectionBlock({ side, trials, means, onTrialChange }) {
  return (
    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Footprints className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-800">{side.support}</h3>
          <p className="text-sm text-slate-500">{side.reach}</p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
          {side.badge}
        </span>
      </header>

      <div className="space-y-3 px-4 py-4 sm:px-5">
        {DIRECTIONS.map((dir) => {
          const mean = means[dir.key];
          return (
            <div key={dir.key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">
                  {dir.name}{' '}
                  <span className="font-normal text-slate-400">({dir.short})</span>
                </p>
                <span
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${
                    mean !== null
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  Média: {fmt(mean)} cm
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <label
                      htmlFor={`trial-${side.key}-${dir.key}-${i}`}
                      className="mb-1 block text-center text-[11px] font-medium uppercase tracking-wide text-slate-500"
                    >
                      Tentativa {i + 1}
                    </label>
                    <DecimalInput
                      id={`trial-${side.key}-${dir.key}-${i}`}
                      value={trials[dir.key][i]}
                      onChange={(value) => onTrialChange(side.key, dir.key, i, value)}
                      placeholder="cm"
                      className="text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
