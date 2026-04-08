from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
import os
from datetime import datetime
load_dotenv()

uri = os.getenv('URI')

cliente = MongoClient(uri, tlsCAFile=certifi.where())

db = cliente["teste"]
usuario = db["usuarios"]
dados_colecao = db["dados"]

def criar_index():
    usuario.create_index("email", unique=True)
    dados_colecao.create_index("criado_em")

def salvar_dados(usuario_id, nome_planilha, colunas, dados):
    """Salva os dados no banco de dados"""
    
    documento = {
        "usuario_id": usuario_id,
        "nome_planilha": nome_planilha,
        "colunas": colunas,
        "dados": dados,
        "criado_em": datetime.now(),
        "atualizado_em": datetime.now()
    }
    
    resultado = dados_colecao.insert_one(documento)
    return resultado.inserted_id

if __name__ == "__main__":
    criar_index()
    print("Índice criado com sucesso!")