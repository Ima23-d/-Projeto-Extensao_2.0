// =============================
//     Tema e persistência
// =============================

const setTema = () => {
  const temaSalvo = localStorage.getItem("tema")
  if (temaSalvo === "escuro") {
    document.body.classList.add("tema-escuro")
  } else {
    document.body.classList.remove("tema-escuro")
  }
}

const alternarTema = () => {
  const ativo = document.body.classList.toggle("tema-escuro")
  localStorage.setItem("tema", ativo ? "escuro" : "claro")
}

function initChart(canvasId, config, containerSelector, caption) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return null
  if (typeof Chart === "undefined") return null

  const chart = new Chart(canvas, config)
  return chart
}

function initChartSelection() {
  const checkboxes = document.querySelectorAll("[data-chart-toggle]")
  if (!checkboxes.length) return

  checkboxes.forEach((checkbox) => {
    const target = checkbox.getAttribute("data-chart-toggle")
    const card = document.querySelector(target)
    if (!card) return

    const sync = () => {
      card.style.display = checkbox.checked ? "block" : "none"
      localStorage.setItem("chartVisible" + target, checkbox.checked ? "true" : "false")
    }

    const saved = localStorage.getItem("chartVisible" + target)
    if (saved !== null) {
      checkbox.checked = saved === "true"
    }

    sync()
    checkbox.addEventListener("change", sync)
  })
}

const ACCESSIBILITY_KEY = "acessibilidadeAtiva"

const isAcessibilidadeAtiva = () => localStorage.getItem(ACCESSIBILITY_KEY) !== "false"

function setAcessibilidadeAtiva(active) {
  localStorage.setItem(ACCESSIBILITY_KEY, active ? "true" : "false")
  document.body.classList.toggle("acessibilidade-ativada", active)

  const painel = document.querySelector(".acessibilidade-flutuante")
  const vlibras = document.querySelector("#Vlibras")

  if (painel) painel.style.display = active ? "block" : "none"
  if (vlibras) vlibras.style.display = active ? "block" : "none"
}

function initChatbot() {
  if (document.querySelector(".chatbot-flutuante")) return

  const button = document.createElement("button")
  button.className = "chatbot-flutuante"
  button.title = "Abrir assistente"
  button.innerHTML = "<i class='fa-solid fa-robot'></i>"
  button.type = "button"

  const modal = document.createElement("div")
  modal.className = "chatbot-modal"
  modal.setAttribute("role", "dialog")
  modal.setAttribute("aria-modal", "true")
  modal.innerHTML = `
      <div class="chatbot-modal__header">
      <div class="chatbot-modal__title">
        Assistente</div>
      <button type="button" class="chatbot-modal__close" aria-label="Fechar">&times;</button>
    </div>
    <div class="chatbot-modal__body">
      <div class="chatbot-conversation" aria-live="polite"></div>
      <div class="chatbot-input">
        <input type="text" placeholder="Pergunte algo..." aria-label="Digite sua pergunta" />
        <button type="button">Enviar</button>
      </div>
    </div>
  `

  document.body.appendChild(button)
  document.body.appendChild(modal)

  const conversation = modal.querySelector(".chatbot-conversation")
  const closeBtn = modal.querySelector(".chatbot-modal__close")
  const input = modal.querySelector(".chatbot-input input")
  const send = modal.querySelector(".chatbot-input button")

  const appendMessage = (text, from) => {
    const bubble = document.createElement("div")
    bubble.className = `chatbot-bubble ${from}`
    bubble.textContent = text
    conversation.appendChild(bubble)
    conversation.scrollTop = conversation.scrollHeight
  }

  const botReply = (message) => {
    const msg = message.toLowerCase().trim()
    if (msg.includes("acessibilidade")) {
      return "Ative ou desative a acessibilidade na página de configurações."
    }
    return "Ainda estou aprendendo. Pergunte sobre análise de dados ou acessibilidade."
  }

  const sendMessage = () => {
    const text = input.value.trim()
    if (!text) return
    appendMessage(text, "user")
    input.value = ""

    setTimeout(() => {
      const resposta = botReply(text)
      appendMessage(resposta, "bot")
    }, 300)
  }

  button.addEventListener("click", () => {
    const ativo = modal.classList.toggle("open")
    if (ativo) input.focus()
  })

  closeBtn.addEventListener("click", () => modal.classList.remove("open"))
  send.addEventListener("click", sendMessage)
  input.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") sendMessage()
  })

  // Garantir que o estado de acessibilidade definido seja aplicado ao chatbot recém-criado
  setAcessibilidadeAtiva(isAcessibilidadeAtiva())
}

