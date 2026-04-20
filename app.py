from flask import Flask, render_template, session, redirect, url_for, request
from functools import wraps
import os
from dotenv import load_dotenv
#------------------ IMPORTAÇÕES BACKEND ------------------
# Importação user
from backend.user import tela_cadastro, login
# Importação dados
from backend.dados.carregar_dados import carregar_dados
from backend.dados.salvar_dados import salvar_dados_manuais
from backend.dados.apagar_dados import apagar_dados_usuario
from backend.dados.upload_arquivo import upload_arquivo
# Importação relatorio
from backend.relatorio.gerar_relatorio import gerar_relatorio
from backend.relatorio.pagina_relatorio import pagina_relatorio_pdf as pagina_relatorio_pdf_backend
# Importação perfil
from backend.perfil.pagina_de_perfil import pagina_perfil as pagina_perfil_backend
from backend.perfil.vizualizar_relatorio import vizualizar_relatorio
# Importação home
from backend.home.home import calcular_desempenho, obter_dados_graficos
load_dotenv()

key = os.getenv('SECRET_KEY')

app = Flask(__name__)
app.secret_key = key

# =================== UPLOAD ===================
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

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

# =================== ROTAS ===================
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

@app.route("/termos/termos_de_uso")
def pagina_termos_uso():
    return render_template("termos/termos_de_uso.html")

# =================== AÇÕES Cadastro ===================
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
def carregar_dados_usuario():
    """Carrega os últimos dados salvos do usuário"""
    return carregar_dados()

# =================== SALVAR DADOS MANUAIS ===================
@app.route("/salvar-dados", methods=["POST"])
@login_required
def salvar_dados_usuario():
    """Salva os dados enviados pelo usuário"""
    return salvar_dados_manuais()

# =================== APAGAR DADOS ===================
@app.route("/apagar-dados", methods=["DELETE"])
@login_required
def apagar_dados():
    """Deleta os últimos dados salvos do usuário"""
    return apagar_dados_usuario()

# =================== UPLOAD ARQUIVO ===================
@app.route("/upload", methods=["POST"])
@login_required
def upload():
    """Faz upload do arquivo e salva os dados no banco de dados"""
    return upload_arquivo()

# =================== Relatorio ===================
@app.route('/gerar-relatorio', methods=['POST'])
@login_required
def gerar_relatorio_endpoint():
    return gerar_relatorio()


@app.route('/relatorio_pdf')
@login_required
def pagina_relatorio_pdf():
    return pagina_relatorio_pdf_backend()

# =================== Perfil ===================
@app.route("/perfil")
@login_required
def pagina_perfil():
    return pagina_perfil_backend()

@app.route('/relatorio/visualizar/<int:index>' )
@login_required
def visualizar_relatorio(index):
    return vizualizar_relatorio(index)

# =================== Desempenho ===================
@app.route('/api/desempenho', methods=['GET'])
@login_required
def api_desempenho():
    """Retorna os indicadores de desempenho"""
    periodo = request.args.get('periodo', '30_dias')
    return calcular_desempenho(periodo)

@app.route('/api/graficos', methods=['GET'])
@login_required
def api_graficos():
    """Retorna dados para os gráficos"""
    periodo = request.args.get('periodo', '30_dias')
    return obter_dados_graficos(periodo)

# ============ Verificar Senha =================
@app.route('/verificar_codigo', methods=['GET', 'POST'])
def verificar_codigo():
    if request.method == 'POST':
        codigo_digitado = request.form.get('codigo')
        
        codigo_correto = "123456" 
        
        if codigo_digitado == codigo_correto:
           
            return redirect(url_for('resetar_senha'))
        else:
            erro = "Código inválido ou expirado. Tente novamente."
            return render_template('verificar_codigo.html', erro=erro)

   
    return render_template('verificar_codigo.html')

@app.route('/reenviar-codigo')
def reenviar_codigo():
   
    flash("Um novo código foi enviado para seu e-mail!")
    return redirect(url_for('verificar_codigo'))
# =================== RUN ===================
if __name__ == "__main__":
    app.run(debug=True)
