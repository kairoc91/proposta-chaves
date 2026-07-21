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
  // 1. Criar container isolado para renderização do PDF com estilos inline explícitos
  const pdfContainer = document.createElement('div');
  pdfContainer.id = 'pdf-export-container';
  pdfContainer.style.position = 'absolute';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.top = '-9999px';
  pdfContainer.style.width = '850px'; // Largura A4 padrão em pixels
  pdfContainer.style.backgroundColor = '#121212';
  pdfContainer.style.color = '#ffffff';
  pdfContainer.style.fontFamily = "'Outfit', Arial, sans-serif";
  pdfContainer.style.padding = '35px 40px';
  pdfContainer.style.boxSizing = 'border-box';

  const todayStr = formatDateBR(new Date().toISOString().split('T')[0]);

  // Cálculos do resumo dos lançamentos
  const totalItemsSum = paymentItems.reduce((acc, item) => acc + (item.value * item.installmentsCount), 0);
  const launchedPercent = totalProposal > 0 ? (totalItemsSum / totalProposal) * 100 : 0;
  const unlaunchedSum = Math.max(0, totalProposal - totalItemsSum);
  const unlaunchedPercent = Math.max(0, 100 - launchedPercent);

  // 2. Montar o conteúdo HTML com Tabelas Estruturadas
  pdfContainer.innerHTML = `
    <!-- Cabeçalho do Documento -->
    <div style="display: flex; justify: space-between; align-items: center; border-bottom: 2px solid #d6ff00; padding-bottom: 18px; margin-bottom: 25px;">
      <div>
        <h1 style="font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #d6ff00; margin: 0 0 6px 0;">
          Calculadora de Fluxo de Pagamento
        </h1>
        <p style="font-size: 13px; color: #bcbcbc; margin: 0;">
          Fluxo de Pagamento até a Entrega das Chaves
        </p>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #bcbcbc; background: #222222; padding: 4px 10px; border-radius: 4px; border: 1px solid #333333;">
          Emissão: ${todayStr}
        </span>
      </div>
    </div>

    <!-- Tabela 1: Resumo da Proposta e Indicadores -->
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #ffffff; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #d6ff00; display: inline-block;"></span>
        Resumo da Proposta
      </h2>
      <table style="width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <thead>
          <tr style="background-color: #242424; border-bottom: 1px solid #333333;">
            <th style="padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #bcbcbc;">Preço da Proposta</th>
            <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #bcbcbc;">Data de Entrega</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #d6ff00;">Até a Entrega</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #bcbcbc;">Após Entrega (Saldo/Chaves)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 14px 16px; font-size: 16px; font-weight: 800; color: #ffffff;">${formatBRL(totalProposal)}</td>
            <td style="padding: 14px 16px; text-align: center; font-size: 14px; font-weight: 600; color: #ffffff;">${keyDeliveryDate ? formatDateBR(keyDeliveryDate) : 'Não informada'}</td>
            <td style="padding: 14px 16px; text-align: right; font-size: 15px; font-weight: 800; color: #d6ff00;">
              ${formatBRL(result.totalPaidBeforeKeys)}
              <div style="font-size: 11px; font-weight: 600;">(${result.percentagePaidBeforeKeys.toFixed(2)}%)</div>
            </td>
            <td style="padding: 14px 16px; text-align: right; font-size: 15px; font-weight: 800; color: #bcbcbc;">
              ${formatBRL(result.totalPaidAfterKeys)}
              <div style="font-size: 11px; font-weight: 600;">(${(totalProposal > 0 ? (result.totalPaidAfterKeys / totalProposal) * 100 : 0).toFixed(2)}%)</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tabela 2: Cronograma Detalhado dos Lançamentos -->
    <div>
      <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #ffffff; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #d6ff00; display: inline-block;"></span>
        Cronograma de Lançamentos
      </h2>
      <table style="width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <thead>
          <tr style="background-color: #242424; border-bottom: 1px solid #333333;">
            <th style="padding: 10px 12px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #bcbcbc; width: 30px;">#</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #bcbcbc; width: 110px;">Modalidade</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #bcbcbc;">Descrição</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #bcbcbc; width: 70px;">Qtd</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #bcbcbc; width: 90px;">Vencimento</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #bcbcbc; width: 110px;">Valor Unit.</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #bcbcbc; width: 110px;">Total</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #d6ff00; width: 65px;">% Prop.</th>
          </tr>
        </thead>
        <tbody>
          ${
            paymentItems.length === 0
              ? `<tr><td colspan="8" style="padding: 24px; text-align: center; color: #bcbcbc; font-size: 12px;">Nenhum pagamento cadastrado na proposta</td></tr>`
              : paymentItems.map((item, idx) => {
                  const itemTotal = item.value * item.installmentsCount;
                  const itemPercent = totalProposal > 0 ? (itemTotal / totalProposal) * 100 : 0;
                  const isEven = idx % 2 === 1;

                  return `
                    <tr style="background-color: ${isEven ? '#202020' : '#1a1a1a'}; border-bottom: 1px solid #2a2a2a;">
                      <td style="padding: 10px 12px; text-align: center; font-size: 11px; color: #777777; font-weight: 600;">${idx + 1}</td>
                      <td style="padding: 10px 12px;">
                        <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; padding: 2px 6px; border-radius: 4px; background-color: rgba(214, 255, 0, 0.12); color: #d6ff00; border: 1px solid rgba(214, 255, 0, 0.25); display: inline-block;">
                          ${getCategoryLabel(item.category)}
                        </span>
                      </td>
                      <td style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #ffffff;">${item.description}</td>
                      <td style="padding: 10px 12px; text-align: center; font-size: 11px; color: #bcbcbc;">${item.installmentsCount > 1 ? `${item.installmentsCount}x` : '1x'}</td>
                      <td style="padding: 10px 12px; text-align: center; font-size: 11px; color: #bcbcbc;">${formatDateBR(item.startDate)}</td>
                      <td style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 600; color: #bcbcbc;">${formatBRL(item.value)}</td>
                      <td style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 700; color: #ffffff;">${formatBRL(itemTotal)}</td>
                      <td style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 700; color: #d6ff00;">${itemPercent.toFixed(2)}%</td>
                    </tr>
                  `;
                }).join('')
          }
        </tbody>
        <tfoot>
          <tr style="background-color: #242424; border-top: 2px solid #333333;">
            <td colspan="6" style="padding: 12px 16px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #ffffff; text-align: right;">Total Lançado:</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 800; color: #d6ff00; text-align: right;">${formatBRL(totalItemsSum)}</td>
            <td style="padding: 12px 16px; font-size: 12px; font-weight: 800; color: #d6ff00; text-align: right;">${launchedPercent.toFixed(2)}%</td>
          </tr>
          ${unlaunchedSum > 0 ? `
            <tr style="background-color: #1a1a1a;">
              <td colspan="6" style="padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #bcbcbc; text-align: right;">Saldo Não Lançado:</td>
              <td style="padding: 10px 16px; font-size: 12px; font-weight: 700; color: #bcbcbc; text-align: right;">${formatBRL(unlaunchedSum)}</td>
              <td style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #bcbcbc; text-align: right;">${unlaunchedPercent.toFixed(2)}%</td>
            </tr>
          ` : ''}
        </tfoot>
      </table>
    </div>

    <!-- Rodapé -->
    <div style="margin-top: 30px; text-align: center; border-top: 1px solid #2a2a2a; padding-top: 15px; font-size: 10px; color: #777777;">
      Documento gerado automaticamente por Calculadora de Fluxo de Pagamento até a Entrega das Chaves
    </div>
  `;

  document.body.appendChild(pdfContainer);

  try {
    // 3. Renderizar com html2canvas
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#121212',
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

    pdf.save('proposta_fluxo_pagamento.pdf');
  } finally {
    // Limpar o container temporário
    if (pdfContainer.parentNode) {
      pdfContainer.parentNode.removeChild(pdfContainer);
    }
  }
}
