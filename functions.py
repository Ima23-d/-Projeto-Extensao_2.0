from flask import render_template, request, redirect, session, url_for
import bcrypt
from db import usuario
import re



def validar_email(email):
    """Valida o formato do email"""
    padrao = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(padrao, email) is not None


def validar_senha(senha):
    """Valida força da senha (mínimo 8 caracteres)"""
    if len(senha) < 8:
        return False, "A senha deve ter no mínimo 8 caracteres"
    return True, ""

def tela_cadastro():

    if request.method == "POST":

        nome = request.form.get("nome", "").strip()
        email = request.form.get("email", "").strip()
        senha = request.form.get("senha", "")
        confirmar = request.form.get("confirmar", "")

      
        if not nome or not email or not senha or not confirmar:
            return render_template("cadastro.html", error_cad=True, msg="Todos os campos são obrigatórios")

        if not validar_email(email):
            return render_template("cadastro.html", error_cad=True, msg="Email inválido")

        valido, msg = validar_senha(senha)
        if not valido:
            return render_template("cadastro.html", error_cad=True, msg=msg)

        if senha != confirmar:
            return render_template("cadastro.html", error_cad=True, msg="As senhas não coincidem")

        email_encontrado = usuario.find_one({"email": email})
        if email_encontrado:
            return render_template("cadastro.html", error_cad=True, msg="Este email já está registrado")

        senha_bytes = senha.encode("utf-8")
        senha_hash = bcrypt.hashpw(senha_bytes, bcrypt.gensalt())

        try:
            usuario.insert_one({
                "nome": nome,
                "email": email,
                "senha": senha_hash
            })
            return redirect(url_for("pagina_login"))
        except Exception as e:
            return render_template("cadastro.html", error_cad=True, msg=f"Erro ao criar conta: {str(e)}")
    
    return render_template("cadastro.html")



def login():

    if request.method == "POST":

        email = request.form.get("email", "").strip()
        senha_digitada = request.form.get("senha", "")

        if not email or not senha_digitada:
            return render_template("login.html", error=True, msg="Email e senha são obrigatórios")

        usuario_encontrado = usuario.find_one({"email": email})

        if not usuario_encontrado:
            return render_template("login.html", error=True, msg="Email ou senha incorretos")
        
        senha_hash = usuario_encontrado["senha"]

        if bcrypt.checkpw(senha_digitada.encode("utf-8"), senha_hash):
            session["usuario_nome"] = usuario_encontrado["nome"]
            session["usuario_email"] = usuario_encontrado["email"]
            return redirect(url_for("pagina_home"))
        else:
            return render_template("login.html", error=True, msg="Email ou senha incorretos")
        
    return render_template("login.html")