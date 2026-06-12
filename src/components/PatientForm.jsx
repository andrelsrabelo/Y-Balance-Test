'use client';

import { ClipboardList } from 'lucide-react';
import SectionCard from './SectionCard';
import { DateInput, FieldLabel, IntegerInput, TextInput } from './inputs';

export default function PatientForm({ patient, onChange }) {
  const set = (field) => (value) => onChange({ ...patient, [field]: value });

  return (
    <SectionCard
      icon={ClipboardList}
      title="Identificação do Paciente"
      subtitle="Dados gerais da avaliação"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="sm:col-span-2 xl:col-span-1">
          <FieldLabel htmlFor="patient-name" required>
            Nome do Paciente
          </FieldLabel>
          <TextInput
            id="patient-name"
            value={patient.name}
            onChange={(e) => set('name')(e.target.value)}
            placeholder="Nome completo"
            autoComplete="off"
          />
        </div>

        <div>
          <FieldLabel htmlFor="patient-date">Data da Avaliação</FieldLabel>
          <DateInput
            id="patient-date"
            value={patient.date}
            onChange={(e) => set('date')(e.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="patient-age">Idade</FieldLabel>
          <IntegerInput
            id="patient-age"
            value={patient.age}
            onChange={set('age')}
            placeholder="Ex.: 28"
          />
        </div>

        <div className="sm:col-span-2 xl:col-span-1">
          <FieldLabel htmlFor="patient-evaluator">Nome do Avaliador</FieldLabel>
          <TextInput
            id="patient-evaluator"
            value={patient.evaluator}
            onChange={(e) => set('evaluator')(e.target.value)}
            placeholder="Profissional responsável"
            autoComplete="off"
          />
        </div>
      </div>
    </SectionCard>
  );
}
