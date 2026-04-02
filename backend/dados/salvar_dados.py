from datetime import datetime
from urllib import request
from flask import request, jsonify, session
from backend.db import salvar_dados

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