'use client';

import { AlertTriangle, BarChart3, CheckCircle2, Minus, Percent, Scale, Trophy } from 'lucide-react';
import {
  ASYMMETRY_LIMIT_CM,
  COMPOSITE_THRESHOLD,
  DIRECTIONS,
  fmt,
} from '@/lib/calculations';
import SectionCard from './SectionCard';

function SubsectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
      <Icon className="h-4 w-4 text-blue-700" />
      {children}
    </h3>
  );
}

function CompositeCard({ label, value, gradient }) {
  const status =
    value === null ? 'pending' : value < COMPOSITE_THRESHOLD ? 'risk' : 'ok';

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-md`}>
      <p className="text-sm font-medium text-white/80">{label}</p>
      <p className="mt-1 text-4xl font-bold tabular-nums">{fmt(value, value === null ? '' : '%')}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-white/70">(ANT + PM + PL) ÷ (3 × membro) × 100</span>
        {status === 'ok' && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> ≥ {COMPOSITE_THRESHOLD}%
          </span>
        )}
        {status === 'risk' && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" /> &lt; {COMPOSITE_THRESHOLD}%
          </span>
        )}
        {status === 'pending' && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
            <Minus className="h-3.5 w-3.5" /> Aguardando dados
          </span>
        )}
      </div>
    </div>
  );
}

export default function ResultsDashboard({ results }) {
  return (
    <SectionCard
      icon={BarChart3}
      title="Resultados Calculados e Análise"
      subtitle="Atualizados automaticamente conforme os dados são preenchidos"
    >
      <div className="space-y-8">
        {/* A. Normalização individual por direção */}
        <div>
          <SubsectionTitle icon={Percent}>Normalização por Direção (%)</SubsectionTitle>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2.5 font-semibold sm:px-4">Direção</th>
                  <th className="px-3 py-2.5 text-center font-semibold sm:px-4">
                    Apoio Esquerdo
                  </th>
                  <th className="px-3 py-2.5 text-center font-semibold sm:px-4">
                    Apoio Direito
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DIRECTIONS.map((dir) => (
                  <tr key={dir.key}>
                    <td className="px-3 py-2.5 font-medium text-slate-700 sm:px-4">
                      <span className="hidden sm:inline">{dir.name} </span>
                      <span className="text-slate-500 sm:text-slate-400">({dir.short})</span>
                    </td>
                    {['left', 'right'].map((sideKey) => {
                      const value = results.normalized[sideKey][dir.key];
                      return (
                        <td
                          key={sideKey}
                          className={`px-3 py-2.5 text-center font-semibold tabular-nums sm:px-4 ${
                            value === null ? 'text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {fmt(value, value === null ? '' : '%')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Fórmula: (média da direção ÷ comprimento do membro do mesmo lado) × 100.
          </p>
        </div>

        {/* B. Escore composto global */}
        <div>
          <SubsectionTitle icon={Trophy}>Escore Composto Global (%)</SubsectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CompositeCard
              label="Apoio Esquerdo"
              value={results.composite.left}
              gradient="from-blue-600 to-blue-800"
            />
            <CompositeCard
              label="Apoio Direito"
              value={results.composite.right}
              gradient="from-sky-600 to-blue-700"
            />
          </div>
        </div>

        {/* C. Análise de assimetria */}
        <div>
          <SubsectionTitle icon={Scale}>Análise de Assimetria (cm)</SubsectionTitle>
          <div className="space-y-2">
            {DIRECTIONS.map((dir) => {
              const { diff, alert } = results.asymmetry[dir.key];
              const rowClass =
                alert === true
                  ? 'border-red-200 bg-red-50'
                  : alert === false
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50/60';
              return (
                <div
                  key={dir.key}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${rowClass}`}
                >
                  <p className="min-w-0 text-sm font-medium text-slate-700">
                    {dir.name} <span className="text-slate-400">({dir.short})</span>
                  </p>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        alert === true
                          ? 'text-red-600'
                          : alert === false
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                      }`}
                    >
                      {fmt(diff, diff === null ? '' : ' cm')}
                    </span>
                    {alert === true && (
                      <span className="flex items-center gap-1 text-sm font-bold text-red-600">
                        <AlertTriangle className="h-4 w-4" /> ATENÇÃO
                      </span>
                    )}
                    {alert === false && (
                      <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Normal
                      </span>
                    )}
                    {alert === null && (
                      <span className="flex items-center gap-1 text-sm text-slate-400">
                        <Minus className="h-4 w-4" /> ---
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Diferença absoluta entre as médias dos apoios. Valores &gt; {ASYMMETRY_LIMIT_CM} cm
            indicam assimetria clinicamente relevante.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
