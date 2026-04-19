from flask import render_template, request, redirect, session, url_for, jsonify
import bcrypt
from .db import usuario
import re
import secrets



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
            session["usuario_id"] = str(usuario_encontrado["_id"])
            session["usuario_nome"] = usuario_encontrado["nome"]
            session["usuario_email"] = usuario_encontrado["email"]
            return redirect(url_for("pagina_home"))
        else:
            return render_template("login.html", error=True, msg="Email ou senha incorretos")

    return render_template("login.html")


def esqueceu_senha():
    """
    Processa a solicitação de recuperação de senha.
    Valida se o email existe e retorna JSON com status.
    """

    if request.method == "POST":
        email = request.form.get("email", "").strip()

        # Validar se email foi fornecido
        if not email:
            return jsonify({
                "sucesso": False,
                "mensagem": "Por favor, digite seu e-mail"
            }), 400

        # Validar formato do email
        if not validar_email(email):
            return jsonify({
                "sucesso": False,
                "mensagem": "Por favor, digite um e-mail válido"
            }), 400

        # Verificar se email existe na base de dados
        usuario_encontrado = usuario.find_one({"email": email})

        if not usuario_encontrado:
            # Por segurança, não informar que o email não existe
            return jsonify({
                "sucesso": True,
                "mensagem": "Se este e-mail estiver cadastrado, você receberá um código de recuperação"
            }), 200

        # Gerar código de recuperação (6 dígitos aleatórios)
        codigo_recuperacao = str(secrets.randbelow(1000000)).zfill(6)

        try:
            # Atualizar usuário com código de recuperação e timestamp
            from datetime import datetime, timedelta

            usuario.update_one(
                {"_id": usuario_encontrado["_id"]},
                {
                    "$set": {
                        "codigo_recuperacao": codigo_recuperacao,
                        "codigo_expiracy": datetime.now() + timedelta(minutes=15)
                    }
                }
            )

            # TODO: Implementar envio de email com o código
            # Para agora, apenas retorna sucesso
            # Exemplo de implementação com Flask-Mail ou similar:
            # send_recovery_email(email, codigo_recuperacao)

            return jsonify({
                "sucesso": True,
                "mensagem": "Se este e-mail estiver cadastrado, você receberá um código de recuperação"
            }), 200

        except Exception as e:
            return jsonify({
                "sucesso": False,
                "mensagem": f"Erro ao processar solicitação: {str(e)}"
            }), 500

    return render_template("esqueceu_senha.html")
