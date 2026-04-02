
from flask import request, jsonify, session, current_app
import os
import pandas as pd
from backend.dados.dados import limpar_dados
from backend.db import salvar_dados


def upload_arquivo():
    if "file" not in request.files:
        return jsonify({"mensagem": "Nenhum arquivo enviado"}), 400

    arquivo = request.files["file"]

    if arquivo.filename == "":
        return jsonify({"mensagem": "Arquivo inválido"}), 400

    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    caminho = os.path.join(upload_folder, arquivo.filename)
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