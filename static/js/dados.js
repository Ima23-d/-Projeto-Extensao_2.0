// ===============================
// ELEMENTOS
// ===============================
const inputFile = document.getElementById("uploadArquivo");
const btnBuscar = document.getElementById("btnBuscarArquivo");
const btnLimpar = document.getElementById("btnLimparUpload");

const uploadStatus = document.getElementById("uploadStatus");
const uploadError = document.getElementById("uploadError");
const nomeArquivo = document.getElementById("nomeArquivo");
const mensagemErro = document.getElementById("mensagemErro");

const btnAddColuna = document.getElementById("btnAdicionarColuna");
const colunasContainer = document.getElementById("colunas-container");

const tabela = document.getElementById("tabelaDados");
const thead = tabela.querySelector("thead tr");
const tbody = document.getElementById("dados-tbody");

const btnAddLinha = document.getElementById("btnAdicionarLinha");
const btnSalvar = document.getElementById("btnSalvarDados");

// ===============================
// UPLOAD
// ===============================
btnBuscar.onclick = () => inputFile.click();

inputFile.onchange = () => {
    const file = inputFile.files[0];

    if (!file) return;

    const permitido = /\.(csv|xlsx|xls|txt)$/i;

    if (!permitido.test(file.name)) {
        uploadError.style.display = "block";
        uploadStatus.style.display = "none";
        mensagemErro.textContent = "Formato inválido!";
        return;
    }

    nomeArquivo.textContent = file.name;
    uploadStatus.style.display = "block";
    uploadError.style.display = "none";
};

btnLimpar.onclick = () => {
    inputFile.value = "";
    uploadStatus.style.display = "none";
    uploadError.style.display = "none";
};

// ===============================
// COLUNAS
// ===============================
btnAddColuna.onclick = () => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.gap = "8px";
    div.style.minWidth = "200px";
    div.style.maxWidth = "100%";

    div.innerHTML = `
    <input type="text" class="entrada entrada-coluna" placeholder="Nova coluna" style="flex:1; min-width: 0;">
    <button class="botao botao--delet botao-remover-coluna" type="button" style="flex-shrink: 0;">✕</button>
  `;

    colunasContainer.appendChild(div);

    atualizarTabela();
};

// remover coluna
colunasContainer.onclick = (e) => {
    if (e.target.classList.contains("botao-remover-coluna")) {
        e.target.parentElement.remove();
        atualizarTabela();
    }
};

// ===============================
// ATUALIZAR TABELA (colunas)
// ===============================
function atualizarTabela() {
    const colunas = document.querySelectorAll(".entrada-coluna");

    // limpar cabeçalho (mantendo # e Ação)
    thead.innerHTML = `<th>#</th>`;

    colunas.forEach(col => {
        thead.innerHTML += `<th>${col.value || "Coluna"}</th>`;
    });

    thead.innerHTML += `<th>Ação</th>`;

    // atualizar linhas
    const linhas = document.querySelectorAll(".linha-dados");

    linhas.forEach(linha => {
        const total = colunas.length;
        const atual = linha.querySelectorAll("td").length - 2;

        // adicionar células
        if (atual < total) {
            for (let i = 0; i < total - atual; i++) {
                const td = document.createElement("td");
                td.style.padding = "10px";
                td.style.border = "1px solid var(--borda)";
                td.innerHTML = `<input class="entrada-linha" style="width:100%; padding: 8px; border:none; background: transparent;">`;
                linha.insertBefore(td, linha.lastElementChild);
            }
        }

        // remover células
        if (atual > total) {
            for (let i = 0; i < atual - total; i++) {
                linha.removeChild(linha.children[linha.children.length - 2]);
            }
        }
    });
}

// ===============================
// LINHAS
// ===============================
btnAddLinha.onclick = () => {
    const colunas = document.querySelectorAll(".entrada-coluna");
    const tr = document.createElement("tr");
    tr.classList.add("linha-dados");

    let html = `<td style="padding: 10px; border: 1px solid var(--borda); background: rgba(229, 231, 235, 0.15); font-weight: 600; color: var(--suave);"></td>`;

    colunas.forEach(() => {
        html += `<td style="padding: 10px; border: 1px solid var(--borda);"><input class="entrada-linha" style="width:100%; padding: 8px; border:none; background: transparent;"></td>`;
    });

    html += `<td style="padding: 10px; border: 1px solid var(--borda); text-align: center; white-space: nowrap;"><button class="botao botao--delet" style="padding: 8px 10px; font-size: 12px; width: auto; min-width: 70px;">Deletar</button></td>`;

    tr.innerHTML = html;
    tbody.appendChild(tr);

    atualizarNumeros();
};

// deletar linha
tbody.onclick = (e) => {
    if (e.target.tagName === "BUTTON") {
        e.target.closest("tr").remove();
        atualizarNumeros();
    }
};

// ===============================
// NUMERAÇÃO
// ===============================
function atualizarNumeros() {
    const linhas = document.querySelectorAll(".linha-dados");

    linhas.forEach((linha, i) => {
        linha.children[0].textContent = i + 1;
    });
}

// ===============================
// SALVAR DADOS
// ===============================
btnSalvar.onclick = () => {
    const colunas = [...document.querySelectorAll(".entrada-coluna")].map(c => c.value);
    const linhas = document.querySelectorAll(".linha-dados");

    const dados = [];

    linhas.forEach(linha => {
        const inputs = linha.querySelectorAll(".entrada-linha");
        const obj = {};

        inputs.forEach((input, i) => {
            obj[colunas[i] || `coluna_${i}`] = input.value;
        });

        dados.push(obj);
    });

    console.log("Dados salvos:", dados);

    alert("Dados salvos com sucesso!");
};

// ===============================
// INICIALIZAÇÃO
// ===============================
atualizarNumeros();