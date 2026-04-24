// =============================
// DADOS CONSOLIDADOS (só dados carregados)
// =============================
const dadosApp = {
  meses: [],
  faturamento: [],
  despesas: [],
  lucro: [],
  margem: []
};

// =============================
// UTILITÁRIOS
// =============================
function numeroValido(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;
  if (typeof valor === "number" && !Number.isNaN(valor)) return valor;

  const convertido = Number(String(valor).replace(/[^0-9-,.]/g, "").replace(/,/g, "."));
  return Number.isNaN(convertido) ? 0 : convertido;
}

function getCheckbox(id) {
  return document.getElementById(id)?.checked === true;
}

function formatarValor(valor) {
  const num = Number(valor) || 0;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function somaValores(valores = []) {
  return valores.reduce((total, valor) => total + valor, 0);
}

function calcCrescimento(valores = []) {
  if (valores.length < 2) return '0%';

  const primeiro = valores[0];
  const ultimo = valores[valores.length - 1];
  if (primeiro === 0) return '0%';

  return `${(((ultimo - primeiro) / primeiro) * 100).toFixed(1)}%`;
}

// =============================
// MONTAGEM DE DADOS
// =============================
function obterCampo(dadosSalvos, alternativas = []) {
  if (!Array.isArray(dadosSalvos) || dadosSalvos.length === 0) return null;
  const nomes = Object.keys(dadosSalvos[0] || {});
  const lowerNomes = nomes.map(n => n.toLowerCase());
  const achado = alternativas
    .map(a => a.toLowerCase())
    .map(a => lowerNomes.findIndex(n => n.includes(a)))
    .find(i => i >= 0);
  return achado >= 0 ? nomes[achado] : null;
}

function montarDadosApp(dadosSalvos) {
  if (!Array.isArray(dadosSalvos) || dadosSalvos.length === 0) return;

  const campoPeriodo = obterCampo(dadosSalvos, ['data', 'periodo', 'mês', 'mes', 'date']);
  const campoFaturamento = obterCampo(dadosSalvos, ['faturamento', 'receita', 'total', 'valor', 'sales']);
  const campoDespesas = obterCampo(dadosSalvos, ['despesa', 'custo', 'cost', 'despesas', 'expenses']);
  const campoLucro = obterCampo(dadosSalvos, ['lucro', 'profit', 'ganho', 'margin']);
  const campoMargem = obterCampo(dadosSalvos, ['margem', 'margin']);

  const meses = [];
  const faturamento = [];
  const despesas = [];
  const lucro = [];
  const margem = [];

  dadosSalvos.forEach((linha, index) => {
    const rawPeriodo = campoPeriodo ? String(linha[campoPeriodo] ?? '').trim() : '';
    const mes = rawPeriodo || `Mês ${index + 1}`;

    const fat = numeroValido(campoFaturamento ? linha[campoFaturamento] : linha.Total ?? linha.total ?? linha.Receita ?? linha.receita);
    let desp = numeroValido(campoDespesas ? linha[campoDespesas] : linha.Custo ?? linha.custo ?? 0);
    let luc = numeroValido(campoLucro ? linha[campoLucro] : linha.Lucro ?? linha.lucro ?? 0);
    let mar = numeroValido(campoMargem ? linha[campoMargem] : '');

    if (!desp && fat && luc) {
      desp = Math.max(0, fat - luc);
    }
    if (!luc && fat && desp) {
      luc = Math.max(0, fat - desp);
    }
    if (!mar && fat) {
      mar = (luc / fat) * 100;
    }

    meses.push(mes);
    faturamento.push(fat);
    despesas.push(desp);
    lucro.push(luc);
    margem.push(Number(mar.toFixed(1)));
  });

  dadosApp.meses = meses;
  dadosApp.faturamento = faturamento;
  dadosApp.despesas = despesas;
  dadosApp.lucro = lucro;
  dadosApp.margem = margem;
}

async function carregarDadosRelatorios() {
  try {
    const resposta = await fetch('/carregar-dados');
    const json = await resposta.json();

    if (Array.isArray(json.dados) && json.dados.length > 0) {
      montarDadosApp(json.dados);
    }

    if (document.getElementById('preview')?.classList.contains('ativo')) {
      gerarPreview();
    }
  } catch (erro) {
    console.warn('Erro ao carregar dados do relatório:', erro);
  }
}

// =============================
// FILTRO POR PERÍODO
// =============================
function getPeriodoDados(periodo) {
  const totalMeses = dadosApp.meses.length;
  if (totalMeses === 0) return { meses: [], faturamento: [], despesas: [], lucro: [], margem: [] };

  const regras = {
    'Últimos 30 dias': Math.min(1, totalMeses),
    'Últimos 6 meses': Math.min(6, totalMeses),
    'Este ano': totalMeses
  };

  const qtd = regras[periodo] ?? Math.min(6, totalMeses);
  const start = Math.max(0, totalMeses - qtd);

  return {
    meses: dadosApp.meses.slice(start),
    faturamento: dadosApp.faturamento.slice(start),
    despesas: dadosApp.despesas.slice(start),
    lucro: dadosApp.lucro.slice(start),
    margem: dadosApp.margem.slice(start)
  };
}

// =============================
// SEÇÕES DE PREVIEW
// =============================
function gerarCabecalhoRelatorio(nome, data, periodo) {
  return `\n    <div style="text-align: center; margin-bottom: 24px;">\n      <h1 style="font-size: 28px; margin-bottom: 4px;">${nome}</h1>\n      <p style="color: var(--suave); font-size: 12px;">Gerado em ${data} | Período: ${periodo}</p>\n    </div>\n  `;
}

function gerarKpis(faturamentoTotal, lucroTotal, despesasTotal, crescimentoPeriodo) {
  return `\n    <div class="preview-secao">\n      <div class="preview-titulo"><i class="fa-solid fa-chart-bar"></i> KPIs Principais</div>\n      <div class="kpi-grid">\n        <div class="kpi-card"><div class="kpi-val">R$ ${formatarValor(faturamentoTotal)}</div><div class="kpi-lbl">Faturamento Total</div></div>\n        <div class="kpi-card"><div class="kpi-val">R$ ${formatarValor(lucroTotal)}</div><div class="kpi-lbl">Lucro Líquido</div></div>\n        <div class="kpi-card"><div class="kpi-val">R$ ${formatarValor(despesasTotal)}</div><div class="kpi-lbl">Despesas Totais</div></div>\n        <div class="kpi-card"><div class="kpi-val">${crescimentoPeriodo}</div><div class="kpi-lbl">Crescimento</div></div>\n      </div>\n    </div>\n  `;
}

function gerarSecaoTendencias() {
  const rows = dadosApp.meses.map((mes, i) => {
    const variacao = i === 0
      ? '-'
      : `${(((dadosApp.faturamento[i] - dadosApp.faturamento[i - 1]) / dadosApp.faturamento[i - 1]) * 100).toFixed(1)}%`;
    const cor = i === 0 ? 'var(--suave)' : 'var(--sucesso)';
    return `\n      <tr><td>${mes}</td><td>R$ ${formatarValor(dadosApp.faturamento[i])}</td><td style="color: ${cor};">${variacao}</td></tr>\n    `;
  }).join('');

  return `\n    <div class="preview-secao">\n      <div class="preview-titulo"><i class="fa-solid fa-chart-line"></i> Tendências de Crescimento</div>\n      <p style="font-size: 13px; color: var(--texto); margin-bottom: 12px;">O faturamento apresentou crescimento progressivo ao longo do período selecionado.</p>\n      <table><tr><th>Mês</th><th>Faturamento</th><th>Variação %</th></tr>${rows}</table>\n    </div>\n  `;
}

function gerarSecaoMargem() {
  const rows = dadosApp.meses.map((mes, i) => `<tr><td>${mes}</td><td>${dadosApp.margem[i]}%</td></tr>`).join('');

  return `\n    <div class="preview-secao">\n      <div class="preview-titulo"><i class="fa-solid fa-percent"></i> Análise de Margem</div>\n      <p style="font-size: 13px; color: var(--texto); margin-bottom: 12px;">A margem de lucro se manteve estável no período.</p>\n      <table><tr><th>Mês</th><th>Margem %</th></tr>${rows}</table>\n    </div>\n  `;
}

function gerarSecaoGrafico() {
  return `\n    <div class="preview-secao">\n      <div class="preview-titulo"><i class="fa-solid fa-chart-simple"></i> Gráfico de Faturamento</div>\n      <div id="grafico-relatorio" style="max-width:100%; height:320px;"></div>\n    </div>\n  `;
}

function gerarSecaoDados() {
  const rows = dadosApp.meses.map((mes, i) => `<tr><td>${mes}</td><td>R$ ${formatarValor(dadosApp.faturamento[i])}</td><td>R$ ${formatarValor(dadosApp.despesas[i])}</td><td>R$ ${formatarValor(dadosApp.lucro[i])}</td></tr>`).join('');

  return `\n    <div class="preview-secao">\n      <div class="preview-titulo"><i class="fa-solid fa-table"></i> Dados Completos</div>\n      <table><tr><th>Mês</th><th>Faturamento</th><th>Despesas</th><th>Lucro</th></tr>${rows}</table>\n    </div>\n  `;
}

function gerarSecaoInsights() {
  const insights = [
    'Crescimento consistente de 36,5% no período.',
    'Margem de lucro saudável mantida acima de 30%.',
    'Despesas sob controle com leve aumento proporcional ao crescimento.',
    'Lucro crescendo em ritmo acelerado.'
  ];

  return `\n    <div class="preview-secao">\n      <div class="preview-titulo"><i class="fa-solid fa-lightbulb"></i> Insights & Recomendações</div>\n      <div style="background: var(--fundo); padding: 12px; border-radius: 6px; margin-bottom: 12px;"><strong>✓ Principais Achados:</strong><ul style="margin: 8px 0 0 20px; font-size: 13px; color: var(--texto);">${insights.map(i => `<li>${i}</li>`).join('')}</ul></div>\n      <div style="background: var(--fundo); padding: 12px; border-radius: 6px; margin-bottom: 12px;"><strong>💡 Recomendações:</strong><ul style="margin: 8px 0 0 20px; font-size: 13px; color: var(--texto);"><li>Manter a estratégia atual que está gerando crescimento.</li><li>Investigar aumento de despesas em março-abril para otimização.</li><li>Considerar reinvestimento de lucro em estratégias de crescimento.</li></ul></div>\n      <div style="background: var(--fundo); padding: 12px; border-radius: 6px;"><strong>🎯 Oportunidades Identificadas:</strong><ul style="margin: 8px 0 0 20px; font-size: 13px; color: var(--texto);"><li>Margem pode ser aumentada com otimização operacional.</li><li>Potencial para escalar vendas mantendo estrutura de custos.</li><li>Investigar fatores que impulsionaram crescimento em junho.</li></ul></div>\n    </div>\n  `;
}

// =============================
// GENERATION
// =============================
function gerarPreview() {
  const preview = document.getElementById('preview');
  const nome = document.getElementById('nomeRel').value || 'Relatório';
  const periodo = document.getElementById('perRel').value || 'Últimos 6 meses';
  const data = new Date().toLocaleDateString('pt-BR');

  if (!dadosApp.meses.length) {
    preview.innerHTML = `\n      <div class="preview-secao">\n        <div class="preview-titulo"><i class="fa-solid fa-triangle-exclamation"></i> Sem dados</div>\n        <p style="color: var(--perigo);">Nenhum dado foi encontrado. Carregue ou salve dados na página Dados para gerar relatórios.</p>\n      </div>\n    `;
    preview.classList.add('ativo');
    return;
  }

  const periodoDados = getPeriodoDados(periodo);
  const faturamentoTotal = somaValores(periodoDados.faturamento);
  const lucroTotal = somaValores(periodoDados.lucro);
  const despesasTotal = somaValores(periodoDados.despesas);
  const crescimentoPeriodo = calcCrescimento(periodoDados.faturamento);

  let html = gerarCabecalhoRelatorio(nome, data, periodo);
  if (getCheckbox('opt-kpi')) html += gerarKpis(faturamentoTotal, lucroTotal, despesasTotal, crescimentoPeriodo);
  if (getCheckbox('opt-tendencias')) html += gerarSecaoTendencias();
  if (getCheckbox('opt-margem')) html += gerarSecaoMargem();
  if (getCheckbox('opt-grafico')) html += gerarSecaoGrafico();
  if (getCheckbox('opt-dados')) html += gerarSecaoDados();
  if (getCheckbox('opt-insights')) html += gerarSecaoInsights();

  preview.innerHTML = html;
  preview.classList.add('ativo');

  if (getCheckbox('opt-grafico')) {
    setTimeout(() => renderizarGrafico(periodoDados), 50);
  }
}

function renderizarGrafico(periodoDados) {
  const container = document.getElementById('grafico-relatorio');
  if (!container || typeof ApexCharts === 'undefined') return;

  window.graficoRelatorio?.destroy();

  window.graficoRelatorio = new ApexCharts(container, {
    chart: { type: 'line', height: 350, zoom: { enabled: false } },
    series: [{ name: 'Faturamento', data: periodoDados.faturamento }, { name: 'Lucro', data: periodoDados.lucro }],
    xaxis: { categories: periodoDados.meses, title: { text: 'Mês' } },
    yaxis: { title: { text: 'Valor (R$)' }, labels: { formatter: v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) } },
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 4 },
    tooltip: { y: { formatter: v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) } },
    legend: { position: 'top' }
  });

  window.graficoRelatorio.render();
}

