'use client';

import {
  AlertTriangle,
  GitCompareArrows,
  Info,
  Layers,
  ShieldCheck,
  Stethoscope,
  Target,
  Trophy,
} from 'lucide-react';
import { fmt } from '@/lib/calculations';
import { POSTERIOR_DIRECTIONS } from '@/lib/interpretation';
import SectionCard from './SectionCard';

const TONE_BADGE = {
  optimal: 'bg-emerald-600 text-white',
  adequate: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  borderline: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  caution: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  insufficient: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  na: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  pending: 'bg-slate-100 text-slate-400 ring-1 ring-slate-200',
};

const PANEL_TONE = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-orange-300 bg-orange-50 text-orange-800',
  danger: 'border-red-200 bg-red-50 text-red-800',
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
};

const PANEL_ICON = {
  success: ShieldCheck,
  warning: AlertTriangle,
  danger: AlertTriangle,
  neutral: Info,
};

function BandBadge({ band }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        TONE_BADGE[band.tone] || TONE_BADGE.pending
      }`}
    >
      {band.label}
    </span>
  );
}

function SubsectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
      <Icon className="h-4 w-4 text-blue-700" />
      {children}
    </h3>
  );
}

const sideLabel = (key) => (key === 'left' ? 'Apoio Esquerdo' : 'Apoio Direito');

export default function StratifiedInterpretation({ interpretation }) {
  const { population, lsi, composite, anterior, posterior, rts } = interpretation;
  const RtsIcon = PANEL_ICON[rts.tone];
  const isAdolescent = population.key === 'adolescent';

  return (
    <SectionCard
      icon={Stethoscope}
      title="Interpretação Estratificada por População"
      subtitle={`Limiares aplicados ao perfil: ${population.label}`}
    >
      <div className="space-y-8">
        {/* Escore composto classificado */}
        <div>
          <SubsectionTitle icon={Trophy}>Escore Composto (classificação por perfil)</SubsectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {['left', 'right'].map((side) => (
              <div
                key={side}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700">{sideLabel(side)}</p>
                  <p className="text-xl font-bold tabular-nums text-slate-800">
                    {fmt(composite[side].value, composite[side].value === null ? '' : '%')}
                  </p>
                </div>
                <BandBadge band={composite[side].band} />
              </div>
            ))}
          </div>
          {isAdolescent && (
            <p className="mt-2 text-xs text-slate-500">
              Em adolescentes não há ponto de corte fixo: compare o escore composto com o percentil
              50 para idade e sexo em tabelas normativas específicas.
            </p>
          )}
        </div>

        {/* LSI */}
        <div>
          <SubsectionTitle icon={GitCompareArrows}>
            LSI — Índice de Simetria entre Membros
          </SubsectionTitle>
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-3xl font-bold tabular-nums text-slate-800">
                {fmt(lsi.value, lsi.value === null ? '' : '%')}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {lsi.value === null
                  ? 'Requer escore composto completo nos dois apoios.'
                  : lsi.isScreening
                    ? `Triagem: ${sideLabel(lsi.numeratorSide)} ÷ ${sideLabel(lsi.denominatorSide)} (menor ÷ maior).`
                    : `Lesionado (${sideLabel(lsi.numeratorSide)}) ÷ contralateral (${sideLabel(lsi.denominatorSide)}).`}
              </p>
            </div>
            <BandBadge band={lsi.band} />
          </div>
        </div>

        {/* Assimetria anterior por perfil */}
        <div>
          <SubsectionTitle icon={Target}>Assimetria Anterior (corte por perfil)</SubsectionTitle>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700">Direção Anterior (ANT)</p>
              <p className="text-xl font-bold tabular-nums text-slate-800">
                {fmt(anterior.diff, anterior.diff === null ? '' : ' cm')}
              </p>
            </div>
            <BandBadge band={anterior.band} />
          </div>
          {isAdolescent && anterior.diff !== null && (
            <p className="mt-2 text-xs text-slate-500">
              Assimetrias &gt; 4 cm são muito prevalentes (50–55%) nesta faixa etária e têm menor
              valor preditivo isolado.
            </p>
          )}
        </div>

        {/* Direções posteriores */}
        <div>
          <SubsectionTitle icon={Layers}>
            Direções Posteriores (preditores de instabilidade crônica)
          </SubsectionTitle>
          {posterior.available ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2.5 font-semibold sm:px-4">Direção</th>
                    <th className="px-3 py-2.5 text-center font-semibold sm:px-4">Apoio Esquerdo</th>
                    <th className="px-3 py-2.5 text-center font-semibold sm:px-4">Apoio Direito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {POSTERIOR_DIRECTIONS.map((dir) => (
                    <tr key={dir.key}>
                      <td className="px-3 py-2.5 font-medium text-slate-700 sm:px-4">
                        <span className="hidden sm:inline">{dir.name} </span>
                        <span className="text-slate-400">({dir.short})</span>
                      </td>
                      {['left', 'right'].map((side) => (
                        <td key={side} className="px-3 py-2.5 text-center sm:px-4">
                          <BandBadge band={posterior[side][dir.key]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-500">
              Limiares normalizados de PM/PL não definidos para este perfil. Avalie por percentis
              de idade/sexo e priorize as direções posteriores na investigação de instabilidade
              crônica.
            </p>
          )}
        </div>

        {/* Retorno ao esporte */}
        <div>
          <SubsectionTitle icon={ShieldCheck}>Critérios Objetivos de Retorno ao Esporte</SubsectionTitle>
          <div className={`flex gap-3 rounded-xl border p-4 ${PANEL_TONE[rts.tone]}`}>
            <RtsIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 text-sm">
              <p className="font-bold">{rts.title}</p>
              <p className="mt-1 leading-relaxed">{rts.text}</p>
              {rts.drivers.length > 0 && (
                <p className="mt-1 leading-relaxed">
                  Fator(es) limitante(s): <strong>{rts.drivers.join(', ')}</strong>.
                </p>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Recomendação baseada apenas em critérios objetivos do YBT. A liberação final deve
            considerar ausência de dor e confiança subjetiva do paciente, não capturadas por este
            instrumento.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
