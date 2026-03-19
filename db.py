from pymongo import MongoClient

cliente = MongoClient("mongodb+srv://kevinburgos0709_db_user:jdkljdkl.kblc2006@teste.n5ozsna.mongodb.net/?appName=teste")

db = cliente["teste"]
usuario = db["usuarios"]
usuario.create_index("email", unique=True)


# for u in usuario.find():
#     print(f"{u["_id"]} ; {u["nome"]} ; {u["email"]} ; {u["senha"]}\n")
