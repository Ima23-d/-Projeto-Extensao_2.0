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

// Opções para Gráfico de Barras
function getChartBarrasOptions() {
  const colors = getThemeColors();
  return {
    series: [{
      name: 'Receita',
      data: [45000, 52000, 48000, 61000, 55000, 67000, 72000, 58000]
    }],
    chart: {
      type: 'bar',
      height: 320,
      toolbar: { show: true },
      foreColor: colors.texto,
      background: colors.fundo
    },
    colors: ['#3B82F6'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    grid: {
      strokeDashArray: 4,
      borderColor: colors.borda
    },
    xaxis: {
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'],
      labels: {
        style: {
          colors: colors.suave,
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(value) {
          return 'R$ ' + (value / 1000).toFixed(0) + 'k';
        },
        style: {
          colors: colors.suave,
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      theme: isDarkMode() ? 'dark' : 'light',
      y: {
        formatter: function(value) {
          return 'R$ ' + value.toLocaleString('pt-BR');
        }
      }
    },
    fill: {
      opacity: 1
    }
  };
}

// Opções para Gráfico de Linha
function getChartLinhaOptions() {
  const colors = getThemeColors();
  return {
    series: [
      {
        name: 'Receita',
        data: [30000, 40000, 35000, 50000, 49000, 60000, 75000, 85000]
      },
      {
        name: 'Custos',
        data: [18000, 24000, 21000, 30000, 29000, 36000, 45000, 51000]
      }
    ],
    chart: {
      type: 'line',
      height: 400,
      toolbar: { show: true },
      foreColor: colors.texto,
      background: colors.fundo
    },
    colors: ['#16A34A', '#DC2626'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      strokeDashArray: 4,
      borderColor: colors.borda
    },
    xaxis: {
      categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom', 'Seg'],
      labels: {
        style: {
          colors: colors.suave,
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(value) {
          return 'R$ ' + (value / 1000).toFixed(0) + 'k';
        },
        style: {
          colors: colors.suave,
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      theme: isDarkMode() ? 'dark' : 'light',
      y: {
        formatter: function(value) {
          return 'R$ ' + value.toLocaleString('pt-BR');
        }
      }
    },
    legend: {
      position: 'top',
      labels: {
        colors: colors.texto
      }
    }
  };
}

// Opções para Gráfico de Pizza
function getChartPizzaOptions() {
  const colors = getThemeColors();
  return {
    series: [30, 25, 20, 15, 10],
    chart: {
      type: 'pie',
      height: 320,
      toolbar: { show: true },
      foreColor: colors.texto
    },
    colors: ['#3B82F6', '#16A34A', '#DC2626', '#F59E0B', '#8B5CF6'],
    labels: ['Categoria A', 'Categoria B', 'Categoria C', 'Categoria D', 'Categoria E'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%'
        }
      }
    },
    tooltip: {
      theme: isDarkMode() ? 'dark' : 'light',
      y: {
        formatter: function(value) {
          return value + '%';
        }
      }
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: colors.texto
      }
    },
    dataLabels: {
      style: {
        colors: [colors.texto]
      }
    }
  };
}

// Opções para Gráfico de Área
function getChartAreaOptions() {
  const colors = getThemeColors();
  return {
    series: [{
      name: 'Volume de Vendas',
      data: [31, 40, 28, 51, 42, 109, 100, 88, 95, 76, 84, 92]
    }],
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: true },
      foreColor: colors.texto,
      background: colors.fundo
    },
    colors: ['#06B6D4'],
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.45,
        opacityTo: 0.05
      }
    },
    grid: {
      strokeDashArray: 4,
      borderColor: colors.borda
    },
    xaxis: {
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      labels: {
        style: {
          colors: colors.suave,
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: colors.suave,
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      theme: isDarkMode() ? 'dark' : 'light'
    }
  };
}

// Opções para Gráfico Comparativo Trimestral
function getChartComparativoOptions() {
  const colors = getThemeColors();
  return {
    series: [
      {
        name: 'Receita',
        data: [245000, 280000, 320000]
      },
      {
        name: 'Despesa',
        data: [160000, 155000, 150000]
      },
      {
        name: 'Lucro',
        data: [85000, 125000, 170000]
      }
    ],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: true },
      foreColor: colors.texto,
      background: colors.fundo
    },
    colors: ['#3B82F6', '#DC2626', '#16A34A'],
    grid: {
      strokeDashArray: 4,
      borderColor: colors.borda
    },
    xaxis: {
      categories: ['Q1', 'Q2', 'Q3'],
      labels: {
        style: {
          colors: colors.suave,
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(value) {
          return 'R$ ' + (value / 1000).toFixed(0) + 'k';
        },
        style: {
          colors: colors.suave,
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      theme: isDarkMode() ? 'dark' : 'light',
      y: {
        formatter: function(value) {
          return 'R$ ' + value.toLocaleString('pt-BR');
        }
      }
    },
    legend: {
      position: 'top',
      labels: {
        colors: colors.texto
      }
    }
  };
}

// ==========================================
// Renderizar gráficos
// ==========================================

const chartsInstances = {};

function renderizarGraficos() {
  // Destruir instâncias anteriores
  Object.values(chartsInstances).forEach(chart => {
    if (chart) chart.destroy();
  });

  if (document.getElementById('graficoBarrasGaleria')) {
    chartsInstances.barras = new ApexCharts(
      document.getElementById('graficoBarrasGaleria'),
      getChartBarrasOptions()
    ).render();
  }

  if (document.getElementById('graficoLinhaGaleria')) {
    chartsInstances.linha = new ApexCharts(
      document.getElementById('graficoLinhaGaleria'),
      getChartLinhaOptions()
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

