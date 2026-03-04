// ============================================================
// CALCULEI — Motor de Cálculos Trabalhistas CLT 2026
// ============================================================

// --- TABELAS 2026 ---

const FAIXAS_INSS_2026 = [
  { min: 0, max: 1518.00, aliquota: 0.075 },
  { min: 1518.01, max: 2793.88, aliquota: 0.09 },
  { min: 2793.89, max: 5587.76, aliquota: 0.12 },
  { min: 5587.77, max: 7786.02, aliquota: 0.14 },
];
const TETO_INSS = 7786.02;
const DESCONTO_MAX_INSS = 908.86;

const FAIXAS_IRRF_2026 = [
  { min: 0, max: 2428.80, aliquota: 0, deducao: 0 },
  { min: 2428.81, max: 3290.65, aliquota: 0.075, deducao: 182.16 },
  { min: 3290.66, max: 4150.49, aliquota: 0.15, deducao: 428.85 },
  { min: 4150.50, max: 5010.33, aliquota: 0.225, deducao: 740.22 },
  { min: 5010.34, max: Infinity, aliquota: 0.275, deducao: 990.68 },
];

// --- TIPOS ---

export type TipoRescisao =
  | 'sem_justa_causa'
  | 'pedido_demissao'
  | 'acordo'
  | 'justa_causa';

export interface InputRescisao {
  salarioBruto: number;
  dataAdmissao: string; // YYYY-MM-DD
  dataDemissao: string; // YYYY-MM-DD
  tipoRescisao: TipoRescisao;
  feriasVencidas: boolean;
  saldoFGTS?: number;
}

export interface ResultadoRescisao {
  saldoSalario: number;
  avisoPrevio: number;
  diasAvisoPrevio: number;
  feriasProporcional: number;
  feriasVencidas: number;
  tercoFerias: number;
  decimoTerceiro: number;
  multaFGTS: number;
  saldoFGTSEstimado: number;
  totalBruto: number;
  descontoINSS: number;
  descontoIRRF: number;
  totalLiquido: number;
  temDireitoSeguroDesemprego: boolean;
  parcelasSeguro: number;
  tipoRescisao: TipoRescisao;
  mesesTrabalhados: number;
  diasTrabalhadosMes: number;
}

export interface InputFerias {
  salarioBruto: number;
  diasFerias: number; // 30, 20, 15, 10
  abonoConvertido: boolean;
}

export interface ResultadoFerias {
  salarioFerias: number;
  tercoConstitucional: number;
  abonoPecuniario: number;
  tercoAbono: number;
  totalBruto: number;
  descontoINSS: number;
  descontoIRRF: number;
  totalLiquido: number;
}

export interface InputDecimoTerceiro {
  salarioBruto: number;
  mesesTrabalhados: number; // 1-12
}

export interface ResultadoDecimoTerceiro {
  valorBruto: number;
  descontoINSS: number;
  descontoIRRF: number;
  totalLiquido: number;
}

export interface InputSalarioLiquido {
  salarioBruto: number;
  dependentes: number;
}

export interface ResultadoSalarioLiquido {
  salarioBruto: number;
  descontoINSS: number;
  descontoIRRF: number;
  totalDescontos: number;
  salarioLiquido: number;
}

// --- FUNÇÕES AUXILIARES ---

function calcularMesesTrabalhados(dataAdmissao: string, dataDemissao: string): number {
  const adm = new Date(dataAdmissao + 'T00:00:00');
  const dem = new Date(dataDemissao + 'T00:00:00');

  let meses = (dem.getFullYear() - adm.getFullYear()) * 12;
  meses += dem.getMonth() - adm.getMonth();

  // Se o dia da demissão é anterior ao dia da admissão, subtrai 1 mês
  if (dem.getDate() < adm.getDate()) {
    meses -= 1;
  }

  return Math.max(0, meses);
}

