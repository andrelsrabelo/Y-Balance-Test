'use client';

import { Ruler } from 'lucide-react';
import SectionCard from './SectionCard';
import { DecimalInput, FieldLabel } from './inputs';

export default function LimbLengthCard({ limbs, onChange }) {
  return (
    <SectionCard
      icon={Ruler}
      title="Comprimento do Membro"
      subtitle="Medida da espinha ilíaca ântero-superior ao maléolo medial, em centímetros"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="limb-left" required>
            Comprimento Perna Esquerda (cm)
          </FieldLabel>
          <DecimalInput
            id="limb-left"
            value={limbs.left}
            onChange={(value) => onChange({ ...limbs, left: value })}
            placeholder="Ex.: 89,5"
          />
        </div>
        <div>
          <FieldLabel htmlFor="limb-right" required>
            Comprimento Perna Direita (cm)
          </FieldLabel>
          <DecimalInput
            id="limb-right"
            value={limbs.right}
            onChange={(value) => onChange({ ...limbs, right: value })}
            placeholder="Ex.: 89,5"
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        * Campos obrigatórios para o cálculo da normalização e do escore composto.
      </p>
    </SectionCard>
  );
}
