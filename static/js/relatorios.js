// =============================
// DADOS CONSOLIDADOS
// =============================
const dadosApp = {
  meses: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
  faturamento: [180000, 195000, 210000, 225000, 235000, 245680],
  despesas: [125000, 132000, 140000, 148000, 155000, 160250],
  lucro: [55000, 63000, 70000, 77000, 80000, 85430],
  margem: [30.6, 32.3, 33.3, 34.2, 34.0, 34.8]
};

// =============================
// FUNÇÃO: TOGGLE CHECKBOX
// =============================
function toggleCheck(id) {
  const checkbox = document.getElementById(id);
  checkbox.checked = !checkbox.checked;
}

// =============================
// FUNÇÃO: GERAR PREVIEW
// =============================
function gerarPreview() {
  const preview = document.getElementById('preview');
  let html = '';

  const nome = document.getElementById('nomeRel').value || 'Relatório';
  const periodo = document.getElementById('perRel').value;
  const data = new Date().toLocaleDateString('pt-BR');

  // Cabeçalho
  html += `
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 28px; margin-bottom: 4px;">${nome}</h1>
      <p style="color: var(--suave); font-size: 12px;">Gerado em ${data} | Período: ${periodo}</p>
    </div>
  `;

  // KPIs
  if (document.getElementById('opt-kpi').checked) {
    html += `
      <div class="preview-secao">
        <div class="preview-titulo"><i class="fa-solid fa-chart-bar"></i> KPIs Principais</div>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-val">R$ ${formatarValor(dadosApp.faturamento[5])}</div>
            <div class="kpi-lbl">Faturamento Total</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val">R$ ${formatarValor(dadosApp.lucro[5])}</div>
            <div class="kpi-lbl">Lucro Líquido</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val">R$ ${formatarValor(dadosApp.despesas[5])}</div>
            <div class="kpi-lbl">Despesas Totais</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val">+18,5%</div>
            <div class="kpi-lbl">Crescimento</div>
          </div>
        </div>
      </div>
    `;
  }

  // Tendências
  if (document.getElementById('opt-tendencias').checked) {
    html += `
      <div class="preview-secao">
        <div class="preview-titulo"><i class="fa-solid fa-chart-line"></i> Tendências de Crescimento</div>
        <p style="font-size: 13px; color: var(--texto); margin-bottom: 12px;">
          O faturamento apresentou crescimento progressivo ao longo dos 6 meses, passando de R$ 180.000 em janeiro para R$ 245.680 em junho.
          Isso representa um aumento de 36,5% e indica um desempenho positivo do negócio.
        </p>
        <table>
          <tr>
            <th>Mês</th>
            <th>Faturamento</th>
            <th>Variação %</th>
          </tr>
          ${dadosApp.meses.map((mes, i) => {
            const variacao = i === 0 ? '-' : (((dadosApp.faturamento[i] - dadosApp.faturamento[i-1]) / dadosApp.faturamento[i-1] * 100).toFixed(1) + '%');
            return `
              <tr>
                <td>${mes}</td>
                <td>R$ ${formatarValor(dadosApp.faturamento[i])}</td>
                <td style="color: ${variacao === '-' ? 'var(--suave)' : 'var(--sucesso)'};">${variacao}</td>
              </tr>
            `;
          }).join('')}
        </table>
      </div>
    `;
  }

  // Margem
  if (document.getElementById('opt-margem').checked) {
    html += `
      <div class="preview-secao">
        <div class="preview-titulo"><i class="fa-solid fa-percent"></i> Análise de Margem</div>
        <p style="font-size: 13px; color: var(--texto); margin-bottom: 12px;">
          A margem de lucro manteve-se saudável, oscilando entre 30,6% e 34,8%, demonstrando eficiência na gestão de custos.
        </p>
        <table>
          <tr>
            <th>Mês</th>
            <th>Margem %</th>
          </tr>
          ${dadosApp.meses.map((mes, i) => `
            <tr>
              <td>${mes}</td>
              <td>${dadosApp.margem[i]}%</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  // Dados Detalhados
  if (document.getElementById('opt-dados').checked) {
    html += `
      <div class="preview-secao">
        <div class="preview-titulo"><i class="fa-solid fa-table"></i> Dados Completos</div>
        <table>
          <tr>
            <th>Mês</th>
            <th>Faturamento</th>
            <th>Despesas</th>
            <th>Lucro</th>
          </tr>
          ${dadosApp.meses.map((mes, i) => `
            <tr>
              <td>${mes}</td>
              <td>R$ ${formatarValor(dadosApp.faturamento[i])}</td>
              <td>R$ ${formatarValor(dadosApp.despesas[i])}</td>
              <td>R$ ${formatarValor(dadosApp.lucro[i])}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  // Insights
  if (document.getElementById('opt-insights').checked) {
    html += `
      <div class="preview-secao">
        <div class="preview-titulo"><i class="fa-solid fa-lightbulb"></i> Insights & Recomendações</div>
        
        <div style="background: var(--fundo); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <strong>✓ Principais Achados:</strong>
          <ul style="margin: 8px 0 0 20px; font-size: 13px; color: var(--texto);">
            <li>Crescimento consistente de 36,5% no período de 6 meses</li>
            <li>Margem de lucro saudável mantida acima de 30%</li>
            <li>Despesas sob controle com redução de 3% no período anterior</li>
            <li>Lucro crescendo em ritmo acelerado (55% entre jan-jun)</li>
          </ul>
        </div>

        <div style="background: var(--fundo); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
          <strong>💡 Recomendações:</strong>
          <ul style="margin: 8px 0 0 20px; font-size: 13px; color: var(--texto);">
            <li>Manter a estratégia atual que está gerando crescimento</li>
            <li>Investigar o aumento de despesas em março-abril para otimização</li>
            <li>Considerar reinvestimento do lucro em estratégias de crescimento</li>
          </ul>
        </div>

        <div style="background: var(--fundo); padding: 12px; border-radius: 6px;">
          <strong>🎯 Oportunidades Identificadas:</strong>
          <ul style="margin: 8px 0 0 20px; font-size: 13px; color: var(--texto);">
            <li>Margem pode ser aumentada através de otimização operacional</li>
            <li>Potencial para escalar vendas mantendo a atual estrutura de custos</li>
            <li>Investigar fatores que causaram maior crescimento em junho</li>
          </ul>
        </div>
      </div>
    `;
  }

  preview.innerHTML = html;
  preview.classList.add('ativo');
}

// =============================
// FUNÇÃO: FORMATAR VALORES
// =============================
function formatarValor(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
}

// =============================
// FUNÇÃO: EXPORTAR PDF
// =============================
function exportarPDF() {
  const nome = document.getElementById('nomeRel').value || 'Relatorio';
  const preview = document.getElementById('preview');

  if (!preview.classList.contains('ativo')) {
    alert('Gere o preview primeiro!');
    return;
  }

  const opt = {
    margin: 10,
    filename: `${nome}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };

  html2pdf().set(opt).from(preview.innerHTML).save();
  alert('✓ PDF baixado com sucesso!');
}

