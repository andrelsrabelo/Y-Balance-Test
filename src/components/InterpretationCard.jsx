'use client';

import {
  AlertTriangle,
  FileText,
  Info,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import {
  ASYMMETRY_LIMIT_CM,
  COMPOSITE_THRESHOLD,
  fmtBR,
} from '@/lib/calculations';
import SectionCard from './SectionCard';

function Panel({ tone, icon: Icon, title, children }) {
  const tones = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-600',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-orange-300 bg-orange-50 text-orange-800',
    danger: 'border-red-200 bg-red-50 text-red-800',
  };
  const iconTones = {
    neutral: 'text-slate-500',
    success: 'text-emerald-600',
    warning: 'text-orange-600',
    danger: 'text-red-600',
  };
  return (
    <div className={`flex gap-3 rounded-xl border p-4 ${tones[tone]}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconTones[tone]}`} />
      <div className="min-w-0 text-sm">
        <p className="font-bold">{title}</p>
        <div className="mt-1 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function InterpretationCard({
  results,
  report,
  onReportChange,
  reportEdited,
  onReportReset,
}) {
  const sidesBelow = results.compositeBelow
    .map((side) => (side === 'left' ? 'esquerdo' : 'direito'))
    .join(' e ');

  return (
    <SectionCard
      icon={Stethoscope}
      title="Interpretação Clínica e Laudo"
      subtitle="Análise automatizada dos achados, com laudo editável"
    >
      <div className="space-y-4">
        {/* A. Interpretação do escore composto */}
        {results.compositeStatus === 'pending' && (
          <Panel tone="neutral" icon={Info} title="Aguardando dados">
            Preencha o comprimento dos membros e as três direções de alcance nos dois apoios
            para gerar a interpretação automática.
          </Panel>
        )}
        {results.compositeStatus === 'risk' && (
          <Panel tone="warning" icon={AlertTriangle} title="Risco Global Aumentado">
            Escore abaixo do limiar de {fmtBR(COMPOSITE_THRESHOLD, '%')} no apoio {sidesBelow}.
            Escores compostos inferiores a esse limiar estão associados a maior risco de lesão
            em membros inferiores.
          </Panel>
        )}
        {results.compositeStatus === 'ok' && (
          <Panel tone="success" icon={ShieldCheck} title="Estabilidade Adequada">
            Ambos os escores compostos encontram-se iguais ou acima do limiar de{' '}
            {fmtBR(COMPOSITE_THRESHOLD, '%')}, indicando estabilidade dinâmica adequada.
          </Panel>
        )}

        {/* B. Interpretação da assimetria */}
        {results.asymmetryAlertKeys.length > 0 && (
          <Panel tone="danger" icon={AlertTriangle} title="Assimetria Relevante Detectada">
            Diferença superior a {fmtBR(ASYMMETRY_LIMIT_CM, ' cm')} entre os apoios na(s)
            direção(ões): <strong>{results.asymmetryAlertKeys.join(', ')}</strong>. Assimetrias
            dessa magnitude estão associadas a maior risco de lesões articulares e sobrecarga
            compensatória do membro inferior, recomendando-se intervenção direcionada.
          </Panel>
        )}
        {results.asymmetryAlertKeys.length === 0 && results.asymmetryComplete && (
          <Panel tone="success" icon={ShieldCheck} title="Simetria Dentro do Esperado">
            Todas as diferenças entre os apoios são ≤ {fmtBR(ASYMMETRY_LIMIT_CM, ' cm')}.
          </Panel>
        )}

        {/* C. Laudo editável */}
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="report"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <FileText className="h-4 w-4 text-blue-700" />
              Laudo (editável)
            </label>
            {reportEdited && (
              <button
                type="button"
                onClick={onReportReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurar laudo automático
              </button>
            )}
          </div>
          <textarea
            id="report"
            rows={9}
            value={report}
            onChange={(e) => onReportChange(e.target.value)}
            className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            O texto é gerado automaticamente a partir dos dados e atualizado em tempo real.
            Ao editá-lo manualmente, a atualização automática é pausada.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
