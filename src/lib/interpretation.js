/**
 * Interpretação estratificada do Y-Balance Test (YBT-LQ).
 *
 * Acrescenta, sobre os cálculos brutos de `calculations.js`, uma camada de
 * leitura clínica que depende de:
 *   - Perfil/população do avaliado (limiares mudam por população).
 *   - Membro lesionado (define o LSI — Limb Symmetry Index).
 *
 * Convenção de lados (igual a calculations.js):
 *   left  = Apoio Esquerdo  -> desempenho do membro ESQUERDO
 *   right = Apoio Direito   -> desempenho do membro DIREITO
 */

import { DIRECTIONS, round1 } from './calculations';

export const DEFAULT_POPULATION = 'recreational';
export const DEFAULT_INJURED = 'none';

export const POPULATIONS = [
  {
    key: 'sedentary',
    label: 'Sedentário / Baixa atividade',
    short: 'sedentário',
    desc: 'Prioriza ausência de dor e simetria; valores absolutos menores podem ser aceitáveis.',
  },
  {
    key: 'recreational',
    label: 'Atleta recreacional / amador',
    short: 'recreacional',
    desc: 'Escore composto ≥ 95% é o corte validado para baixo risco de lesão.',
  },
  {
    key: 'competitive',
    label: 'Atleta competitivo / elite',
    short: 'competitivo',
    desc: 'Demandas elevadas exigem critérios mais rigorosos que a população geral.',
  },
  {
    key: 'adolescent',
    label: 'Adolescente (10–17 anos)',
    short: 'adolescente',
    desc: 'Comparar escore com percentil 50 por idade/sexo; assimetrias têm menor valor preditivo.',
  },
];

export const INJURED_OPTIONS = [
  { key: 'left', label: 'Esquerdo' },
  { key: 'right', label: 'Direito' },
  { key: 'none', label: 'Triagem / preventivo' },
];

export function getPopulation(key) {
  return POPULATIONS.find((p) => p.key === key) || POPULATIONS[1];
}

const PENDING = { key: 'pending', label: '---', tone: 'pending' };
const ADOLESCENT_COMPOSITE = {
  key: 'na',
  label: 'Comparar com percentil (idade/sexo)',
  tone: 'na',
};

// --- Tabelas de limiares por população -------------------------------------
// Bandas "por mínimo" (maior é melhor): a primeira cujo valor >= min vence.
const COMPOSITE_BANDS = {
  sedentary: [
    { min: 85, key: 'adequate', label: 'Adequado', tone: 'adequate' },
    { min: 80, key: 'borderline', label: 'Limítrofe', tone: 'borderline' },
    { min: -Infinity, key: 'insufficient', label: 'Insuficiente', tone: 'insufficient' },
  ],
  recreational: [
    { min: 95, key: 'optimal', label: 'Ótimo', tone: 'optimal' },
    { min: 90, key: 'adequate', label: 'Adequado', tone: 'adequate' },
    { min: 85, key: 'borderline', label: 'Limítrofe', tone: 'borderline' },
    { min: -Infinity, key: 'insufficient', label: 'Insuficiente', tone: 'insufficient' },
  ],
  competitive: [
    { min: 106, key: 'optimal', label: 'Ótimo', tone: 'optimal' },
    { min: 100, key: 'adequate', label: 'Adequado', tone: 'adequate' },
    { min: 95, key: 'borderline', label: 'Limítrofe', tone: 'borderline' },
    { min: -Infinity, key: 'insufficient', label: 'Insuficiente', tone: 'insufficient' },
  ],
};

const LSI_BANDS = {
  sedentary: [
    { min: 90, key: 'adequate', label: 'Adequado', tone: 'adequate' },
    { min: 85, key: 'borderline', label: 'Limítrofe', tone: 'borderline' },
    { min: -Infinity, key: 'insufficient', label: 'Insuficiente', tone: 'insufficient' },
  ],
  recreational: [
    { min: 94, key: 'optimal', label: 'Ótimo', tone: 'optimal' },
    { min: 90, key: 'adequate', label: 'Adequado', tone: 'adequate' },
    { min: 85, key: 'borderline', label: 'Limítrofe', tone: 'borderline' },
    { min: -Infinity, key: 'insufficient', label: 'Insuficiente', tone: 'insufficient' },
  ],
  competitive: [
    { min: 95, key: 'optimal', label: 'Ótimo', tone: 'optimal' },
    { min: 92, key: 'adequate', label: 'Adequado', tone: 'adequate' },
    { min: 90, key: 'borderline', label: 'Limítrofe', tone: 'borderline' },
    { min: -Infinity, key: 'insufficient', label: 'Insuficiente', tone: 'insufficient' },
  ],
  adolescent: [
    { min: 90, key: 'adequate', label: 'Adequado', tone: 'adequate' },
    { min: -Infinity, key: 'insufficient', label: 'Insuficiente', tone: 'insufficient' },
  ],
};

