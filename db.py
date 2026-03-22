from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
import os

load_dotenv()

uri = os.getenv('URI')

cliente = MongoClient(uri, tlsCAFile=certifi.where())

db = cliente["teste"]
usuario = db["usuarios"]

def criar_index():
    usuario.create_index("email", unique=True)

if __name__ == "__main__":
    criar_index()
    print("Índice criado com sucesso!")