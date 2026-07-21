import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { PaymentItem, CalculationResult } from './calculatorEngine';
import { formatBRL, formatDateBR } from './formatters';

interface GeneratePDFParams {
  totalProposal: number;
  keyDeliveryDate: string;
  paymentItems: PaymentItem[];
  result: CalculationResult;
}

const getCategoryLabel = (cat: string) => {
  switch (cat) {
    case 'sinal': return 'Sinal';
    case 'entrada': return 'Entrada';
    case 'parcela_intermediaria': return 'Intermediárias';
    case 'chaves': return 'Chaves';
    default: return cat;
  }
};

export async function generateProposalPDF({
  totalProposal,
  keyDeliveryDate,
  paymentItems,
  result,
}: GeneratePDFParams): Promise<void> {
  // 1. Criar container isolado com Fundo Branco (#FFFFFF) e texto escuro de alto contraste (#111827)
  const pdfContainer = document.createElement('div');
  pdfContainer.id = 'pdf-export-container';
  pdfContainer.style.position = 'absolute';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.top = '-9999px';
  pdfContainer.style.width = '850px'; // Largura A4 padrão em pixels
  pdfContainer.style.backgroundColor = '#ffffff';
  pdfContainer.style.color = '#111827';
  pdfContainer.style.fontFamily = "'Outfit', Arial, sans-serif";
  pdfContainer.style.padding = '40px 45px';
  pdfContainer.style.boxSizing = 'border-box';

  const todayStr = formatDateBR(new Date().toISOString().split('T')[0]);

  // Cálculos do resumo dos lançamentos
  const totalItemsSum = paymentItems.reduce((acc, item) => acc + (item.value * item.installmentsCount), 0);
  const launchedPercent = totalProposal > 0 ? (totalItemsSum / totalProposal) * 100 : 0;
  const unlaunchedSum = Math.max(0, totalProposal - totalItemsSum);
  const unlaunchedPercent = Math.max(0, 100 - launchedPercent);

  // 2. Montar o conteúdo HTML da folha de PDF
  pdfContainer.innerHTML = `
    <!-- Título Centralizado: PROPOSTA -->
    <div style="text-align: center; border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 25px; position: relative;">
      <h1 style="font-size: 26px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #111827; margin: 0;">
        PROPOSTA
      </h1>
      <div style="position: absolute; right: 0; bottom: 12px; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">
        Emissão: ${todayStr}
      </div>
    </div>

    <!-- Tabela 1: Resumo da Proposta e Indicadores -->
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #111827; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #111827; display: inline-block;"></span>
        Resumo da Proposta
      </h2>
      <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #374151;">Preço da Proposta</th>
            <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #374151;">Data de Entrega</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #047857;">Até a Entrega</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4b5563;">Após Entrega (Saldo/Chaves)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 14px 16px; font-size: 16px; font-weight: 800; color: #111827;">${formatBRL(totalProposal)}</td>
            <td style="padding: 14px 16px; text-align: center; font-size: 14px; font-weight: 600; color: #111827;">${keyDeliveryDate ? formatDateBR(keyDeliveryDate) : 'Não informada'}</td>
            <td style="padding: 14px 16px; text-align: right; font-size: 15px; font-weight: 800; color: #047857;">
              ${formatBRL(result.totalPaidBeforeKeys)}
              <div style="font-size: 11px; font-weight: 600;">(${result.percentagePaidBeforeKeys.toFixed(2)}%)</div>
            </td>
            <td style="padding: 14px 16px; text-align: right; font-size: 15px; font-weight: 800; color: #4b5563;">
              ${formatBRL(result.totalPaidAfterKeys)}
              <div style="font-size: 11px; font-weight: 600;">(${(totalProposal > 0 ? (result.totalPaidAfterKeys / totalProposal) * 100 : 0).toFixed(2)}%)</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tabela 2: Cronograma Detalhado dos Lançamentos -->
    <div>
      <h2 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #111827; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #111827; display: inline-block;"></span>
        Cronograma de Lançamentos
      </h2>
      <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 10px 12px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #374151; width: 30px;">#</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #374151; width: 110px;">Modalidade</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #374151;">Descrição</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #374151; width: 65px;">Qtd</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #374151; width: 90px;">Vencimento</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #374151; width: 110px;">Valor Unit.</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #374151; width: 110px;">Total</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #047857; width: 65px;">% Prop.</th>
          </tr>
        </thead>
        <tbody>
          ${
            paymentItems.length === 0
              ? `<tr><td colspan="8" style="padding: 24px; text-align: center; color: #6b7280; font-size: 12px;">Nenhum pagamento cadastrado na proposta</td></tr>`
              : paymentItems.map((item, idx) => {
                  const itemTotal = item.value * item.installmentsCount;
                  const itemPercent = totalProposal > 0 ? (itemTotal / totalProposal) * 100 : 0;
                  const isEven = idx % 2 === 1;

                  const getPDFItemDescription = (item: PaymentItem): string => {
                    switch (item.category) {
                      case 'sinal':
                        return '-';
                      case 'entrada':
                        return item.installmentsCount > 1 ? 'Parcelada' : 'À vista';
                      case 'parcela_intermediaria': {
                        const recLabels: Record<string, string> = {
                          mensal: 'Mensal',
                          trimestral: 'Trimestral',
                          semestral: 'Semestral',
                          anual: 'Anual',
                        };
                        return item.recurrence ? recLabels[item.recurrence] || '-' : '-';
                      }
                      case 'chaves':
                        return '-';
                      default:
                        return '-';
                    }
                  };

                  return `
                    <tr style="background-color: ${isEven ? '#f9fafb' : '#ffffff'}; border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px 12px; text-align: center; font-size: 11px; color: #6b7280; font-weight: 600;">${idx + 1}</td>
                      <td style="padding: 10px 12px;">
                        <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; padding: 2px 7px; border-radius: 4px; background-color: #111827; color: #ffffff; display: inline-block;">
                          ${getCategoryLabel(item.category)}
                        </span>
                      </td>
                      <td style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #111827;">${getPDFItemDescription(item)}</td>
                      <td style="padding: 10px 12px; text-align: center; font-size: 11px; color: #4b5563;">${item.installmentsCount > 1 ? `${item.installmentsCount}x` : '1x'}</td>
                      <td style="padding: 10px 12px; text-align: center; font-size: 11px; color: #4b5563;">${formatDateBR(item.startDate)}</td>
                      <td style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 600; color: #4b5563;">${formatBRL(item.value)}</td>
                      <td style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 700; color: #111827;">${formatBRL(itemTotal)}</td>
                      <td style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 700; color: #047857;">${itemPercent.toFixed(2)}%</td>
                    </tr>
                  `;
                }).join('')
          }
        </tbody>
        <tfoot>
          <tr style="background-color: #f3f4f6; border-top: 2px solid #111827;">
            <td colspan="6" style="padding: 12px 16px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #111827; text-align: right;">Total Lançado:</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 800; color: #047857; text-align: right;">${formatBRL(totalItemsSum)}</td>
            <td style="padding: 12px 16px; font-size: 12px; font-weight: 800; color: #047857; text-align: right;">${launchedPercent.toFixed(2)}%</td>
          </tr>
          ${unlaunchedSum > 0 ? `
            <tr style="background-color: #ffffff;">
              <td colspan="6" style="padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280; text-align: right;">Saldo Não Lançado:</td>
              <td style="padding: 10px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-align: right;">${formatBRL(unlaunchedSum)}</td>
              <td style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #6b7280; text-align: right;">${unlaunchedPercent.toFixed(2)}%</td>
            </tr>
          ` : ''}
        </tfoot>
      </table>
    </div>

    <!-- Rodapé Limpo -->
    <div style="margin-top: 35px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 10px; color: #9ca3af;">
      Proposta gerada automaticamente em ${todayStr}
    </div>
  `;

  document.body.appendChild(pdfContainer);

  try {
    // 3. Renderizar com html2canvas em Fundo Branco (#FFFFFF)
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // 4. Gerar documento PDF com jsPDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save('proposta.pdf');
  } finally {
    // Limpar o container temporário
    if (pdfContainer.parentNode) {
      pdfContainer.parentNode.removeChild(pdfContainer);
    }
  }
}
