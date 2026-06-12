'use client';

import { Activity, UserCog } from 'lucide-react';
import { INJURED_OPTIONS, POPULATIONS, getPopulation } from '@/lib/interpretation';
import SectionCard from './SectionCard';

function SegmentedField({ label, hint, options, value, onChange, columns }) {
  const gridCols = columns === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      <div className={`grid gap-2 ${gridCols}`} role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const active = opt.key === value;
          return (
            <button
              key={opt.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.key)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function ProfileCard({ population, injuredSide, onPopulationChange, onInjuredChange }) {
  const pop = getPopulation(population);

  return (
    <SectionCard
      icon={UserCog}
      title="Perfil Clínico e Contexto"
      subtitle="Define os limiares de interpretação e o cálculo do LSI"
    >
      <div className="space-y-5">
        <SegmentedField
          label="População / Perfil"
          hint={pop.desc}
          options={POPULATIONS.map((p) => ({ key: p.key, label: p.short.replace(/^\w/, (c) => c.toUpperCase()) }))}
          value={population}
          onChange={onPopulationChange}
        />

        <SegmentedField
          label="Membro lesionado (referência do LSI)"
          hint="Em triagem/preventivo, o LSI é calculado como menor escore ÷ maior escore."
          options={INJURED_OPTIONS}
          value={injuredSide}
          onChange={onInjuredChange}
          columns={3}
        />

        <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
          <Activity className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Perfil selecionado: <strong>{pop.label}</strong>. Os limiares de escore composto, LSI,
            assimetria e direções posteriores se ajustam automaticamente a este perfil.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
