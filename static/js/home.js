// ======================
// CONFIGURAÇÕES
// ======================
const PERIODOS = {
  '7_dias': 'Últimos 7 dias',
  '30_dias': 'Últimos 30 dias',
  '90_dias': 'Últimos 90 dias',
  'ano_atual': 'Este ano'
};

let periodoAtual = '30_dias';
let chartLinha = null;
let chartBarras = null;

// ======================
// INIT
// ======================
document.addEventListener('DOMContentLoaded', () => {
  configurarPeriodo();
  atualizarTudo();
});

// ======================
// CONTROLE DE PERÍODO
// ======================
function configurarPeriodo() {
  const select = document.getElementById('periodo');
  if (!select) return;

  select.value = periodoAtual;

  select.addEventListener('change', e => {
    const valor = e.target.value;
    if (!PERIODOS[valor]) return console.error('Período inválido');

    periodoAtual = valor;
    atualizarTudo();
  });
}

// ======================
// ATUALIZAÇÃO GERAL
// ======================
function atualizarTudo() {
  carregarDados('/api/desempenho', atualizarIndicadores);
  carregarDados('/api/graficos', atualizarGraficos);
}

// ======================
// FETCH GENÉRICO
// ======================
function carregarDados(url, callback) {
  fetch(`${url}?periodo=${periodoAtual}`)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      if (!data.erro) callback(data);
    })
    .catch(err => console.error(err));
}

// ======================
// INDICADORES
// ======================
function atualizarIndicadores(data) {
  atualizarCard('faturamento', data.faturamento);
  atualizarCard('lucro', data.lucro);
  atualizarCard('despesa', data.despesa, true);

  setTexto('crescimento-valor', `+${data.crescimento.valor.toFixed(1)}%`);
}

function atualizarCard(nome, dados, inverter = false) {
  setTexto(`${nome}-valor`, formatarMoeda(dados.valor));

  const percentual = inverter ? Math.abs(dados.percentual) : dados.percentual;
  const positivo = inverter ? dados.percentual <= 0 : dados.percentual >= 0;

  const sinal = positivo ? '↑' : '↓';
  const cor = positivo ? '#10b981' : '#ef4444';

  setTexto(`${nome}-percent`, `${sinal} ${percentual.toFixed(1)}%`, cor);
}

function setTexto(dataId, texto, cor = null) {
  const el = document.querySelector(`[data-indicador="${dataId}"]`);
  if (!el) return;

  el.textContent = texto;
  if (cor) el.style.color = cor;
}

// ======================
// GRÁFICOS
// ======================
function atualizarGraficos(data) {
  renderGraficoLinha(data.grafico_linha);
  renderGraficoBarras(data.grafico_barras);
}

// ======================
// COR DINÂMICA DO TEMA
// ======================
function getCorTexto() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--texto')
    .trim();
}

// ======================
// GRÁFICO LINHA
// ======================
function renderGraficoLinha(dados) {
  const container = document.getElementById('graficoLinhaFaturamento');
  if (!container) return;

  if (!dados?.labels?.length) return renderVazio(container, 350);

  const corTexto = getCorTexto();

  destruir(chartLinha);
  container.innerHTML = '';

  chartLinha = new ApexCharts(container, {
    chart: { type: 'line', height: 350 },

    series: dados.series,

    xaxis: {
      categories: dados.labels,
      labels: { style: { colors: corTexto } }
    },

    yaxis: {
      labels: {
        formatter: formatarMoeda,
        style: { colors: corTexto }
      }
    },

    tooltip: { y: { formatter: formatarMoeda } },

    stroke: { curve: 'smooth' },

    title: {
      text: `Faturamento - ${PERIODOS[periodoAtual]}`,
      align: 'center',
      style: {
        color: "grey",
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },

    legend: {
      labels: { colors: corTexto }
    }
  });

  chartLinha.render();
}

// ======================
// GRÁFICO BARRAS
// ======================
function renderGraficoBarras(dados) {
  const container = document.getElementById('graficoPizzaComparativa');
  if (!container) return;

  if (!dados?.labels?.length) return renderVazio(container, 400);

  const corTexto = getCorTexto();

  destruir(chartBarras);
  container.innerHTML = '';

  chartBarras = new ApexCharts(container, {
    chart: {
      type: 'bar',
      height: 400
    },

    series: dados.series,

    colors: ['#3b82f6', '#10b981', '#ef4444'],

    xaxis: {
      categories: dados.labels,
      labels: { style: { colors: corTexto } }
    },

    yaxis: {
      labels: {
        formatter: formatarMoeda,
        style: { colors: corTexto }
      }
    },

    tooltip: {
      y: { formatter: formatarMoeda }
    },

    dataLabels: {
      enabled: false
    },

    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: '60%'
      }
    },

    title: {
      text: `Comparativo - ${PERIODOS[periodoAtual]}`,
      align: 'center',
      style: {
        color: "grey",
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },

    legend: {
      labels: { colors: corTexto }
    }
  });

  chartBarras.render();
}

// ======================
// UTILIDADES
// ======================
function destruir(chart) {
  if (chart) chart.destroy();
}

function renderVazio(container, altura) {
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:${altura}px;color:#9ca3af;">
      Sem dados para ${PERIODOS[periodoAtual]}
    </div>
  `;
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

function formatarMoedaSimples(valor) {
  if (valor >= 1e6) return `R$ ${(valor / 1e6).toFixed(1)}M`;
  if (valor >= 1e3) return `R$ ${(valor / 1e3).toFixed(1)}K`;
  return `R$ ${valor.toFixed(0)}`;
}