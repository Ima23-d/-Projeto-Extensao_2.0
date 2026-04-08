// ==========================================
// Gráficos ApexCharts - Dashboard Empresarial
// ==========================================

// Função auxiliar para detectar modo escuro
function isDarkMode() {
  return document.body.classList.contains('tema-escuro');
}

// Função para obter cores baseado no tema
function getThemeColors() {
  const isDark = isDarkMode();
  return {
    texto: isDark ? '#F9FAFB' : '#111827',
    suave: isDark ? '#CBD5E1' : '#6B7280',
    borda: isDark ? '#334155' : '#E5E7EB',
    fundo: isDark ? '#1d1d1d' : '#FFFFFF',
    gradientoBorda: isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(229, 231, 235, 0.5)'
  };
}

// ==========================================
// 📊 DESPESA POR CATEGORIA (CORRETO)
// ==========================================
function getChartBarrasOptions() {
  const colors = getThemeColors();
  return {
    series: [{
      name: 'Despesas',
      data: [25000, 18000, 12000, 9000, 7000]
    }],
    chart: {
      type: 'bar',
      height: 320,
      foreColor: colors.texto
    },
    colors: ['#0586c2'],
    xaxis: {
      categories: ['Fornecedores', 'Marketing', 'Operacional', 'Equipe', 'Outros']
    },
    tooltip: {
      y: val => 'R$ ' + val.toLocaleString('pt-BR')
    }
  };
}

// ==========================================
// 📈 RECEITA vs DESPESA (PRINCIPAL)
// ==========================================
function getChartLinhaOptions() {
  const colors = getThemeColors();

  const receita = [30000, 40000, 35000, 50000, 49000, 60000, 75000, 85000];
  const despesa = [18000, 24000, 21000, 30000, 29000, 36000, 45000, 51000];

  // ✅ cálculo automático do lucro
  const lucro = receita.map((valor, i) => valor - despesa[i]);

  return {
    series: [
      {
        name: 'Receita',
        data: receita
      },
      {
        name: 'Despesa',
        data: despesa
      },
      {
        name: 'Lucro',
        data: lucro
      }
    ],
    chart: {
      type: 'line',
      height: 400,
      foreColor: colors.texto
    },
    // ✅ cores corretas (padrão financeiro)
    colors: ['#3B82F6', '#DC2626', '#16A34A'],
    stroke: {
      curve: 'smooth',
      width: [2,2,4]
    },
    xaxis: {
      categories: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago']
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return 'R$ ' + val.toLocaleString('pt-BR');
        }
      }
    },
    legend: {
      position: 'top'
    }
  };
}

// ==========================================
// 📈 LUCRO AO LONGO DO TEMPO
// ==========================================
function getChartAreaOptions() {
  const colors = getThemeColors();
  return {
    series: [{
      name: 'Lucro',
      data: [12000, 16000, 14000, 20000, 19000, 24000, 30000, 34000]
    }],
    chart: {
      type: 'area',
      height: 350,
      foreColor: colors.texto
    },
    colors: ['#16A34A'],
    stroke: { curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.05
      }
    },
    xaxis: {
      categories: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago']
    },
    tooltip: {
      y: val => 'R$ ' + val.toLocaleString('pt-BR')
    }
  };
}

// ==========================================
// 📊 MARGEM DE LUCRO (%)
// ==========================================
function getChartPizzaOptions() {
  const colors = getThemeColors();
  return {
    series: [26.2, 73.8],
    chart: {
      type: 'donut',
      height: 320
    },
    labels: ['Margem de Lucro', 'Custos'],
    colors: ['#16A34A', '#DC2626'],
    tooltip: {
      y: val => val + '%'
    },
    legend: {
      position: 'bottom'
    }
  };
}

// ==========================================
// 📈 CRESCIMENTO (%)
// ==========================================
function getChartComparativoOptions() {
  const colors = getThemeColors();
  return {
    series: [{
      name: 'Crescimento (%)',
      data: [5, 12, 18, 10, 22, 25, 30]
    }],
    chart: {
      type: 'line',
      height: 350,
      foreColor: colors.texto
    },
    colors: ['#3B82F6'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul']
    },
    tooltip: {
      y: val => val + '%'
    }
  };
}

// ==========================================
// Renderizar gráficos
// ==========================================

const chartsInstances = {};

function renderizarGraficos() {

  Object.values(chartsInstances).forEach(chart => {
    if (chart) chart.destroy();
  });

  if (document.getElementById('graficoLinhaGaleria')) {
    chartsInstances.linha = new ApexCharts(
      document.getElementById('graficoLinhaGaleria'),
      getChartLinhaOptions()
    ).render();
  }

  if (document.getElementById('graficoBarrasGaleria')) {
    chartsInstances.barras = new ApexCharts(
      document.getElementById('graficoBarrasGaleria'),
      getChartBarrasOptions()
    ).render();
  }

  if (document.getElementById('graficoPizzaGaleria')) {
    chartsInstances.pizza = new ApexCharts(
      document.getElementById('graficoPizzaGaleria'),
      getChartPizzaOptions()
    ).render();
  }

  if (document.getElementById('graficoAreaGaleria')) {
    chartsInstances.area = new ApexCharts(
      document.getElementById('graficoAreaGaleria'),
      getChartAreaOptions()
    ).render();
  }

  if (document.getElementById('graficoComparativoTrimestral')) {
    chartsInstances.comparativo = new ApexCharts(
      document.getElementById('graficoComparativoTrimestral'),
      getChartComparativoOptions()
    ).render();
  }
}

// Renderizar ao carregar a página
document.addEventListener('DOMContentLoaded', renderizarGraficos);

// Redenrizar gráficos ao trocar de tema
const originalAlternarTema = window.alternarTema;
window.alternarTema = function() {
  if (originalAlternarTema) {
    originalAlternarTema();
  }
  // Aguardar um pouco para o DOM atualizar
  setTimeout(renderizarGraficos, 100);
};

// ==========================================
// Filtro por período
// ==========================================

document.getElementById('periodoDash')?.addEventListener('change', function() {
  const periodo = this.value;
  console.log('Período selecionado:', periodo);
  // Aqui você pode adicionar lógica para atualizar os dados dos gráficos
  // baseado no período selecionado
});

