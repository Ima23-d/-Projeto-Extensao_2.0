// ===============================
// ESTADO GLOBAL
// ===============================
const LINHAS_POR_PAGINA = 5;
const el = {
    upload: document.getElementById("uploadArquivo"),
    buscar: document.getElementById("btnBuscarArquivo"),
    limpar: document.getElementById("btnLimparUpload"),
    status: document.getElementById("uploadStatus"),
    erro: document.getElementById("uploadError"),
    arquivo: document.getElementById("nomeArquivo"),
    mensagem: document.getElementById("mensagemErro"),
    colunas: document.getElementById("colunas-container"),
    thead: document.querySelector("#tabelaDados thead tr"),
    tbody: document.getElementById("dados-tbody"),
    btnNovaColuna: document.getElementById("btnAdicionarColuna"),
    btnNovaLinha: document.getElementById("btnAdicionarLinha"),
    btnSalvar: document.getElementById("btnSalvarDados"),
    btnVoltar: document.getElementById("btnVoltar"),
    btnProximo: document.getElementById("btnProximo"),
    inicio: document.getElementById("inicio-pag"),
    fim: document.getElementById("fim-pag"),
    total: document.getElementById("total-pag")
};

let paginaAtual = 1;
let todasAsDados = [];
let colunasAtual = [];

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
const obterColunasValidas = () => [...document.querySelectorAll(".entrada-coluna")]
    .map(c => c.value.trim()).filter(c => c !== "");

const limparUI = () => {
    el.colunas.innerHTML = "";
    el.thead.innerHTML = "";
    el.tbody.innerHTML = "";
    el.status.style.display = "none";
    el.erro.style.display = "none";
    el.upload.value = "";
};



// ===============================
// UPLOAD E LIMPEZA
// ===============================
el.buscar.onclick = () => el.upload.click();

el.upload.onchange = () => {
    const file = el.upload.files[0];
    if (!file || !/\.(csv|xlsx|xls|txt)$/i.test(file.name)) {
        el.erro.style.display = "block";
        el.mensagem.textContent = "Formato inválido! Aceitos: .csv, .xlsx, .xls, .txt";
        return;
    }

    el.arquivo.textContent = file.name;
    mostrarMensagem("⏳ Processando arquivo...");
    el.erro.style.display = "none";

    const form = new FormData();
    form.append("file", file);

    fetch("/upload", { method: "POST", body: form })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
            if (!ok) {
                el.erro.style.display = "block";
                el.mensagem.textContent = data.mensagem || "Erro ao enviar arquivo!";
                mostrarMensagem("erro", "✗ Erro ao processar");
                return;
            }
            console.log(`✓ Upload: ${data.dados.length} linhas`);
            mostrarMensagem("sucesso", `✓ ${data.mensagem}`);
            preencherTabela(data.colunas, data.dados);
        })
        .catch(err => {
            console.error("Erro:", err);
            el.erro.style.display = "block";
            el.mensagem.textContent = "Erro ao enviar arquivo!";
            mostrarMensagem("erro", "✗ Erro ao conectar");
        });
};

el.limpar.onclick = () => {
    fetch("/apagar-dados", { method: "DELETE" })
        .then(res => res.json())
        .then(() => {
            console.log("Dados apagados");
            todasAsDados = [];
            colunasAtual = [];
            paginaAtual = 1;
            limparUI();
            atualizarPaginacao();
        })
        .catch(() => alert("Erro ao apagar dados!"));
};

// ===============================
// CARREGAR DADOS AO INICIAR
// ===============================
window.addEventListener('DOMContentLoaded', () => {
    fetch("/carregar-dados")
        .then(res => res.json())
        .then(data => data.colunas?.length > 0 && preencherTabela(data.colunas, data.dados))
        .catch(() => console.log("Nenhum dado anterior"));
});

