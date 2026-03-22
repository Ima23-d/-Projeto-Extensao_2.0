from flask import Flask, render_template, session, redirect, url_for
from functools import wraps
from functions import tela_cadastro, login
app = Flask(__name__)
app.secret_key = "kdachave"

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


# =================== RUN ===================
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