function exportarPDF() {
  const nome = document.getElementById('nomeRel').value || 'Relatório';
  const periodo = document.getElementById('perRel').value || 'Últimos 6 meses';
  const data = new Date().toLocaleDateString('pt-BR');

  gerarPreview();

  const periodoDados = getPeriodoDados(periodo);

  const payload = {
    nome,
    periodo,
    data,
    kpis: {
      faturamento: somaValores(periodoDados.faturamento),
      lucro: somaValores(periodoDados.lucro),
      despesas: somaValores(periodoDados.despesas),
      crescimento: calcCrescimento(periodoDados.faturamento)
    },
    grafico: getCheckbox('opt-grafico'),
    tendencias: getCheckbox('opt-tendencias'),
    margem: getCheckbox('opt-margem'),
    dadosDetalhados: getCheckbox('opt-dados'),
    insights: getCheckbox('opt-insights') ? [
      'Crescimento consistente de 36,5% no período de 6 meses',
      'Margem de lucro saudável mantida acima de 30%',
      'Despesas sob controle com leve aumento proporcional ao crescimento',
      'Lucro crescendo em ritmo acelerado (55% entre jan-jun)'
    ] : [],
    tabela: periodoDados.meses.map((mes, i) => ({ mes, fat: periodoDados.faturamento[i], desp: periodoDados.despesas[i], luc: periodoDados.lucro[i], margem: periodoDados.margem[i] }))
  };

  fetch('/gerar-relatorio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(async res => {
      if (!res.ok) {
        const texto = await res.text();
        throw new Error(`HTTP ${res.status}: ${texto.substring(0, 400)}`);
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        // Força a abertura do PDF direto após o redirecionamento
        window.location.href = `${data.redirect}?auto=1`;
      } else {
        alert('Erro ao gerar relatório: ' + (data.mensagem || 'Verifique os dados.'));
      }
    })
    .catch(erro => {
      console.error('Erro ao enviar relatório ao backend:', erro);
      alert('Erro ao gerar relatório. Consulte o console.');
    });
}

function toggleCheck(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.checked = !el.checked;
}

document.addEventListener('DOMContentLoaded', carregarDadosRelatorios);
