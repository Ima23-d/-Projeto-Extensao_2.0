from flask import Flask ,render_template, session, redirect
from functions import tela_cadastro, login

app = Flask(__name__)
app.secret_key = "kdachave"

#################### PÁGINAS DA WEB ###############################
@app.route("/")
def pagina_index():
    return render_template("index.html")


@app.route("/home")
def pagina_home():
   return render_template("home.html")


@app.route("/analises")
def pagina_analise():
    return render_template("analises.html")


@app.route("/graficos")
def pagina_grafico():
    return render_template("graficos.html")


@app.route("/config")
def pagina_configuracoes():
    return render_template("configuracoes.html")


@app.route("/dados")
def pagina_dados():
    return render_template("dados.html")


@app.route("/relatorios")
def pagina_relatorio():
    return render_template("relatorios.html")


@app.route("/contato")
def pagina_cotato():
    return render_template("contato.html")


@app.route("/perfil")
def pagina_perfil():
    return render_template("perfil.html")


@app.route("/graficoavancado")
def pagina_graficoAvancado():
    return render_template("graficos_avancados.html")


######################## FUNÇÕES DAS PÁGINAS ################################

@app.route("/cadastro", methods=["GET","POST"])
def pg_cadastro():
    return tela_cadastro()
    
@app.route("/login", methods=["POST"])
def pg_login():
    return login()


if __name__ == "__main__":
    app.run(debug=True)