// ===============================
// TABELA - PREENCHIMENTO E ATUALIZAÇÃO
// ===============================
function preencherTabela(colunas, dados) {
    colunasAtual = [...colunas];
    todasAsDados = dados.map(linha => {
        const novaLinha = {};
        colunas.forEach(col => novaLinha[col] = linha[col] ?? "");
        return novaLinha;
    });
    paginaAtual = 1;

    el.colunas.innerHTML = "";
    colunas.forEach(nome => {
        el.colunas.innerHTML += `
            <div style="display: flex; gap: 8px; min-width: 200px; max-width: 100%;">
                <input type="text" class="entrada entrada-coluna" value="${nome}" style="flex: 1; min-width: 0;">
                <button class="botao botao--delet botao-remover-coluna" type="button" style="padding: 10px 12px; flex-shrink: 0;" title="Remover">✕</button>
            </div>
        `;
    });

    atualizarTabela();
    exibirPagina();
    atualizarPaginacao();
}

function atualizarTabela() {
    const colunas = obterColunasValidas();
    el.thead.innerHTML = `<th style="padding: 12px; text-align: left; font-weight: 600; border: 1px solid var(--borda); min-width: 50px; color: var(--suave);">#</th>`;
    
    colunas.forEach(c => {
        el.thead.innerHTML += `<th style="padding: 12px; text-align: left; font-weight: 600; border: 1px solid var(--borda); color: var(--suave); min-width: 150px;">${c}</th>`;
    });
    
    el.thead.innerHTML += `<th style="padding: 12px; text-align: center; font-weight: 600; border: 1px solid var(--borda); color: var(--suave); min-width: 80px;">Ação</th>`;
}

function exibirPagina() {
    el.tbody.innerHTML = "";
    const colunas = obterColunasValidas();
    const inicio = (paginaAtual - 1) * LINHAS_POR_PAGINA;
    const dadosPagina = todasAsDados.slice(inicio, inicio + LINHAS_POR_PAGINA);

    dadosPagina.forEach((linha, i) => {
        let html = `<tr class="linha-dados"><td style="padding: 10px; border: 1px solid var(--borda); background: rgba(229, 231, 235, 0.15); font-weight: 600; color: var(--suave); min-width: 50px;">${inicio + i + 1}</td>`;
        
        colunas.forEach(c => {
            html += `<td style="padding: 10px; border: 1px solid var(--borda); min-width: 150px;"><input type="text" class="entrada-linha" value="${linha[c] ?? ""}" style="width: 100%; padding: 8px; border: none; background: transparent;"></td>`;
        });
        
        html += `<td style="padding: 10px; border: 1px solid var(--borda); text-align: center; white-space: nowrap; min-width: 80px;"><button class="botao botao--delet" type="button" style="padding: 8px 10px; font-size: 12px; width: auto; min-width: 70px;" title="Deletar">Deletar</button></td></tr>`;
        
        el.tbody.innerHTML += html;
    });
}

// ===============================
// COLUNAS E LINHAS
// ===============================
el.btnNovaColuna.onclick = () => {
    const colunaWrapper = document.createElement("div");
    colunaWrapper.style.display = "flex";
    colunaWrapper.style.gap = "8px";
    colunaWrapper.style.minWidth = "200px";
    colunaWrapper.style.maxWidth = "100%";

    const inputColuna = document.createElement("input");
    inputColuna.type = "text";
    inputColuna.className = "entrada entrada-coluna";
    inputColuna.placeholder = "Coluna";
    inputColuna.style.flex = "1";
    inputColuna.style.minWidth = "0";

    const btnRemover = document.createElement("button");
    btnRemover.type = "button";
    btnRemover.className = "botao botao--delet botao-remover-coluna";
    btnRemover.style.padding = "10px 12px";
    btnRemover.style.flexShrink = "0";
    btnRemover.title = "Remover";
    btnRemover.textContent = "✕";

    colunaWrapper.appendChild(inputColuna);
    colunaWrapper.appendChild(btnRemover);
    el.colunas.appendChild(colunaWrapper);

    inputColuna.addEventListener("input", () => { sincronizarColunas(); atualizarTabela(); exibirPagina(); });
    sincronizarColunas(); atualizarTabela(); exibirPagina();
};

