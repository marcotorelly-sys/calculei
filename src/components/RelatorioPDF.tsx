import { jsPDF } from 'jspdf';
import {
  calcularRescisao, formatarMoeda, labelTipoRescisao,
  type TipoRescisao, type ResultadoRescisao
} from '../lib/calculos';

interface Props {
  resultado: ResultadoRescisao;
  salarioBruto: number;
  dataAdmissao: string;
  dataDemissao: string;
  feriasVencidas: boolean;
}

function formatarData(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function gerarPDF(props: Props) {
  const { resultado, salarioBruto, dataAdmissao, dataDemissao, feriasVencidas } = props;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Cores
  const verde: [number, number, number] = [34, 197, 94];
  const cinza: [number, number, number] = [100, 116, 139];
  const escuro: [number, number, number] = [30, 41, 59];

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculei', 20, y + 5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Rescisão Trabalhista', 20, y + 14);

  doc.setFontSize(8);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, y + 22);

  y = 55;

  // Dados do trabalhador
  doc.setTextColor(...escuro);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados da Simulação', 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cinza);

  const dados = [
    ['Salário bruto mensal', formatarMoeda(salarioBruto)],
    ['Data de admissão', formatarData(dataAdmissao)],
    ['Data de demissão/saída', formatarData(dataDemissao)],
    ['Tipo de rescisão', labelTipoRescisao(resultado.tipoRescisao)],
    ['Tempo de serviço', `${resultado.mesesTrabalhados} meses`],
    ['Férias vencidas', feriasVencidas ? 'Sim' : 'Não'],
  ];

  dados.forEach(([label, valor]) => {
    doc.setTextColor(...cinza);
    doc.text(label, 20, y);
    doc.setTextColor(...escuro);
    doc.setFont('helvetica', 'bold');
    doc.text(valor, 120, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
  });

  y += 5;

  // Linha divisória
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // Detalhamento
  doc.setTextColor(...escuro);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento', 20, y);
  y += 8;

  doc.setFontSize(9);
  const itens = [
    ['Saldo de salário', resultado.saldoSalario],
    ...(resultado.avisoPrevio > 0 ? [[`Aviso prévio (${resultado.diasAvisoPrevio} dias)`, resultado.avisoPrevio] as [string, number]] : []),
    ...(resultado.feriasProporcional > 0 ? [['Férias proporcionais', resultado.feriasProporcional] as [string, number]] : []),
    ...(resultado.feriasVencidas > 0 ? [['Férias vencidas', resultado.feriasVencidas] as [string, number]] : []),
    ...(resultado.tercoFerias > 0 ? [['1/3 constitucional', resultado.tercoFerias] as [string, number]] : []),
    ...(resultado.decimoTerceiro > 0 ? [['13º proporcional', resultado.decimoTerceiro] as [string, number]] : []),
    ...(resultado.multaFGTS > 0 ? [[`Multa FGTS (${resultado.tipoRescisao === 'acordo' ? '20' : '40'}%)`, resultado.multaFGTS] as [string, number]] : []),
  ];

  itens.forEach(([label, valor]) => {
    doc.setTextColor(...cinza);
    doc.setFont('helvetica', 'normal');
    doc.text(label as string, 25, y);
    doc.setTextColor(...escuro);
    doc.text(formatarMoeda(valor as number), 150, y, { align: 'right' });
    y += 6;
  });

  // Total bruto
  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...escuro);
  doc.text('Total bruto', 25, y);
  doc.text(formatarMoeda(resultado.totalBruto), 150, y, { align: 'right' });
  y += 7;

  // Descontos
  if (resultado.descontoINSS > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(239, 68, 68);
    doc.text('(-) Desconto INSS', 25, y);
    doc.text(`- ${formatarMoeda(resultado.descontoINSS)}`, 150, y, { align: 'right' });
    y += 6;
  }
  if (resultado.descontoIRRF > 0) {
    doc.setTextColor(239, 68, 68);
    doc.text('(-) Desconto IRRF', 25, y);
    doc.text(`- ${formatarMoeda(resultado.descontoIRRF)}`, 150, y, { align: 'right' });
    y += 6;
  }

  // Total líquido
  y += 3;
  doc.setFillColor(...verde);
  doc.roundedRect(20, y - 4, pageWidth - 40, 14, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL LÍQUIDO A RECEBER', 25, y + 5);
  doc.setFontSize(13);
  doc.text(formatarMoeda(resultado.totalLiquido), pageWidth - 25, y + 5, { align: 'right' });

  y += 20;

  // Comparação de cenários
  doc.setTextColor(...escuro);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Comparação de Cenários', 20, y);
  y += 8;

  const tiposTodos: TipoRescisao[] = ['sem_justa_causa', 'pedido_demissao', 'acordo', 'justa_causa'];
  doc.setFontSize(9);

  tiposTodos.forEach((tipo) => {
    const res = tipo === resultado.tipoRescisao
      ? resultado
      : calcularRescisao({ salarioBruto, dataAdmissao, dataDemissao, tipoRescisao: tipo, feriasVencidas });

    const isAtual = tipo === resultado.tipoRescisao;

    if (isAtual) {
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(20, y - 4, pageWidth - 40, 8, 1, 1, 'F');
    }

    doc.setFont('helvetica', isAtual ? 'bold' : 'normal');
    doc.setTextColor(...(isAtual ? verde : cinza));
    doc.text(isAtual ? `▸ ${labelTipoRescisao(tipo)} (atual)` : `  ${labelTipoRescisao(tipo)}`, 25, y);
    doc.setTextColor(...escuro);
    doc.text(formatarMoeda(res.totalLiquido), 150, y, { align: 'right' });
    y += 7;
  });

  // Seguro-desemprego
  if (resultado.temDireitoSeguroDesemprego) {
    y += 5;
    doc.setTextColor(...escuro);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Seguro-desemprego: ${resultado.parcelasSeguro} parcelas estimadas`, 20, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...cinza);
    doc.text('Consulte o valor exato no portal Gov.br após dar entrada.', 20, y);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 25;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, footerY, pageWidth - 20, footerY);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('Simulação estimativa com base na CLT vigente e tabelas INSS/IRRF 2026.', 20, footerY + 6);
  doc.text('Para valores exatos, consulte um contador ou advogado trabalhista.', 20, footerY + 10);
  doc.text('O Calculei não substitui orientação profissional.', 20, footerY + 14);
  doc.text('calculei.net', pageWidth - 20, footerY + 10, { align: 'right' });

  // Salvar
  doc.save(`Calculei_Rescisao_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function BotaoRelatorioPDF(props: Props) {
  return (
    <button
      onClick={() => gerarPDF(props)}
      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Baixar Relatório PDF
    </button>
  );
}