function diasNoMes(dataStr: string): number {
  const d = new Date(dataStr + 'T00:00:00');
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function diasTrabalhados(dataDemissao: string): number {
  const d = new Date(dataDemissao + 'T00:00:00');
  return d.getDate();
}

// --- CÁLCULOS DE DESCONTOS ---

export function calcularINSS(base: number): number {
  let desconto = 0;
  let anterior = 0;

  for (const faixa of FAIXAS_INSS_2026) {
    if (base <= 0) break;
    const faixaBase = Math.min(base, faixa.max) - anterior;
    if (faixaBase > 0) {
      desconto += faixaBase * faixa.aliquota;
    }
    anterior = faixa.max;
    if (base <= faixa.max) break;
  }

  return Math.min(desconto, DESCONTO_MAX_INSS);
}

export function calcularIRRF(base: number, descontoINSS: number, dependentes: number = 0): number {
  const deducaoDependente = 189.59;
  const baseCalculo = base - descontoINSS - (dependentes * deducaoDependente);

  // Nova regra 2026: isenção total até R$5.000 bruto
  if (base <= 5000) return 0;

  if (baseCalculo <= 0) return 0;

  let irrf = 0;
  for (const faixa of FAIXAS_IRRF_2026) {
    if (baseCalculo >= faixa.min && (baseCalculo <= faixa.max || faixa.max === Infinity)) {
      irrf = (baseCalculo * faixa.aliquota) - faixa.deducao;
      break;
    }
  }

  // Redução para faixa R$5.000,01 - R$7.350
  if (base > 5000 && base <= 7350) {
    const reducao = 978.62 - (0.133145 * base);
    irrf = Math.max(0, irrf - Math.max(0, reducao));
  }

  return Math.max(0, irrf);
}

// --- CÁLCULO DE RESCISÃO ---

export function calcularRescisao(input: InputRescisao): ResultadoRescisao {
  const meses = calcularMesesTrabalhados(input.dataAdmissao, input.dataDemissao);
  const anos = Math.floor(meses / 12);
  const diasTrab = diasTrabalhados(input.dataDemissao);
  const dem = new Date(input.dataDemissao + 'T00:00:00');
  const mesesNoAno = dem.getMonth() + 1;

  // 1. Saldo de salário
  const totalDiasMes = diasNoMes(input.dataDemissao);
  const saldoSalario = parseFloat(((input.salarioBruto / 30) * diasTrab).toFixed(2));

  // 2. Aviso prévio
  let diasAvisoPrevio = 0;
  let avisoPrevio = 0;
  if (input.tipoRescisao === 'sem_justa_causa') {
    diasAvisoPrevio = Math.min(30 + (anos * 3), 90);
    avisoPrevio = parseFloat(((input.salarioBruto / 30) * diasAvisoPrevio).toFixed(2));
  } else if (input.tipoRescisao === 'acordo') {
    diasAvisoPrevio = Math.min(30 + (anos * 3), 90);
    avisoPrevio = parseFloat((((input.salarioBruto / 30) * diasAvisoPrevio) * 0.5).toFixed(2));
  }

  // 3. Férias proporcionais
  let feriasProporcional = 0;
  if (input.tipoRescisao !== 'justa_causa') {
    const mesesProp = meses % 12 || (meses >= 12 ? 0 : meses);
    // Se tem meses proporcionais ou menos de 12 meses total
    const mesesParaCalculo = meses < 12 ? meses : mesesProp;
    if (mesesParaCalculo > 0) {
      feriasProporcional = parseFloat(((input.salarioBruto / 12) * mesesParaCalculo).toFixed(2));
    }
  }

  // 4. Férias vencidas
  const feriasVencidas = input.feriasVencidas ? input.salarioBruto : 0;

  // 5. 1/3 constitucional
  const tercoFerias = parseFloat(((feriasProporcional + feriasVencidas) / 3).toFixed(2));

  // 6. 13º proporcional
  let decimoTerceiro = 0;
  if (input.tipoRescisao !== 'justa_causa') {
    decimoTerceiro = parseFloat(((input.salarioBruto / 12) * mesesNoAno).toFixed(2));
  }

  // 7. FGTS + Multa
  const saldoFGTSEstimado = input.saldoFGTS || parseFloat((input.salarioBruto * 0.08 * meses).toFixed(2));
  let multaFGTS = 0;
  if (input.tipoRescisao === 'sem_justa_causa') {
    multaFGTS = parseFloat((saldoFGTSEstimado * 0.40).toFixed(2));
  } else if (input.tipoRescisao === 'acordo') {
    multaFGTS = parseFloat((saldoFGTSEstimado * 0.20).toFixed(2));
  }

  // Totais
  const totalBruto = parseFloat((
    saldoSalario + avisoPrevio + feriasProporcional +
    feriasVencidas + tercoFerias + decimoTerceiro + multaFGTS
  ).toFixed(2));

  // Descontos (sobre saldo de salário + 13º)
  const baseDescontoINSS = saldoSalario + decimoTerceiro;
  const descontoINSS = calcularINSS(baseDescontoINSS > input.salarioBruto ? input.salarioBruto : saldoSalario);
  const descontoIRRF = calcularIRRF(saldoSalario, descontoINSS);
  const totalLiquido = parseFloat((totalBruto - descontoINSS - descontoIRRF).toFixed(2));

  // Seguro-desemprego
  const temDireito = input.tipoRescisao === 'sem_justa_causa' && meses >= 6;
  let parcelas = 0;
  if (temDireito) {
    if (meses >= 24) parcelas = 5;
    else if (meses >= 12) parcelas = 4;
    else parcelas = 3;
  }

  return {
    saldoSalario, avisoPrevio, diasAvisoPrevio,
    feriasProporcional, feriasVencidas, tercoFerias,
    decimoTerceiro, multaFGTS, saldoFGTSEstimado,
    totalBruto, descontoINSS, descontoIRRF, totalLiquido,
    temDireitoSeguroDesemprego: temDireito,
    parcelasSeguro: parcelas,
    tipoRescisao: input.tipoRescisao,
    mesesTrabalhados: meses,
    diasTrabalhadosMes: diasTrab,
  };
}

// --- CÁLCULO DE FÉRIAS ---

export function calcularFerias(input: InputFerias): ResultadoFerias {
  const proporcao = input.diasFerias / 30;
  const salarioFerias = parseFloat((input.salarioBruto * proporcao).toFixed(2));
  const tercoConstitucional = parseFloat((salarioFerias / 3).toFixed(2));

  let abonoPecuniario = 0;
  let tercoAbono = 0;
  if (input.abonoConvertido) {
    const diasAbono = 30 - input.diasFerias;
    abonoPecuniario = parseFloat(((input.salarioBruto / 30) * diasAbono).toFixed(2));
    tercoAbono = parseFloat((abonoPecuniario / 3).toFixed(2));
  }

  const totalBruto = parseFloat((salarioFerias + tercoConstitucional + abonoPecuniario + tercoAbono).toFixed(2));
  const descontoINSS = calcularINSS(salarioFerias);
  const descontoIRRF = calcularIRRF(salarioFerias + tercoConstitucional, descontoINSS);
  const totalLiquido = parseFloat((totalBruto - descontoINSS - descontoIRRF).toFixed(2));

  return {
    salarioFerias, tercoConstitucional, abonoPecuniario,
    tercoAbono, totalBruto, descontoINSS, descontoIRRF, totalLiquido,
  };
}

// --- CÁLCULO DE 13º SALÁRIO ---

export function calcularDecimoTerceiro(input: InputDecimoTerceiro): ResultadoDecimoTerceiro {
  const valorBruto = parseFloat(((input.salarioBruto / 12) * input.mesesTrabalhados).toFixed(2));
  const descontoINSS = calcularINSS(valorBruto);
  const descontoIRRF = calcularIRRF(valorBruto, descontoINSS);
  const totalLiquido = parseFloat((valorBruto - descontoINSS - descontoIRRF).toFixed(2));

  return { valorBruto, descontoINSS, descontoIRRF, totalLiquido };
}

// --- CÁLCULO DE SALÁRIO LÍQUIDO ---

export function calcularSalarioLiquido(input: InputSalarioLiquido): ResultadoSalarioLiquido {
  const descontoINSS = calcularINSS(input.salarioBruto);
  const descontoIRRF = calcularIRRF(input.salarioBruto, descontoINSS, input.dependentes);
  const totalDescontos = parseFloat((descontoINSS + descontoIRRF).toFixed(2));
  const salarioLiquido = parseFloat((input.salarioBruto - totalDescontos).toFixed(2));

  return {
    salarioBruto: input.salarioBruto,
    descontoINSS, descontoIRRF, totalDescontos, salarioLiquido,
  };
}

// --- FORMATAÇÃO ---

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function labelTipoRescisao(tipo: TipoRescisao): string {
  const labels: Record<TipoRescisao, string> = {
    sem_justa_causa: 'Demissão sem justa causa',
    pedido_demissao: 'Pedido de demissão',
    acordo: 'Acordo (Art. 484-A)',
    justa_causa: 'Demissão por justa causa',
  };
  return labels[tipo];
}
