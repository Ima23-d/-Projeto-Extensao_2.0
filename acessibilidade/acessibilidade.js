// ============================
// Painel de acessibilidade
// ============================

const painel = document.getElementById("painelAcessibilidade")
const alternar = document.getElementById("alternarAcessibilidade")

alternar.addEventListener("click", () => {
  const aberto = painel.classList.toggle("aberto")
  alternar.setAttribute("aria-expanded", String(aberto))

})

// ============================
// Fonte (salva preferências)
// ============================

const raiz = document.documentElement

// Fonte (salva preferências)
const escalaSalva = localStorage.getItem("escalaFonte")
if (escalaSalva) raiz.style.setProperty("--escala-fonte", escalaSalva)

// Modo alto contraste (salva preferências)
const contrasteSalvo = localStorage.getItem("modoContraste")
if (contrasteSalvo === "alto") raiz.classList.add("alto-contraste")

const setContraste = (ativo) => {
  if (ativo) {
    raiz.classList.add("alto-contraste")
    localStorage.setItem("modoContraste", "alto")
  } else {
    raiz.classList.remove("alto-contraste")
    localStorage.setItem("modoContraste", "padrao")
  }
}

const aumentarFonte = () => {
  let escala = parseFloat(getComputedStyle(raiz).getPropertyValue("--escala-fonte")) || 1;
  escala = Math.min(1.35, +(escala + 0.05).toFixed(2))
  raiz.style.setProperty("--escala-fonte", escala)
  localStorage.setItem("escalaFonte", escala)
}

const diminuirFonte = () => {
  let escala = parseFloat(getComputedStyle(raiz).getPropertyValue("--escala-fonte")) || 1;
  escala = Math.max(0.9, +(escala - 0.05).toFixed(2))
  raiz.style.setProperty("--escala-fonte", escala)
  localStorage.setItem("escalaFonte", escala)
}

document.getElementById("botaoAumentar").addEventListener("click", aumentarFonte)

document.getElementById("botaoDiminuir").addEventListener("click", diminuirFonte)

const botaoContraste = document.getElementById("botaoContraste")
if (botaoContraste) {
  botaoContraste.addEventListener("click", () => {
    const alto = raiz.classList.toggle("alto-contraste")
    setContraste(alto)
  })
}

// ============================
// Função de leitura por voz
// ============================

function mostrarMensagem(mensagem) {
  // Mensagem simples para avisar o usuário quando necessário.
  // Alternativa: implementar um toast ou alert mais sofisticado.
  alert(mensagem)
}

function lerPagina() {
  if (!("speechSynthesis" in window)) {
    mostrarMensagem("Seu navegador não suporta leitura por voz (SpeechSynthesis).")
    return
  }

  speechSynthesis.cancel();

  const conteudo = document.getElementById("conteudo");
  const texto = conteudo ? conteudo.innerText : document.body.innerText

  const utterance = new SpeechSynthesisUtterance(texto)
  utterance.lang = "pt-BR"
  speechSynthesis.speak(utterance)
}

document.getElementById("botaoLer").addEventListener("click", lerPagina);

document.getElementById("botaoParar").addEventListener("click", () => {
  if ("speechSynthesis" in window) speechSynthesis.cancel()
})

// ============================
// Extra: ESC fecha painel
// ============================

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && painel.classList.contains("aberto")) {
    painel.classList.remove("aberto")
    alternar.setAttribute("aria-expanded", "false")
    alternar.focus();
  }
})

// ============================
// Acessibilidade geral (toggle)
// ============================

// Inicializar acessibilidade
document.addEventListener("DOMContentLoaded", () => {
  const toggleAcc = document.getElementById("toggleAcessibilidade")
  if (toggleAcc) {
    toggleAcc.checked = isAcessibilidadeAtiva()
    toggleAcc.addEventListener("change", (event) => {
      setAcessibilidadeAtiva(event.target.checked)
    })
  }
})

