// =============================
//     analise.js
// =============================
// Dados das métricas por mês (remover duplicação com script.js)
// Usar os dados definidos em script.js se estiverem disponíveis

let chartInstance = null;

// Detecção de modo escuro
function isDarkMode() {
    return document.body.classList.contains('tema-escuro');
}

// Função para obter cores do tema
function getThemeColors() {
    const isDark = isDarkMode();
    return {
        texto: isDark ? '#f0f0f0' : '#111827',
        suave: isDark ? '#cbd5e1' : '#6b7280',
        primaria: isDark ? '#ff6b6b' : '#3b82f6',
        borda: isDark ? '#334155' : '#e5e7eb',
        fundo: isDark ? '#000000' : '#f9fafb',
        faturamento: isDark ? '#60a5fa' : '#3b82f6',
        despesas: isDark ? '#ef5350' : '#dc2626',
        lucro: isDark ? '#4ade80' : '#16a34a',
        margem: isDark ? '#fbbf24' : '#d97706'
    };
}

// Função para selecionar/desselecionar métricas
function selecionarMetrica(elemento, metrica) {
    const checkbox = elemento.querySelector('.metrica-checkbox');
    checkbox.checked = !checkbox.checked;

    // Adiciona/remove classe visual
    if (checkbox.checked) {
        elemento.style.borderLeft = '4px solid var(--primaria)';
        elemento.style.background = 'rgba(59, 130, 246, 0.05)';
    } else {
        elemento.style.borderLeft = 'none';
        elemento.style.background = 'transparent';
    }

    atualizarGrafico();
}

// Função para atualizar o gráfico
function atualizarGrafico() {
    const series = [];

    if (document.getElementById('check-faturamento').checked) {
        series.push({
            name: 'Faturamento (R$)',
            data: dadosMetricas.faturamento
        });
    }
    if (document.getElementById('check-despesas').checked) {
        series.push({
            name: 'Despesas (R$)',
            data: dadosMetricas.despesas
        });
    }
    if (document.getElementById('check-lucro').checked) {
        series.push({
            name: 'Lucro (R$)',
            data: dadosMetricas.lucro
        });
    }
    if (document.getElementById('check-margem').checked) {
        series.push({
            name: 'Margem Líquida (%)',
            data: dadosMetricas.margem
        });
    }

    const container = document.getElementById('grafico-metricas');

    if (series.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 80px 40px; color: var(--suave);"><p style="font-size: 16px;">Selecione pelo menos uma métrica para visualizar o gráfico</p></div>';
        return;
    }

    const options = {
        chart: {
            type: 'line',
            height: 400,
            fontFamily: 'inherit',
            foreColor: getThemeColors().suave,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true
                }
            },
            animations: {
                enabled: true,
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 150
                }
            }
        },
        series: series,
        xaxis: {
            categories: dadosMetricas.meses,
            axisBorder: {
                color: getThemeColors().borda
            },
            labels: {
                style: {
                    colors: getThemeColors().suave
                }
            }
        },
        yaxis: {
            title: {
                text: 'Valores',
                style: {
                    color: getThemeColors().suave
                }
            },
            labels: {
                formatter: function (value) {
                    if (value >= 1000) {
                        return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                    }
                    return value.toFixed(1) + '%';
                },
                style: {
                    colors: getThemeColors().suave
                }
            }
        },
        stroke: {
            curve: 'smooth',
            width: [2, 2, 2, 3]
        },
        colors: [getThemeColors().faturamento, getThemeColors().despesas, getThemeColors().lucro, getThemeColors().margem],
        grid: {
            borderColor: getThemeColors().borda,
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        tooltip: {
            theme: isDarkMode() ? 'dark' : 'light',
            x: {
                show: true
            },
            y: {
                formatter: function (value) {
                    if (value >= 1000) {
                        return 'R$ ' + (value / 1000).toFixed(1) + 'k';
                    }
                    return value.toFixed(2) + '%';
                }
            }
        },
        legend: {
            position: 'top',
            labels: {
                colors: getThemeColors().suave
            }
        }
    };

    if (typeof ApexCharts !== 'undefined') {
        // Destruir gráfico anterior se existir
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Limpar o container
        container.innerHTML = '';

        // Criar novo gráfico
        chartInstance = new ApexCharts(container, options);
        chartInstance.render();
    } else {
        container.innerHTML = '<div style="text-align: center; padding: 80px 40px; color: var(--perigo);"><p>Erro ao carregar a biblioteca de gráficos</p></div>';
    }
}

// Funções auxiliares
function exportarDados() {
    alert('📥 Função de exportação: Será implementada em breve!');
}

function compartilharAnalise() {
    alert('🔗 Compartilhar análise: Será implementada em breve!');
}

// Funções auxiliares
function exportarDados() {
    alert('📥 Função de exportação: Será implementada em breve!');
}

function compartilharAnalise() {
    alert('🔗 Compartilhar análise: Será implementada em breve!');
}

// Inicializar quando a página carregar
function iniciarAnalise() {
    // Verificar se ApexCharts está carregado
    if (typeof ApexCharts === 'undefined') {
        console.log('ApexCharts ainda não foi carregado, aguardando...');
        setTimeout(iniciarAnalise, 500);
        return;
    }
    
    // Verificar se os elementos do DOM existem
    const container = document.getElementById('grafico-metricas');
    const checkLucro = document.getElementById('check-lucro');
    
    if (!container || !checkLucro) {
        console.log('Elementos do DOM não encontrados, aguardando...');
        setTimeout(iniciarAnalise, 500);
        return;
    }
    
    console.log('Análise inicializada com sucesso!');
    atualizarGrafico();
}

// Inicializar após DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarAnalise);
} else {
    setTimeout(iniciarAnalise, 500);
}

// Integração com alteração de tema
const originalAlternarTema = window.alternarTema;
window.alternarTema = function() {
    if (originalAlternarTema) {
        originalAlternarTema();
    }
    // Aguardar um pouco para a classe tema-escuro ser aplicada
    setTimeout(() => {
        atualizarGrafico();
    }, 100);
};