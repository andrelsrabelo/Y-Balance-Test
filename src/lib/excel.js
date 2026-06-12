import * as XLSX from 'xlsx';
import {
  ASYMMETRY_LIMIT_CM,
  COMPOSITE_THRESHOLD,
  DIRECTIONS,
  SIDES,
  fmt,
  formatDateBR,
  parseNumber,
} from './calculations';

const cell = (value) => (value === null || value === undefined || value === '' ? '---' : value);

function trialCell(raw) {
  const n = parseNumber(raw);
  return n === null ? '---' : n;
}

/** Gera e baixa o arquivo .xlsx com todos os dados da avaliação. */
export function exportToExcel({ patient, limbs, reaches, results, report }) {
  const rows = [];

  rows.push(['Y-BALANCE TEST (YBT-LQ) — RELATÓRIO DE AVALIAÇÃO']);
  rows.push([]);

  rows.push(['IDENTIFICAÇÃO DO PACIENTE']);
  rows.push(['Paciente', cell(patient.name.trim())]);
  rows.push(['Data da Avaliação', cell(formatDateBR(patient.date))]);
  rows.push(['Idade', cell(patient.age)]);
  rows.push(['Avaliador', cell(patient.evaluator.trim())]);
  rows.push([]);

  rows.push(['COMPRIMENTO DO MEMBRO (cm)']);
  rows.push(['Perna Esquerda', cell(parseNumber(limbs.left))]);
  rows.push(['Perna Direita', cell(parseNumber(limbs.right))]);
  rows.push([]);

  for (const side of SIDES) {
    rows.push([`COLETA — ${side.support.toUpperCase()} (${side.reach.toUpperCase()})`]);
    rows.push(['Direção', 'Tentativa 1', 'Tentativa 2', 'Tentativa 3', 'Média (cm)']);
    for (const d of DIRECTIONS) {
      const trials = reaches[side.key][d.key];
      rows.push([
        `${d.name} (${d.short})`,
        trialCell(trials[0]),
        trialCell(trials[1]),
        trialCell(trials[2]),
        fmt(results.means[side.key][d.key]),
      ]);
    }
    rows.push([]);
  }

  rows.push(['NORMALIZAÇÃO POR DIREÇÃO (% do comprimento do membro)']);
  rows.push(['Direção', 'Apoio Esquerdo (%)', 'Apoio Direito (%)']);
  for (const d of DIRECTIONS) {
    rows.push([
      `${d.name} (${d.short})`,
      fmt(results.normalized.left[d.key]),
      fmt(results.normalized.right[d.key]),
    ]);
  }
  rows.push([]);

  rows.push(['ESCORE COMPOSTO GLOBAL (%)']);
  rows.push([
    'Apoio Esquerdo',
    fmt(results.composite.left, '%'),
    results.composite.left === null
      ? '---'
      : results.composite.left < COMPOSITE_THRESHOLD
        ? `ABAIXO do limiar de ${COMPOSITE_THRESHOLD}%`
        : `Dentro do esperado (≥ ${COMPOSITE_THRESHOLD}%)`,
  ]);
  rows.push([
    'Apoio Direito',
    fmt(results.composite.right, '%'),
    results.composite.right === null
      ? '---'
      : results.composite.right < COMPOSITE_THRESHOLD
        ? `ABAIXO do limiar de ${COMPOSITE_THRESHOLD}%`
        : `Dentro do esperado (≥ ${COMPOSITE_THRESHOLD}%)`,
  ]);
  rows.push([]);

  rows.push(['ANÁLISE DE ASSIMETRIA (diferença absoluta entre apoios)']);
  rows.push(['Direção', 'Diferença (cm)', 'Status']);
  for (const d of DIRECTIONS) {
    const a = results.asymmetry[d.key];
    rows.push([
      `${d.name} (${d.short})`,
      fmt(a.diff),
      a.alert === null ? '---' : a.alert ? `ATENÇÃO (> ${ASYMMETRY_LIMIT_CM} cm)` : 'Normal',
    ]);
  }
  rows.push([]);

  rows.push(['LAUDO / INTERPRETAÇÃO CLÍNICA']);
  rows.push([report.trim() || '---']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Avaliação YBT');

  const safeName =
    patient.name
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'paciente';
  const dateStr = patient.date || new Date().toISOString().slice(0, 10);

  XLSX.writeFile(wb, `YBT_${safeName}_${dateStr}.xlsx`);
}
