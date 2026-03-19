from flask import render_template, request, redirect, session
import bcrypt
from db import usuario 



def tela_cadastro():

    if request.method == "POST":

        nome = request.form["nome"]
        email = request.form["email"]
        senha = request.form["senha"]

        try:
            nome = str(nome)
            email = str(email)
            senha = str(senha)
        except Exception as e:
            return (f"Deu problema: {e}")

        email_econtrado = usuario.find_one({"email":email})

        if email_econtrado:
            return render_template("cadastro.html", error_cad=True)

        senha_bytes = senha.encode("utf-8")

        senha_hash = bcrypt.hashpw(senha_bytes, bcrypt.gensalt())

        usuario.insert_one({
            "nome":nome,
            "email":email,
            "senha":senha_hash
        })


        return redirect("/")
    return render_template("cadastro.html")



def login():

    if request.method == "POST":

        email = request.form["email"]
        senha_digitada = request.form["senha"]

        usuario_encontrado = usuario.find_one({"email":email})

        if not usuario_encontrado:
            return render_template("index.html", error=True)
        
        senha_hash = usuario_encontrado["senha"]

        if bcrypt.checkpw(senha_digitada.encode("utf-8"), senha_hash):
            session["usuario_nome"] = usuario_encontrado["nome"]
            return redirect("/home")
        else:
            return render_template("index.html", error_2=True)
        
    return redirect("/")

