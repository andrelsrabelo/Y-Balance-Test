import {
  ASYMMETRY_LIMIT_CM,
  COMPOSITE_THRESHOLD,
  DIRECTIONS,
  fmtBR,
  formatDateBR,
} from './calculations';

const sideName = (key) => (key === 'left' ? 'esquerdo' : 'direito');
const sideSupport = (key) => (key === 'left' ? 'apoio esquerdo' : 'apoio direito');

/**
 * Gera o texto do laudo clínico a partir dos dados atuais e da interpretação
 * estratificada por população. O texto é um ponto de partida editável.
 */
export function generateReport(patient, results, interpretation) {
  const name = patient.name.trim() || '[nome do paciente]';
  const agePart = patient.age ? `, ${patient.age} anos,` : ',';
  const datePart = formatDateBR(patient.date) || '[data da avaliação]';
  const evaluator = patient.evaluator.trim() || '[avaliador]';
  const pop = interpretation.population;

  const paragraphs = [];

  paragraphs.push(
    `Paciente ${name}${agePart} avaliado(a) em ${datePart} por ${evaluator} por meio do Y-Balance Test para o quadrante inferior (YBT-LQ). Perfil considerado para interpretação: ${pop.label}.`
  );

  if (results.limb.left !== null && results.limb.right !== null) {
    paragraphs.push(
      `Comprimento dos membros inferiores: ${fmtBR(results.limb.left, ' cm')} à esquerda e ${fmtBR(
        results.limb.right,
        ' cm'
      )} à direita.`
    );
  }

  // Escore composto + classificação por perfil
  if (results.compositeStatus === 'pending') {
    paragraphs.push(
      'Escore Composto: dados insuficientes para o cálculo (é necessário informar o comprimento dos membros e as três direções de alcance em ambos os apoios).'
    );
  } else {
    let s = `O paciente apresenta Escore Composto de ${fmtBR(
      results.composite.left,
      '%'
    )} no apoio esquerdo e ${fmtBR(results.composite.right, '%')} no apoio direito. `;
    if (pop.key === 'adolescent') {
      s += 'Para o perfil adolescente não há ponto de corte fixo: o escore deve ser comparado ao percentil 50 para idade e sexo em tabelas normativas específicas.';
    } else {
      s += `Para o perfil ${pop.short}, esses valores são classificados como ${interpretation.composite.left.band.label.toLowerCase()} (esquerdo) e ${interpretation.composite.right.band.label.toLowerCase()} (direito).`;
      if (results.compositeStatus === 'risk') {
        const sides = results.compositeBelow.map(sideName).join(' e ');
        s += ` Como referência geral, o escore do apoio ${sides} encontra-se abaixo do limiar de ${fmtBR(
          COMPOSITE_THRESHOLD,
          '%'
        )}.`;
      }
    }
    paragraphs.push(s);
  }

  // LSI
  const lsi = interpretation.lsi;
  if (lsi.value === null) {
    paragraphs.push(
      'Índice de Simetria entre Membros (LSI): não calculado — requer escore composto completo nos dois apoios.'
    );
  } else if (lsi.isScreening) {
    paragraphs.push(
      `Índice de simetria entre os membros (triagem): ${fmtBR(lsi.value, '%')} (${sideSupport(
        lsi.numeratorSide
      )} ÷ ${sideSupport(lsi.denominatorSide)}), classificado como ${lsi.band.label.toLowerCase()} para o perfil ${pop.short}.`
    );
  } else {
    paragraphs.push(
      `LSI (membro ${sideName(lsi.numeratorSide)} lesionado ÷ contralateral): ${fmtBR(
        lsi.value,
        '%'
      )}, classificado como ${lsi.band.label.toLowerCase()} para o perfil ${pop.short}.`
    );
  }

  // Assimetria (diferenças por direção) + anterior por perfil
  const diffParts = DIRECTIONS.map((d) => {
    const a = results.asymmetry[d.key];
    return `${d.short} ${a.diff === null ? 'não calculada' : fmtBR(a.diff, ' cm')}`;
  });
  let asymText = `Análise de assimetria entre os apoios: ${diffParts.join('; ')}. `;
  if (interpretation.anterior.diff !== null) {
    asymText += `A assimetria anterior de ${fmtBR(
      interpretation.anterior.diff,
      ' cm'
    )} é classificada como ${interpretation.anterior.band.label.toLowerCase()} para o perfil ${pop.short}. `;
  }
  if (results.asymmetryAlertKeys.length > 0) {
    asymText += `A(s) direção(ões) ${results.asymmetryAlertKeys.join(
      ', '
    )} apresenta(m) diferença superior a ${fmtBR(
      ASYMMETRY_LIMIT_CM,
      ' cm'
    )} entre os membros, achado associado a maior risco de lesões articulares e sobrecarga compensatória.`;
  } else if (results.asymmetryComplete) {
    asymText += `Não foram identificadas assimetrias acima de ${fmtBR(ASYMMETRY_LIMIT_CM, ' cm')}.`;
  }
  paragraphs.push(asymText);

  // Retorno ao esporte
  const rts = interpretation.rts;
  let rtsText = `Critérios objetivos de retorno ao esporte: ${rts.title.toLowerCase()}. ${rts.text}`;
  if (rts.drivers.length > 0) {
    rtsText += ` Fator(es) limitante(s): ${rts.drivers.join(', ')}.`;
  }
  rtsText +=
    ' A decisão de liberação deve integrar ausência de dor e confiança subjetiva do paciente, não capturadas por este instrumento.';
  paragraphs.push(rtsText);

  return paragraphs.join('\n\n');
}
