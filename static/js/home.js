// ==========================================
// Gráficos ApexCharts
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
    fundo: isDark ? '#1d1d1d' : '#FFFFFF'
  };
}

// Opções do Gráfico de Linha
function getChartLinhaOptions() {
  const colors = getThemeColors();
  return {
    series: [{
      name: 'Faturamento',
      data: [30000, 40000, 35000, 50000, 49000, 60000, 75000]
    }],
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: true },
      foreColor: colors.texto,
      background: colors.fundo
    },
    colors: ['#16A34A'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      strokeDashArray: 4,
      borderColor: colors.borda
    },
    xaxis: {
      categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
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
    }
  };
}

// Opções do Gráfico de Barras
function getChartBarrasOptions() {
  const colors = getThemeColors();
  return {
    series: [
      {
        name: 'Faturamento',
        data: [245000, 280000, 320000]
      },
      {
        name: 'Despesas',
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
      categories: ['Agosto', 'Setembro', 'Outubro'],
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

// Instâncias dos gráficos
const chartsInstances = {};

// Renderizar gráficos
function renderizarGraficos() {
  // Destruir instâncias anteriores
  if (chartsInstances.linha) chartsInstances.linha.destroy();
  if (chartsInstances.barras) chartsInstances.barras.destroy();

  if (document.getElementById('graficoLinhaFaturamento')) {
    chartsInstances.linha = new ApexCharts(
      document.getElementById('graficoLinhaFaturamento'),
      getChartLinhaOptions()
    ).render();
  }

  if (document.getElementById('graficoBarrasComparativo')) {
    chartsInstances.barras = new ApexCharts(
      document.getElementById('graficoBarrasComparativo'),
      getChartBarrasOptions()
    ).render();
  }
}

// Renderizar no carregamento
document.addEventListener('DOMContentLoaded', renderizarGraficos);

// Atualizar gráficos ao mudar período
document.getElementById('periodo')?.addEventListener('change', function() {
  console.log('Período selecionado:', this.value);
  // Aqui você pode adicionar lógica para buscar dados diferentes baseado no período
});

// Redenrizar gráficos ao trocar de tema
const originalAlternarTema = window.alternarTema;
window.alternarTema = function() {
  if (originalAlternarTema) {
    originalAlternarTema();
  }
  // Aguardar um pouco para o DOM atualizar
  setTimeout(renderizarGraficos, 100);
};