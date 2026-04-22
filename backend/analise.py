from flask import session, jsonify, request
from backend.db import dados_colecao
from datetime import datetime, timedelta
import pandas as pd


# ======================
# COLUNAS RECONHECIDAS
# ======================
COL_FATURAMENTO = ["Total", "Faturamento", "faturamento", "Vendas", "vendas", "Receita", "receita"]
COL_DESPESA     = ["Custo", "Despesa", "despesa", "Despesas", "despesas", "Gastos", "gastos"]
COL_LUCRO       = ["Lucro", "lucro", "Profit", "profit"]


# ======================
# UTILITÁRIOS
# ======================
def encontrar_coluna_data(df):
    return next((c for c in df.columns if c.lower() == "data"), None)


def calcular_total(df, colunas):
    if df.empty:
        return 0.0
    for col in colunas:
        if col in df.columns:
            return float(pd.to_numeric(df[col], errors="coerce").sum())
    return 0.0

def variacao_percentual(anterior, atual):
    if anterior == 0:
        return 0.0 if atual == 0 else 100.0
    return round(((atual - anterior) / anterior) * 100, 2)


def filtrar_por_periodo(df, col_data, inicio, fim):
    if df.empty or not col_data:
        return df
    df[col_data] = pd.to_datetime(df[col_data], errors="coerce", dayfirst=False)
    df = df.dropna(subset=[col_data])
    return df[(df[col_data] >= inicio) & (df[col_data] <= fim)]
    


def calcular_metricas(df):
    fat  = calcular_total(df, COL_FATURAMENTO)
    desp = calcular_total(df, COL_DESPESA)
    luc  = calcular_total(df, COL_LUCRO) or (fat - desp)
    mg   = 0.0 if fat == 0 else round((luc / fat) * 100, 2)
    return fat, desp, luc, mg


# ======================
# ENDPOINT PRINCIPAL
# ======================
def analise_por_periodo():

    # Verificar se o usuário está logado
    user = session.get("usuario_id")
    if not user:
        return jsonify({"mensagem": "Usuário não autenticado"}), 401

    # Receber e validar as datas
    data_inicio_str = request.args.get("data_inicio", "")
    data_fim_str    = request.args.get("data_fim", "")

    if not data_inicio_str or not data_fim_str:
        return jsonify({"mensagem": "Informe data_inicio e data_fim"}), 400

    try:
        data_inicio = datetime.strptime(data_inicio_str, "%Y-%m-%d")
        data_fim    = datetime.strptime(data_fim_str,    "%Y-%m-%d")
    except ValueError:
        return jsonify({"mensagem": "Formato de data inválido. Use YYYY-MM-DD"}), 400

    if data_inicio > data_fim:
        return jsonify({"mensagem": "A data inicial não pode ser maior que a data final"}), 400

    # Buscar dados e calcular
    try:
        doc = dados_colecao.find_one({"usuario_id": user}, sort=[("criado_em", -1)])
        if not doc:
            return jsonify({"mensagem": "Nenhum dado encontrado"}), 200

        df = pd.DataFrame(doc.get("dados", []))
        if df.empty:
            return jsonify({"mensagem": "Nenhum dado encontrado"}), 200

        col_data = encontrar_coluna_data(df)

        df_atual = filtrar_por_periodo(df.copy(), col_data, data_inicio, data_fim)

        duracao    = (data_fim - data_inicio).days + 1
        fim_ant    = data_inicio - timedelta(days=1)
        inicio_ant = fim_ant - timedelta(days=duracao - 1)
        df_ant     = filtrar_por_periodo(df.copy(), col_data, inicio_ant, fim_ant)

        fat,  desp,  luc,  mg  = calcular_metricas(df_atual)
        fat_a, desp_a, luc_a, mg_a = calcular_metricas(df_ant)

        return jsonify({
            "periodo": {
                "inicio":          data_inicio_str,
                "fim":             data_fim_str,
                "inicio_anterior": inicio_ant.strftime("%Y-%m-%d"),
                "fim_anterior":    fim_ant.strftime("%Y-%m-%d"),
            },
            "faturamento": {
                "valor":          round(fat, 2),
                "valor_anterior": round(fat_a, 2),
                "variacao":       variacao_percentual(fat_a, fat),
            },
            "despesa": {
                "valor":          round(desp, 2),
                "valor_anterior": round(desp_a, 2),
                "variacao":       variacao_percentual(desp_a, desp),
            },
            "lucro": {
                "valor":          round(luc, 2),
                "valor_anterior": round(luc_a, 2),
                "variacao":       variacao_percentual(luc_a, luc),
            },
            "margem": {
                "valor":          mg,
                "valor_anterior": mg_a,
                "variacao":       round(mg - mg_a, 2),
            },
            "grafico": agrupar_por_data(df_atual, col_data) if col_data else {"labels": [], "series": []},
        }), 200

    except Exception as e:
        print(f"Erro em analise_por_periodo: {e}")
        return jsonify({"mensagem": f"Erro interno: {str(e)}"}), 500



def agrupar_por_data(df, col_data):
    if df.empty or not col_data:
        return {"labels": [], "series": []}

    df = df.copy()
    df["_label"] = df[col_data].dt.strftime("%d/%m/%Y")

    fat_serie  = df.groupby("_label").apply(lambda x: calcular_total(x, COL_FATURAMENTO))
    desp_serie = df.groupby("_label").apply(lambda x: calcular_total(x, COL_DESPESA))
    luc_serie  = df.groupby("_label").apply(
        lambda x: calcular_total(x, COL_LUCRO) or (calcular_total(x, COL_FATURAMENTO) - calcular_total(x, COL_DESPESA))
    )

    try:
        labels = sorted(fat_serie.index.tolist(), key=lambda d: datetime.strptime(d, "%d/%m/%Y"))
    except Exception:
        labels = fat_serie.index.tolist()

    return {
        "labels": labels,
        "series": [
            {"name": "Faturamento", "data": [round(fat_serie.get(l, 0), 2)  for l in labels]},
            {"name": "Despesas",    "data": [round(desp_serie.get(l, 0), 2) for l in labels]},
            {"name": "Lucro",       "data": [round(luc_serie.get(l, 0), 2)  for l in labels]},
        ],
    }