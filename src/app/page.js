'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SIDES, computeResults, todayLocalISO } from '@/lib/calculations';
import {
  DEFAULT_INJURED,
  DEFAULT_POPULATION,
  buildInterpretation,
} from '@/lib/interpretation';
import { generateReport } from '@/lib/report';
import AppHeader from '@/components/AppHeader';
import ActionsBar from '@/components/ActionsBar';
import CollectionBlock from '@/components/CollectionBlock';
import InterpretationCard from '@/components/InterpretationCard';
import LimbLengthCard from '@/components/LimbLengthCard';
import LoginScreen from '@/components/LoginScreen';
import PatientForm from '@/components/PatientForm';
import ProfileCard from '@/components/ProfileCard';
import ResultsDashboard from '@/components/ResultsDashboard';
import StratifiedInterpretation from '@/components/StratifiedInterpretation';
import Toast from '@/components/Toast';

const AUTH_KEY = 'ybt_auth';
const USER_DISPLAY_NAME = 'André Luiz';

const makeTrials = () => ({ ANT: ['', '', ''], PM: ['', '', ''], PL: ['', '', ''] });
const makeReaches = () => ({ left: makeTrials(), right: makeTrials() });
const makePatient = () => ({ name: '', date: todayLocalISO(), age: '', evaluator: '' });
const makeLimbs = () => ({ left: '', right: '' });

export default function Home() {
  // --- Autenticação (sessão simples no navegador) ---
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- Dados da avaliação ---
  const [patient, setPatient] = useState(() => ({ name: '', date: '', age: '', evaluator: '' }));
  const [limbs, setLimbs] = useState(makeLimbs);
  const [reaches, setReaches] = useState(makeReaches);
  const [population, setPopulation] = useState(DEFAULT_POPULATION);
  const [injuredSide, setInjuredSide] = useState(DEFAULT_INJURED);

  // --- Laudo ---
  const [report, setReport] = useState('');
  const [reportEdited, setReportEdited] = useState(false);

  // --- Feedback ---
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    setIsAuthenticated(sessionStorage.getItem(AUTH_KEY) === '1');
    setAuthChecked(true);
    // Data padrão definida no cliente para respeitar o fuso local.
    setPatient((p) => (p.date ? p : { ...p, date: todayLocalISO() }));
  }, []);

  const results = useMemo(() => computeResults(reaches, limbs), [reaches, limbs]);

  const interpretation = useMemo(
    () => buildInterpretation(results, population, injuredSide),
    [results, population, injuredSide]
  );

  const autoReport = useMemo(
    () => generateReport(patient, results, interpretation),
    [patient, results, interpretation]
  );

  useEffect(() => {
    if (!reportEdited) setReport(autoReport);
  }, [autoReport, reportEdited]);

  function showToast(type, message) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  function handleTrialChange(sideKey, dirKey, trialIndex, value) {
    setReaches((prev) => {
      const dirTrials = [...prev[sideKey][dirKey]];
      dirTrials[trialIndex] = value;
      return { ...prev, [sideKey]: { ...prev[sideKey], [dirKey]: dirTrials } };
    });
  }

  function buildPayload() {
    return {
      patient,
      profile: { population, injuredSide },
      limbLengths: limbs,
      reaches,
      results: {
        means: results.means,
        normalized: results.normalized,
        composite: results.composite,
        compositeStatus: results.compositeStatus,
        asymmetry: results.asymmetry,
      },
      interpretation: {
        population: interpretation.population.key,
        lsi: { value: interpretation.lsi.value, band: interpretation.lsi.band.key },
        composite: {
          left: interpretation.composite.left.band.key,
          right: interpretation.composite.right.band.key,
        },
        anterior: interpretation.anterior.band.key,
        returnToSport: interpretation.rts.key,
      },
      report,
    };
  }

  async function handleExportExcel() {
    if (!patient.name.trim()) {
      showToast('error', 'Informe o nome do paciente antes de exportar.');
      return;
    }
    try {
      // Import dinâmico: mantém a biblioteca xlsx fora do bundle inicial.
      const { exportToExcel } = await import('@/lib/excel');
      exportToExcel({ patient, limbs, reaches, results, interpretation, report });
      showToast('success', 'Arquivo Excel gerado com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Erro ao gerar o arquivo Excel.');
    }
  }

  async function handleSave() {
    if (!patient.name.trim()) {
      showToast('error', 'Informe o nome do paciente antes de salvar.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/save-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Falha ao salvar');
      showToast('success', 'Salvo com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Erro ao salvar no servidor. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    const confirmed = window.confirm(
      'Iniciar uma nova avaliação? Os dados não salvos serão perdidos.'
    );
    if (!confirmed) return;
    setPatient(makePatient());
    setLimbs(makeLimbs());
    setReaches(makeReaches());
    setPopulation(DEFAULT_POPULATION);
    setInjuredSide(DEFAULT_INJURED);
    setReportEdited(false);
    showToast('success', 'Nova avaliação iniciada.');
  }

  function handleLogin() {
    sessionStorage.setItem(AUTH_KEY, '1');
    setIsAuthenticated(true);
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen">
      <AppHeader userName={USER_DISPLAY_NAME} onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-6">
        <PatientForm patient={patient} onChange={setPatient} />

        <ProfileCard
          population={population}
          injuredSide={injuredSide}
          onPopulationChange={setPopulation}
          onInjuredChange={setInjuredSide}
        />

        <LimbLengthCard limbs={limbs} onChange={setLimbs} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {SIDES.map((side) => (
            <CollectionBlock
              key={side.key}
              side={side}
              trials={reaches[side.key]}
              means={results.means[side.key]}
              onTrialChange={handleTrialChange}
            />
          ))}
        </div>

        <ResultsDashboard results={results} />

        <StratifiedInterpretation interpretation={interpretation} />

        <InterpretationCard
          results={results}
          report={report}
          onReportChange={(value) => {
            setReport(value);
            setReportEdited(true);
          }}
          reportEdited={reportEdited}
          onReportReset={() => setReportEdited(false)}
        />

        <ActionsBar
          onExportExcel={handleExportExcel}
          onSave={handleSave}
          onReset={handleReset}
          saving={saving}
        />

        <footer className="pb-4 pt-2 text-center text-xs text-slate-400">
          Y-Balance Test (YBT-LQ) · Ferramenta de uso clínico interno
        </footer>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
