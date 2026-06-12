/**
 * Regras de negócio do Y-Balance Test (YBT-LQ).
 *
 * Convenções:
 * - "left"  = Apoio Esquerdo (alcance com a perna direita)
 * - "right" = Apoio Direito  (alcance com a perna esquerda)
 * - A normalização usa o comprimento do membro do MESMO lado do apoio.
 * - Valores não calculáveis (campos vazios / divisão por zero) são `null`
 *   e exibidos como "---".
 */

export const DIRECTIONS = [
  { key: 'ANT', name: 'Anterior', short: 'ANT' },
  { key: 'PM', name: 'Posteromedial', short: 'PM' },
  { key: 'PL', name: 'Posterolateral', short: 'PL' },
];

export const SIDES = [
  { key: 'left', support: 'Apoio Esquerdo', reach: 'Alcance com Perna Direita', badge: 'E' },
  { key: 'right', support: 'Apoio Direito', reach: 'Alcance com Perna Esquerda', badge: 'D' },
];

/** Diferença entre lados acima deste valor (cm) gera alerta de assimetria. */
export const ASYMMETRY_LIMIT_CM = 4.0;

/** Escore composto abaixo deste valor (%) indica risco global aumentado. */
export const COMPOSITE_THRESHOLD = 94.0;

/** Converte texto do input em número (aceita vírgula ou ponto). Retorna null se vazio/inválido. */
export function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim().replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function round1(n) {
  return Math.round(n * 10) / 10;
}

/** Média das tentativas preenchidas (ignora vazias). Retorna null se nenhuma preenchida. */
export function meanOfTrials(trials) {
  const nums = trials.map(parseNumber).filter((n) => n !== null);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Formata com 1 casa decimal (ponto) ou "---" quando não calculável. */
export function fmt(value, suffix = '') {
  if (value === null || value === undefined || !Number.isFinite(value)) return '---';
  return value.toFixed(1) + suffix;
}

/** Formata com 1 casa decimal em padrão pt-BR (vírgula), para textos de laudo. */
export function fmtBR(value, suffix = '') {
  if (value === null || value === undefined || !Number.isFinite(value)) return '---';
  return value.toFixed(1).replace('.', ',') + suffix;
}

/** 'AAAA-MM-DD' -> 'DD/MM/AAAA' (ou '' se inválida). */
export function formatDateBR(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Data local de hoje em 'AAAA-MM-DD' (para input type=date). */
export function todayLocalISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Calcula todas as métricas do teste a partir dos alcances e comprimentos.
 * As médias são arredondadas a 1 casa decimal ANTES dos demais cálculos,
 * para que os resultados sejam reproduzíveis a partir da tabela exibida.
 */
export function computeResults(reaches, limbs) {
  const limbLeftRaw = parseNumber(limbs.left);
  const limbRightRaw = parseNumber(limbs.right);
  const limb = {
    left: limbLeftRaw !== null && limbLeftRaw > 0 ? limbLeftRaw : null,
    right: limbRightRaw !== null && limbRightRaw > 0 ? limbRightRaw : null,
  };

  const means = { left: {}, right: {} };
  const normalized = { left: {}, right: {} };
  const composite = { left: null, right: null };

  for (const side of ['left', 'right']) {
    for (const { key } of DIRECTIONS) {
      const m = meanOfTrials(reaches[side][key]);
      means[side][key] = m === null ? null : round1(m);
      normalized[side][key] =
        means[side][key] !== null && limb[side] !== null
          ? round1((means[side][key] / limb[side]) * 100)
          : null;
    }

    const sideMeans = DIRECTIONS.map(({ key }) => means[side][key]);
    if (limb[side] !== null && sideMeans.every((m) => m !== null)) {
      const sum = sideMeans.reduce((a, b) => a + b, 0);
      composite[side] = round1((sum / (3 * limb[side])) * 100);
    }
  }

  const asymmetry = {};
  for (const { key } of DIRECTIONS) {
    const l = means.left[key];
    const r = means.right[key];
    if (l === null || r === null) {
      asymmetry[key] = { diff: null, alert: null };
    } else {
      const diff = round1(Math.abs(l - r));
      asymmetry[key] = { diff, alert: diff > ASYMMETRY_LIMIT_CM };
    }
  }

  const compositeBelow = ['left', 'right'].filter(
    (s) => composite[s] !== null && composite[s] < COMPOSITE_THRESHOLD
  );
  const compositeStatus =
    composite.left === null || composite.right === null
      ? 'pending'
      : compositeBelow.length > 0
        ? 'risk'
        : 'ok';

  const asymmetryAlertKeys = DIRECTIONS.filter((d) => asymmetry[d.key].alert === true).map(
    (d) => d.key
  );
  const asymmetryComplete = DIRECTIONS.every((d) => asymmetry[d.key].diff !== null);

  return {
    limb,
    means,
    normalized,
    composite,
    compositeStatus,
    compositeBelow,
    asymmetry,
    asymmetryAlertKeys,
    asymmetryComplete,
  };
}