// Bandas "por máximo" (menor é melhor), em cm.
const ANTERIOR_ASYM_BANDS = {
  sedentary: [
    { max: 4, key: 'low', label: 'Aceitável', tone: 'adequate' },
    { max: 6, key: 'moderate', label: 'Atenção', tone: 'borderline' },
    { max: Infinity, key: 'high', label: 'Alto risco', tone: 'insufficient' },
  ],
  recreational: [
    { max: 4, key: 'low', label: 'Baixo risco', tone: 'adequate' },
    { max: 6, key: 'moderate', label: 'Risco moderado', tone: 'borderline' },
    { max: Infinity, key: 'high', label: 'Alto risco', tone: 'insufficient' },
  ],
  competitive: [
    { max: 3, key: 'low', label: 'Baixo risco', tone: 'adequate' },
    { max: 4, key: 'moderate', label: 'Risco moderado', tone: 'borderline' },
    { max: Infinity, key: 'high', label: 'Alto risco', tone: 'insufficient' },
  ],
  adolescent: [
    { max: 4, key: 'low', label: 'Aceitável', tone: 'adequate' },
    { max: Infinity, key: 'caution', label: 'Monitorar', tone: 'caution' },
  ],
};

// Score normalizado posteromedial/posterolateral (%). Não especificado para
// sedentário/adolescente (usar percentis/avaliação funcional complementar).
const POSTERIOR_BANDS = {
  recreational: [
    { min: 91, key: 'adequate', label: 'Adequado', tone: 'adequate' },
    { min: 85, key: 'borderline', label: 'Limítrofe', tone: 'borderline' },
    { min: -Infinity, key: 'insufficient', label: 'Insuficiente', tone: 'insufficient' },
  ],
  competitive: [
    { min: 100, key: 'optimal', label: 'Ótimo', tone: 'optimal' },
    { min: 95, key: 'adequate', label: 'Adequado', tone: 'adequate' },
    { min: 91, key: 'borderline', label: 'Limítrofe', tone: 'borderline' },
    { min: -Infinity, key: 'insufficient', label: 'Insuficiente', tone: 'insufficient' },
  ],
};

// Gravidade usada para os critérios de retorno ao esporte (0 = melhor).
const SEVERITY = {
  optimal: 0,
  adequate: 1,
  low: 1,
  borderline: 2,
  moderate: 2,
  caution: 2,
  insufficient: 3,
  high: 3,
};

function classifyByMin(value, bands) {
  if (value === null || !Number.isFinite(value) || !bands) return PENDING;
  for (const b of bands) if (value >= b.min) return b;
  return bands[bands.length - 1];
}

function classifyByMax(value, bands) {
  if (value === null || !Number.isFinite(value) || !bands) return PENDING;
  for (const b of bands) if (value <= b.max) return b;
  return bands[bands.length - 1];
}

function classifyComposite(value, populationKey) {
  if (populationKey === 'adolescent') {
    return value === null || !Number.isFinite(value) ? PENDING : ADOLESCENT_COMPOSITE;
  }
  return classifyByMin(value, COMPOSITE_BANDS[populationKey]);
}

/**
 * LSI (Limb Symmetry Index).
 * - Com membro lesionado definido: (lesionado ÷ contralateral) × 100.
 * - Em triagem ('none'): (menor ÷ maior) × 100, como índice de simetria.
 */
function computeLSI(composite, injuredSide) {
  const { left, right } = composite;
  if (left === null || right === null) {
    return { value: null, numeratorSide: null, denominatorSide: null, isScreening: injuredSide === 'none' };
  }

  let numSide, denSide;
  if (injuredSide === 'left' || injuredSide === 'right') {
    numSide = injuredSide;
    denSide = injuredSide === 'left' ? 'right' : 'left';
  } else {
    // Triagem: pior sobre o melhor (LSI ≤ 100).
    if (left <= right) {
      numSide = 'left';
      denSide = 'right';
    } else {
      numSide = 'right';
      denSide = 'left';
    }
  }

  const den = composite[denSide];
  if (!den || den === 0) {
    return { value: null, numeratorSide: numSide, denominatorSide: denSide, isScreening: injuredSide === 'none' };
  }

  return {
    value: round1((composite[numSide] / den) * 100),
    numeratorSide: numSide,
    denominatorSide: denSide,
    isScreening: injuredSide === 'none',
  };
}