el.btnNovaLinha.onclick = () => {
    const colunas = obterColunasValidas();
    if (!colunas.length) { alert("Adicione pelo menos uma coluna com nome!"); return; }
    const novaLinha = {};
    colunas.forEach(col => novaLinha[col] = "");
    todasAsDados.push(novaLinha);
    paginaAtual = Math.ceil(todasAsDados.length / LINHAS_POR_PAGINA);
    exibirPagina(); atualizarPaginacao();
};

el.colunas.addEventListener("click", (e) => {
    if (e.target.classList.contains("botao-remover-coluna")) {
        e.target.closest("div").remove();
        sincronizarColunas(); atualizarTabela(); exibirPagina();
    }
});

el.tbody.addEventListener("input", (e) => {
    if (e.target.classList.contains("entrada-linha")) {
        const tr = e.target.closest("tr");
        const colunas = obterColunasValidas();
        const inicio = (paginaAtual - 1) * LINHAS_POR_PAGINA;
        const indice = inicio + Array.from(el.tbody.querySelectorAll("tr")).indexOf(tr);
        const inputs = tr.querySelectorAll(".entrada-linha");
        colunas.forEach((col, i) => {
            if (todasAsDados[indice]) todasAsDados[indice][col] = inputs[i]?.value ?? "";
        });
    }
});

el.tbody.addEventListener("click", (e) => {
    if (e.target.textContent === "Deletar") {
        const tr = e.target.closest("tr");
        const inicio = (paginaAtual - 1) * LINHAS_POR_PAGINA;
        const indice = inicio + Array.from(el.tbody.querySelectorAll("tr")).indexOf(tr);
        todasAsDados.splice(indice, 1);
        paginaAtual = Math.max(1, Math.min(paginaAtual, Math.ceil(todasAsDados.length / LINHAS_POR_PAGINA)));
        exibirPagina(); atualizarPaginacao();
    }
});

const sincronizarColunas = () => {
    const novasColunas = obterColunasValidas();
    todasAsDados = todasAsDados.map(linha => {
        const novaLinha = {};
        novasColunas.forEach(col => novaLinha[col] = linha[col] ?? "");
        return novaLinha;
    });
    colunasAtual = [...novasColunas];
};

// ===============================
// PAGINAÇÃO E SALVAR
// ===============================
function atualizarPaginacao() {
    const total = todasAsDados.length;
    const totalPag = Math.ceil(total / LINHAS_POR_PAGINA);
    const inicio = total > 0 ? (paginaAtual - 1) * LINHAS_POR_PAGINA + 1 : 0;
    const fim = Math.min(paginaAtual * LINHAS_POR_PAGINA, total);
    
    el.inicio.textContent = inicio;
    el.fim.textContent = fim;
    el.total.textContent = total;
    el.btnVoltar.disabled = paginaAtual <= 1;
    el.btnProximo.disabled = paginaAtual >= totalPag;
}

el.btnVoltar.onclick = () => {
    if (paginaAtual > 1) { paginaAtual--; exibirPagina(); atualizarPaginacao(); }
};

el.btnProximo.onclick = () => {
    if (paginaAtual < Math.ceil(todasAsDados.length / LINHAS_POR_PAGINA)) { 
        paginaAtual++; exibirPagina(); atualizarPaginacao(); 
    }
};

el.btnSalvar.onclick = () => {
    const colunas = obterColunasValidas();
    if (!colunas.length || !todasAsDados.length) {
        alert(colunas.length ? "Adicione pelo menos uma linha!" : "Adicione pelo menos uma coluna!");
        return;
    }

    const dados = todasAsDados.map(linha => {
        const obj = {};
        colunas.forEach(col => obj[col] = linha[col] ?? "");
        return obj;
    });

    fetch("/salvar-dados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            colunas: colunas,
            dados: dados,
            nome_planilha: `Planilha_${new Date().toISOString().split('T')[0]}`
        })
    })
        .then(res => res.json().then(data => { 
            if (!res.ok) throw new Error();
            alert("✓ " + data.mensagem);
            limparUI(); todasAsDados = []; paginaAtual = 1; atualizarPaginacao();
        }))
        .catch(() => alert("✗ Erro ao salvar!"));
};