// =============================
//     Inicialização da página
// =============================
window.addEventListener("load", () => {
  setTema()
  initChatbot()
  initChartSelection()

  // Função genérica para criar gráficos ApexCharts
  function initApexChart(containerSelector, options) {
    const chartContainer = document.querySelector(containerSelector)
    if (!chartContainer) return

    // garante altura padrão
    options.chart = {
      height: 280,
      ...options.chart
    }

    const chart = new ApexCharts(chartContainer, options)
    chart.render()

    // força ajuste de tamanho após renderizar
    setTimeout(() => {
      chart.updateOptions({})
      window.dispatchEvent(new Event("resize"))
    }, 200)
  }

  // Gráfico de barras + linha (tendência)
  initApexChart("#grafico-container", {
    chart: { type: "line" },
    series: [
      { name: "Volume", type: "column", data: [8, 10, 14, 12, 16, 15] },
      { name: "Tendência", type: "line", data: [8, 9, 11, 11, 14, 15] }
    ],
    xaxis: { categories: ["Set", "Out", "Nov", "Dez", "Jan", "Fev"] },
    stroke: { width: [0, 4], curve: "smooth" },
    plotOptions: { bar: { columnWidth: "50%" } },
    colors: ["#3B82F6", "#EF4444"],
    legend: { position: "bottom" },
    tooltip: { shared: true, intersect: false }
  })

  // Gráfico Resumo Estatístico
  initApexChart("#graficoResumo-container", {
    chart: { type: "bar" },
    series: [{ name: "Medidas Estatísticas", data: [12.5, 10, 8, 3.2] }],
    xaxis: { categories: ["Média", "Mediana", "Moda", "Desvio Padrão"] },
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
    dataLabels: { enabled: true }
  })

  // Gráfico de Barras Simples
  initApexChart("#chart-bar-container", {
    chart: { type: "bar" },
    series: [{ name: "Receita", data: [12, 19, 8, 14, 17, 22] }],
    xaxis: { categories: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"] },
    colors: ["#3B82F6"],
    dataLabels: { enabled: true }
  })

  // Gráfico de Linha
  initApexChart("#chart-line-container", {
    chart: { type: "line" },
    series: [{ name: "Tendência", data: [5, 15, 12, 20, 18, 24] }],
    xaxis: { categories: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"] },
    stroke: { curve: "smooth" },
    colors: ["#10B981"],
    markers: { size: 5 }
  })

  // Gráfico de Pizza / Donut
  initApexChart("#chart-pie-container", {
    chart: { type: "donut" },
    series: [45, 25, 30],
    labels: ["Produto A", "Produto B", "Produto C"],
    colors: ["#3B82F6", "#F59E0B", "#EF4444"],
    legend: { position: "bottom" }
  })

  // Gráfico Radar
  initApexChart("#chart-radar-container", {
    chart: { type: "radar" },
    series: [{ name: "Avaliação", data: [80, 60, 70, 90, 75] }],
    labels: ["Qualidade", "Velocidade", "Custo", "Satisfação", "Confiabilidade"],
    colors: ["#3B82F6"],
    fill: { opacity: 0.3 },
    stroke: { width: 2 }
  })

  initDadosPage()
  initPerfilPage()
})

function initPerfilPage() {
  const nomeUsuario = localStorage.getItem("usuarioNome") || "Usuário Profissional"
  const nomeEl = document.getElementById("nomeUsuario")
  if (nomeEl) nomeEl.textContent = nomeUsuario

  const botaoTrocar = document.getElementById("botaoTrocarConta")
  if (botaoTrocar) {
    botaoTrocar.addEventListener("click", () => {
      // Exemplo: redirecionar para login ou página de seleção de conta
      window.location.href = "index.html"
    })
  }

  const botaoEditar = document.getElementById("botaoEditarPerfil")
  if (botaoEditar) {
    botaoEditar.addEventListener("click", () => {
      window.alert("Funcionalidade de edição de perfil ainda não implementada.")
    })
  }
}

// =============================
// Dados (importar / salvar / visualizar)
// =============================

const DADOS_STORAGE_KEY = "dadosBrutos"

function parseCsv(text) {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(/\s*,\s*/))
  return rows
}

function csvFromRows(rows) {
  return rows.map((r) => r.join(", ")).join("\n")
}

function renderDadosTabela(rows) {
  const tbody = document.querySelector(".tabela-envoltoria tbody")
  if (!tbody) return

  tbody.innerHTML = ""
  rows.forEach((row, index) => {
    const tr = document.createElement("tr")
    const numero = document.createElement("td")
    numero.textContent = String(index + 1)
    tr.appendChild(numero)

    const valor = document.createElement("td")
    valor.textContent = row[0] ?? ""
    tr.appendChild(valor)

    const etiqueta = document.createElement("td")
    etiqueta.textContent = row[1] ?? ""
    tr.appendChild(etiqueta)

    const acoes = document.createElement("td")
    const editar = document.createElement("a")
    editar.href = "#"
    editar.textContent = "Editar"
    editar.setAttribute("aria-label", `Editar linha ${index + 1}`)
    editar.addEventListener("click", (event) => {
      event.preventDefault()
      alert("Edição ainda não implementada. Use o campo de dados para editar manualmente.")
    })
    acoes.appendChild(editar)
    tr.appendChild(acoes)

    tbody.appendChild(tr)
  })
}

function loadDadosFromStorage() {
  const saved = localStorage.getItem(DADOS_STORAGE_KEY)
  if (!saved) return null
  return saved
}

function saveDadosToStorage(text) {
  localStorage.setItem(DADOS_STORAGE_KEY, text)
}

function initDadosPage() {
  const textarea = document.getElementById("dados-brutos")
  if (!textarea) return

  const fileInput = document.getElementById("dadosArquivo")
  const btnImportarArquivo = document.getElementById("btnImportarArquivo")
  const btnImportarUrl = document.getElementById("btnImportarUrl")
  const btnLimparDados = document.getElementById("btnLimparDados")
  const btnSalvarDados = document.getElementById("btnSalvarDados")

  const updateTabela = () => {
    const rows = parseCsv(textarea.value)
    renderDadosTabela(rows)
  }

  const loadFromStorage = () => {
    const stored = loadDadosFromStorage()
    if (stored) {
      textarea.value = stored
      updateTabela()
    }
  }

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result || ""
      textarea.value = text
      updateTabela()
    }
    reader.readAsText(file)
  }

  if (btnImportarArquivo && fileInput) {
    btnImportarArquivo.addEventListener("click", () => fileInput.click())
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0]
      if (file) handleFile(file)
    })
  }

  if (btnImportarUrl) {
    btnImportarUrl.addEventListener("click", async () => {
      const url = prompt("Cole a URL (CSV/JSON) para importar dados:")
      if (!url) return
      try {
        const res = await fetch(url)
        const text = await res.text()

        try {
          const json = JSON.parse(text)
          if (Array.isArray(json)) {
            const csvText = json
              .map((item) => {
                if (typeof item === "object" && item !== null) {
                  return Object.values(item).join(", ")
                }
                return String(item)
              })
              .join("\n")
            textarea.value = csvText
          } else {
            textarea.value = text
          }
        } catch {
          textarea.value = text
        }

        updateTabela()
      } catch (err) {
        alert("Falha ao importar: " + err.message)
      }
    })
  }

  if (btnLimparDados) {
    btnLimparDados.addEventListener("click", () => {
      textarea.value = ""
      renderDadosTabela([])
      localStorage.removeItem(DADOS_STORAGE_KEY)
    })
  }

  if (btnSalvarDados) {
    btnSalvarDados.addEventListener("click", () => {
      saveDadosToStorage(textarea.value)
      alert("Dados salvos localmente. Você pode carregá-los novamente ao voltar à página.")
    })
  }

  textarea.addEventListener("input", updateTabela)
  loadFromStorage()
}

