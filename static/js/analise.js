

let chartInstance = null;

// =============================
// TEMA
// =============================
function isDarkMode() {
    return document.body.classList.contains('tema-escuro');
}

function getThemeColors() {
    const isDark = isDarkMode();
    return {
        faturamento: isDark ? '#60a5fa' : '#3b82f6',
        despesas: isDark ? '#ef5350' : '#dc2626',
        lucro: isDark ? '#4ade80' : '#16a34a',
        margem: isDark ? '#fbbf24' : '#d97706'
    };
}

// =============================
// GRÁFICO
// =============================
function selecionarMetrica(elemento) {
    const checkbox = elemento.querySelector('.metrica-checkbox');
    checkbox.checked = !checkbox.checked;

    elemento.style.borderLeft = checkbox.checked ? '4px solid var(--primaria)' : 'none';
    elemento.style.background = checkbox.checked ? 'rgba(59,130,246,0.05)' : 'transparent';

    atualizarGrafico();
}

function atualizarGrafico() {
    const series = [];

    if (document.getElementById('check-faturamento')?.checked)
        series.push({ name: 'Faturamento', data: dadosMetricas?.faturamento || [] });

    if (document.getElementById('check-despesas')?.checked)
        series.push({ name: 'Despesas', data: dadosMetricas?.despesas || [] });

    if (document.getElementById('check-lucro')?.checked)
        series.push({ name: 'Lucro', data: dadosMetricas?.lucro || [] });

    if (document.getElementById('check-margem')?.checked)
        series.push({ name: 'Margem (%)', data: dadosMetricas?.margem || [] });

    const container = document.getElementById('grafico-metricas');

    if (!container) return;

    if (series.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:80px;color:#999">
            Selecione uma métrica
        </div>`;
        return;
    }

    if (chartInstance) chartInstance.destroy();
    container.innerHTML = '';

    chartInstance = new ApexCharts(container, {
        chart: { type: 'line', height: 400 },
        series,
        xaxis: { categories: dadosMetricas?.meses || [] },
        colors: [
            getThemeColors().faturamento,
            getThemeColors().despesas,
            getThemeColors().lucro,
            getThemeColors().margem
        ]
    });

    chartInstance.render();
}

// =============================
// FILTROS
// =============================
function aplicarFiltros() {
    const inicio = document.getElementById('data-inicio').value;
    const fim = document.getElementById('data-fim').value;

    if (!inicio || !fim) {
        alert('Selecione as datas!');
        return;
    }

    if (inicio > fim) {
        alert('Data inválida!');
        return;
    }

    localStorage.setItem('analise_periodo', JSON.stringify({ inicio, fim }));

    fetch(`/api/analise?data_inicio=${inicio}&data_fim=${fim}`)
        .then(r => {
            if (!r.ok) {
                return r.json().then(err => {
                    throw new Error(err.mensagem || 'Erro na API');
                });
            }
            return r.json();
        })
        .then(data => {
            console.log("API:", data);
            preencherCards(data);
            preencherTabela(data);
        })
        .catch(err => {
            console.error(err);
            alert(err.message);
        });
}

// =============================
// AUTO LOAD
// =============================
function carregarUltimoPeriodo() {
    fetch('/api/ultimo-periodo')
        .then(r => r.json())
        .then(data => {
            if (data.inicio && data.fim) {
                setPeriodoEAplicar(data.inicio, data.fim);
            } else {
                carregarLocalStorage();
            }
        })
        .catch(() => carregarLocalStorage());
}

function carregarLocalStorage() {
    const salvo = localStorage.getItem('analise_periodo');
    if (!salvo) return;

    const { inicio, fim } = JSON.parse(salvo);
    setPeriodoEAplicar(inicio, fim);
}

function setPeriodoEAplicar(inicio, fim) {
    document.getElementById('data-inicio').value = inicio;
    document.getElementById('data-fim').value = fim;
    aplicarFiltros();
}

// =============================
// UI
// =============================
function preencherCards(data) {

    // ======================
    // FATURAMENTO
    // ======================
    document.getElementById('fat-valor').textContent =
        formatarMoeda(data.faturamento.valor);

    const fatVar = document.getElementById('fat-variacao');
    fatVar.textContent = formatarVariacao(data.faturamento.variacao);
    fatVar.style.color =
        data.faturamento.variacao >= 0 ? '#16a34a' : '#dc2626';


    // ======================
    // DESPESAS
    // ======================
    document.getElementById('desp-valor').textContent =
        formatarMoeda(data.despesa.valor);

    const despVar = document.getElementById('desp-variacao');
    despVar.textContent = formatarVariacao(data.despesa.variacao);
    despVar.style.color =
        data.despesa.variacao <= 0 ? '#16a34a' : '#dc2626';


    // ======================
    // LUCRO
    // ======================
    document.getElementById('luc-valor').textContent =
        formatarMoeda(data.lucro.valor);

    const lucVar = document.getElementById('luc-variacao');
    lucVar.textContent = formatarVariacao(data.lucro.variacao);
    lucVar.style.color =
        data.lucro.variacao >= 0 ? '#16a34a' : '#dc2626';


    // ======================
    // MARGEM
    // ======================
    document.getElementById('mg-valor').textContent =
        data.margem.valor.toFixed(1) + '%';

    const mgVar = document.getElementById('mg-variacao');
    mgVar.textContent =
        (data.margem.variacao >= 0 ? '↑ ' : '↓ ') +
        Math.abs(data.margem.variacao).toFixed(1) + ' pp';

    mgVar.style.color =
        data.margem.variacao >= 0 ? '#16a34a' : '#dc2626';
}

function preencherTabela(data) {

    document.getElementById('label-periodo-atual').textContent =
        formatarData(data.periodo.inicio) + ' a ' + formatarData(data.periodo.fim);

    document.getElementById('label-periodo-anterior').textContent =
        formatarData(data.periodo.inicio_anterior) + ' a ' + formatarData(data.periodo.fim_anterior);

    // FATURAMENTO
    setLinha('fat', data.faturamento, true);

    // DESPESAS
    setLinha('desp', data.despesa, false);

    // LUCRO
    setLinha('luc', data.lucro, true);

    // MARGEM
    document.getElementById('tab-mg-atual').textContent = data.margem.valor.toFixed(1) + '%';
    document.getElementById('tab-mg-anterior').textContent = data.margem.valor_anterior.toFixed(1) + '%';

    const variacao = data.margem.variacao;
    const el = document.getElementById('tab-mg-variacao');

    el.textContent = (variacao >= 0 ? '↑ ' : '↓ ') + Math.abs(variacao).toFixed(1) + ' pp';
    el.style.color = variacao >= 0 ? '#16a34a' : '#dc2626';
}

// helper para linhas
function setLinha(prefixo, dados, positivoBom) {
    document.getElementById(`tab-${prefixo}-atual`).textContent = formatarMoeda(dados.valor);
    document.getElementById(`tab-${prefixo}-anterior`).textContent = formatarMoeda(dados.valor_anterior);

    const el = document.getElementById(`tab-${prefixo}-variacao`);
    el.textContent = formatarVariacao(dados.variacao);

    const positivo = dados.variacao >= 0;
    el.style.color = (positivo === positivoBom) ? '#16a34a' : '#dc2626';
}

// =============================
// FORMATADORES
// =============================
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
}

function formatarVariacao(v) {
    const sinal = v >= 0 ? '↑ ' : '↓ ';
    return sinal + Math.abs(v).toFixed(1) + '%';
}

function formatarData(dataStr) {
    if (!dataStr) return '--';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

// =============================
// LIMPAR
// =============================
function limparFiltros() {
    // limpa inputs
    document.getElementById('data-inicio').value = '';
    document.getElementById('data-fim').value = '';

    // limpa localStorage
    localStorage.removeItem('analise_periodo');

    // limpa gráfico
    const grafico = document.getElementById('grafico-metricas');
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    if (grafico) {
        grafico.innerHTML = 'Selecione um período';
    }

    // limpa CARDS
    document.getElementById('fat-valor').textContent = '--';
    document.getElementById('desp-valor').textContent = '--';
    document.getElementById('luc-valor').textContent = '--';
    document.getElementById('mg-valor').textContent = '--';

    // limpa TABELA
    const ids = [
        'tab-fat-atual','tab-fat-anterior','tab-fat-variacao',
        'tab-desp-atual','tab-desp-anterior','tab-desp-variacao',
        'tab-luc-atual','tab-luc-anterior','tab-luc-variacao',
        'tab-mg-atual','tab-mg-anterior','tab-mg-variacao'
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '--';
    });

    // limpa labels
    document.getElementById('label-periodo-atual').textContent = 'Período selecionado';
    document.getElementById('label-periodo-anterior').textContent = 'Período anterior';
}

// =============================
// INIT
// =============================
function iniciarAnalise() {

    if (typeof ApexCharts === 'undefined') {
        setTimeout(iniciarAnalise, 500);
        return;
    }

    if (!document.getElementById('grafico-metricas')) {
        setTimeout(iniciarAnalise, 500);
        return;
    }

    console.log('Sistema pronto');

    carregarUltimoPeriodo();
    atualizarGrafico();
}

document.addEventListener('DOMContentLoaded', iniciarAnalise);

// =============================
// TEMA
// =============================
const originalAlternarTema = window.alternarTema;

window.alternarTema = function () {
    if (originalAlternarTema) originalAlternarTema();
    setTimeout(atualizarGrafico, 100);
};
