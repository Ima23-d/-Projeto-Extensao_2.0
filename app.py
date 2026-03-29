from flask import Flask, render_template, session, redirect, url_for, request, jsonify
import pandas as pd
from functools import wraps
import os
from dotenv import load_dotenv
from datetime import datetime
#------------------ IMPORTAÇÕES BACKEND ------------------
from backend.user import tela_cadastro, login
from backend.dados import limpar_dados
from backend.db import salvar_dados

load_dotenv()

key = os.getenv('SECRET_KEY')

app = Flask(__name__)
app.secret_key = key

# =================== UPLOAD ===================
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =================== PROTEÇÃO ===================
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_nome' not in session:
            return redirect(url_for('pagina_login'))
        return f(*args, **kwargs)
    return decorated_function

# =================== LANDING ===================
@app.route("/")
def pagina_landing():
    return render_template("index.html")

# =================== LOGIN ===================
@app.route("/login")
def pagina_login():
    if 'usuario_nome' in session:
        return redirect(url_for('pagina_home'))
    return render_template("login.html")

# =================== SISTEMA ===================
@app.route("/home")
@login_required
def pagina_home():
    return render_template("home.html")

@app.route("/analises")
@login_required
def pagina_analise():
    return render_template("analises.html")

@app.route("/graficos-avancados")
@login_required
def pagina_graficoAvancado():
    return render_template("graficos-avancados.html")

@app.route("/config")
@login_required
def pagina_configuracoes():
    return render_template("configuracoes.html")

@app.route("/dados")
@login_required
def pagina_dados():
    return render_template("dados.html")

@app.route("/relatorios")
@login_required
def pagina_relatorio():
    return render_template("relatorios.html")

@app.route("/contato")
@login_required
def pagina_contato():
    return render_template("contato.html")

@app.route("/perfil")
@login_required
def pagina_perfil():
    return render_template("perfil.html")

# =================== AÇÕES ===================
@app.route("/cadastro", methods=["GET", "POST"])
def pg_cadastro():
    return tela_cadastro()

@app.route("/login", methods=["POST"])
def pg_login():
    return login()

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for('pagina_login'))

# =================== CARREGAR DADOS ===================
@app.route("/carregar-dados", methods=["GET"])
@login_required
def carregar_dados():
    """Carrega os últimos dados salvos do usuário"""
    from backend.db import dados_colecao
    
    usuario_id = session.get('usuario_id')
    
    try:
        # Buscar o documento mais recente do usuário
        documento = dados_colecao.find_one(
            {"usuario_id": usuario_id},
            sort=[("criado_em", -1)]
        )
        
        if documento:
            return jsonify({
                "colunas": documento.get("colunas", []),
                "dados": documento.get("dados", [])
            }), 200
        else:
            return jsonify({
                "colunas": [],
                "dados": []
            }), 200
    except Exception as e:
        print(f"Erro ao carregar dados: {e}")
        return jsonify({
            "colunas": [],
            "dados": []
        }), 200

# =================== SALVAR DADOS MANUAIS ===================
@app.route("/salvar-dados", methods=["POST"])
@login_required
def salvar_dados_manuais():
    dados_json = request.get_json()
    
    if not dados_json or "colunas" not in dados_json or "dados" not in dados_json:
        return jsonify({"mensagem": "Dados inválidos"}), 400
    
    colunas = dados_json.get("colunas", [])
    dados = dados_json.get("dados", [])
    nome_planilha = dados_json.get("nome_planilha", f"Planilha_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    
    usuario_id = session.get('usuario_id')
    
    try:
        id_salvo = salvar_dados(usuario_id, nome_planilha, colunas, dados)
        return jsonify({
            "mensagem": "Dados salvos com sucesso!",
            "id": str(id_salvo)
        }), 200
    except Exception as e:
        print(f"Erro ao salvar dados: {e}")
        return jsonify({"mensagem": "Erro ao salvar dados"}), 500

# =================== LIMPAR DADOS ===================
@app.route("/limpar-dados", methods=["DELETE"])
@login_required
def limpar_dados_usuario():
    """Deleta os últimos dados salvos do usuário"""
    from backend.db import dados_colecao
    
    usuario_id = session.get('usuario_id')
    
    try:
        # Deletar o documento mais recente do usuário
        resultado = dados_colecao.delete_many({"usuario_id": usuario_id})
        
        return jsonify({
            "mensagem": "Dados deletados com sucesso!",
            "documentos_deletados": resultado.deleted_count
        }), 200
    except Exception as e:
        print(f"Erro ao limpar dados: {e}")
        return jsonify({"mensagem": "Erro ao limpar dados"}), 500

# =================== UPLOAD ARQUIVO ===================
@app.route("/upload", methods=["POST"])
@login_required
def upload_arquivo():
    if "file" not in request.files:
        return jsonify({"mensagem": "Nenhum arquivo enviado"}), 400

    arquivo = request.files["file"]

    if arquivo.filename == "":
        return jsonify({"mensagem": "Arquivo inválido"}), 400

    caminho = os.path.join(UPLOAD_FOLDER, arquivo.filename)
    arquivo.save(caminho)

    # Ler o arquivo e limpar os dados
    try:
        if arquivo.filename.endswith(".csv"):
            df = pd.read_csv(caminho)
        elif arquivo.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(caminho)
        else:
            return jsonify({"mensagem": "Formato de arquivo não suportado"}), 400

        # Aplicar limpeza dos dados
        df = limpar_dados(df)

        # Converter para dicionário e retornar
        colunas = df.columns.tolist()
        dados = df.to_dict('records')

        # Salvar no banco de dados
        usuario_id = session.get('usuario_id')
        nome_planilha = arquivo.filename
        
        try:
            salvar_dados(usuario_id, nome_planilha, colunas, dados)
            print(f"✓ Arquivo '{arquivo.filename}' processado com sucesso - {len(dados)} linhas")
        except Exception as e:
            print(f"⚠ Aviso ao salvar no BD: {e}")

        return jsonify({
            "mensagem": "Arquivo enviado com sucesso!",
            "colunas": colunas,
            "dados": dados
        }), 200
    
    except Exception as e:
        print(f"✗ Erro ao processar arquivo: {e}")
        return jsonify({
            "mensagem": f"Erro ao processar arquivo: {str(e)}"
        }), 400

# =================== RUN ===================
if __name__ == "__main__":
    app.run(debug=True)