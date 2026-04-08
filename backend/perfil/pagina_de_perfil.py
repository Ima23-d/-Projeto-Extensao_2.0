
from flask import session, render_template

def pagina_perfil():
    ultimos = session.get('relatorios_gerados', [])
    ultimos_filtrados = ultimos[:4]
    return render_template("perfil.html", ultimos_relatorios=ultimos_filtrados)