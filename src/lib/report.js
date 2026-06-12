import {
  ASYMMETRY_LIMIT_CM,
  COMPOSITE_THRESHOLD,
  DIRECTIONS,
  fmtBR,
  formatDateBR,
} from './calculations';

/**
 * Gera o texto do laudo clínico a partir dos dados atuais.
 * O texto é um ponto de partida: o avaliador pode editá-lo livremente na UI.
 */
export function generateReport(patient, results) {
  const name = patient.name.trim() || '[nome do paciente]';
  const agePart = patient.age ? `, ${patient.age} anos,` : ',';
  const datePart = formatDateBR(patient.date) || '[data da avaliação]';
  const evaluator = patient.evaluator.trim() || '[avaliador]';

  const paragraphs = [];

  paragraphs.push(
    `Paciente ${name}${agePart} avaliado(a) em ${datePart} por ${evaluator} por meio do Y-Balance Test para o quadrante inferior (YBT-LQ).`
  );

  if (results.limb.left !== null && results.limb.right !== null) {
    paragraphs.push(
      `Comprimento dos membros inferiores: ${fmtBR(results.limb.left, ' cm')} à esquerda e ${fmtBR(
        results.limb.right,
        ' cm'
      )} à direita.`
    );
  }

  if (results.compositeStatus === 'pending') {
    paragraphs.push(
      'Escore Composto: dados insuficientes para o cálculo (é necessário informar o comprimento dos membros e as três direções de alcance em ambos os apoios).'
    );
  } else {
    let s = `O paciente apresenta Escore Composto de ${fmtBR(
      results.composite.left,
      '%'
    )} no apoio esquerdo e ${fmtBR(results.composite.right, '%')} no apoio direito. `;
    if (results.compositeStatus === 'risk') {
      const sides = results.compositeBelow
        .map((side) => (side === 'left' ? 'esquerdo' : 'direito'))
        .join(' e ');
      s += `O escore do apoio ${sides} encontra-se abaixo do limiar de ${fmtBR(
        COMPOSITE_THRESHOLD,
        '%'
      )}, caracterizando risco global aumentado de lesão em membros inferiores.`;
    } else {
      s += `Ambos os escores encontram-se iguais ou acima do limiar de ${fmtBR(
        COMPOSITE_THRESHOLD,
        '%'
      )}, caracterizando estabilidade dinâmica adequada.`;
    }
    paragraphs.push(s);
  }

  const diffParts = DIRECTIONS.map((d) => {
    const a = results.asymmetry[d.key];
    return `${d.short} ${a.diff === null ? 'não calculada' : fmtBR(a.diff, ' cm')}`;
  });
  let asymText = `Análise de assimetria entre os apoios: ${diffParts.join('; ')}. `;
  if (results.asymmetryAlertKeys.length > 0) {
    asymText += `A(s) direção(ões) ${results.asymmetryAlertKeys.join(
      ', '
    )} apresenta(m) diferença superior a ${fmtBR(
      ASYMMETRY_LIMIT_CM,
      ' cm'
    )} entre os membros, achado associado a maior risco de lesões articulares e sobrecarga compensatória, recomendando-se abordagem terapêutica direcionada à correção do déficit.`;
  } else if (results.asymmetryComplete) {
    asymText += `Não foram identificadas assimetrias clinicamente relevantes (todas as diferenças ≤ ${fmtBR(
      ASYMMETRY_LIMIT_CM,
      ' cm'
    )}).`;
  }
  paragraphs.push(asymText);

  return paragraphs.join('\n\n');
}