/** Nível do LSI para retorno ao esporte (corte de liberação ≥94% em elite, ≥90% nos demais). */
function lsiReturnLevel(value, populationKey) {
  if (value === null || !Number.isFinite(value)) return null;
  const fullGate = populationKey === 'competitive' ? 94 : 90;
  if (value >= fullGate) return 1;
  if (value >= 85) return 2;
  return 3;
}

const RTS_STATUS = {
  clear: {
    key: 'clear',
    tone: 'success',
    title: 'Critérios objetivos atendidos para liberação',
    text: 'Escore composto, LSI e assimetria anterior dentro das metas do perfil.',
  },
  partial: {
    key: 'partial',
    tone: 'warning',
    title: 'Progressão parcial',
    text: 'Liberar atividades de baixo impacto e manter a reabilitação; reavaliar evolução.',
  },
  restrict: {
    key: 'restrict',
    tone: 'danger',
    title: 'Manter restrições',
    text: 'Intensificar a reabilitação e reavaliar em 2–4 semanas antes de progredir.',
  },
  pending: {
    key: 'pending',
    tone: 'neutral',
    title: 'Dados insuficientes',
    text: 'Complete os escores compostos e o LSI para gerar a recomendação.',
  },
};

/**
 * Monta o objeto de interpretação completo a partir dos resultados brutos.
 * É a fonte única consumida pela UI, pelo laudo e pela exportação.
 */
export function buildInterpretation(results, populationKey, injuredSide) {
  const population = getPopulation(populationKey);
  const popKey = population.key;

  const composite = {
    left: { value: results.composite.left, band: classifyComposite(results.composite.left, popKey) },
    right: { value: results.composite.right, band: classifyComposite(results.composite.right, popKey) },
  };

  const lsiRaw = computeLSI(results.composite, injuredSide);
  const lsi = {
    ...lsiRaw,
    band: classifyByMin(lsiRaw.value, LSI_BANDS[popKey]),
    returnLevel: lsiReturnLevel(lsiRaw.value, popKey),
  };

  const anteriorDiff = results.asymmetry.ANT.diff;
  const anterior = {
    diff: anteriorDiff,
    band: classifyByMax(anteriorDiff, ANTERIOR_ASYM_BANDS[popKey]),
  };

  const postBands = POSTERIOR_BANDS[popKey] || null;
  const posterior = {
    available: Boolean(postBands),
    left: {},
    right: {},
  };
  for (const side of ['left', 'right']) {
    for (const dir of ['PM', 'PL']) {
      posterior[side][dir] = postBands
        ? classifyByMin(results.normalized[side][dir], postBands)
        : null;
    }
  }

  // --- Retorno ao esporte (somente critérios objetivos) ---
  const drivers = [];
  let pending = false;
  let maxSeverity = 0;

  if (popKey !== 'adolescent') {
    const cl = composite.left.band;
    const cr = composite.right.band;
    if (cl.key === 'pending' || cr.key === 'pending') {
      pending = true;
    } else {
      const sev = Math.max(SEVERITY[cl.key] ?? 0, SEVERITY[cr.key] ?? 0);
      maxSeverity = Math.max(maxSeverity, sev);
      if (sev >= 2) drivers.push('escore composto');
    }
  }

  if (lsi.returnLevel === null) {
    pending = true;
  } else {
    maxSeverity = Math.max(maxSeverity, lsi.returnLevel);
    if (lsi.returnLevel >= 2) drivers.push('LSI');
  }

  if (anterior.band.key === 'pending') {
    pending = true;
  } else {
    const sev = SEVERITY[anterior.band.key] ?? 0;
    maxSeverity = Math.max(maxSeverity, sev);
    if (sev >= 2) drivers.push('assimetria anterior');
  }

  let rtsKey;
  if (pending) rtsKey = 'pending';
  else if (maxSeverity >= 3) rtsKey = 'restrict';
  else if (maxSeverity >= 2) rtsKey = 'partial';
  else rtsKey = 'clear';

  const rts = { ...RTS_STATUS[rtsKey], drivers };

  return { population, injuredSide, composite, lsi, anterior, posterior, rts };
}

/** Direções posteriores (PM, PL) para iteração na UI/laudo. */
export const POSTERIOR_DIRECTIONS = DIRECTIONS.filter((d) => d.key !== 'ANT');
