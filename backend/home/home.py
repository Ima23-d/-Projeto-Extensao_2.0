from flask import session, jsonify
from backend.db import dados_colecao
from datetime import datetime, timedelta
import pandas as pd

# ======================
# CONFIG
# ======================
COL_FATURAMENTO = ["Total", "Faturamento", "faturamento", "Vendas", "vendas", "Receita", "receita"]
COL_DESPESA = ["Custo", "Despesa", "despesa", "Despesas", "despesas", "Gastos", "gastos"]
COL_LUCRO = ["Lucro", "lucro", "Profit", "profit"]


# ======================
# UTIL
# ======================
def encontrar_coluna_data(df):
    return next((c for c in df.columns if c.lower() == "data"), None)


def converter_datas(df, col):
    if col not in df.columns:
        return df

    df = df.copy()
    df[col] = pd.to_datetime(df[col], errors='coerce', dayfirst=True)
    return df


def calcular_total(df, colunas):
    if df.empty:
        return 0
    for col in colunas:
        if col in df.columns:
            return float(pd.to_numeric(df[col], errors='coerce').sum())
    return 0


def percentual(anterior, atual):
    if anterior == 0:
        return 0 if atual == 0 else 100
    return ((atual - anterior) / anterior) * 100


def filtrar_periodo(df, col, periodo):
    if df.empty or not col:
        return df, df

    df = df.dropna(subset=[col])
    fim = df[col].max()

    dias = {
        "7_dias": 7,
        "30_dias": 30,
        "90_dias": 90
    }

    if periodo in dias:
        inicio = fim - timedelta(days=dias[periodo])
        inicio_ant = inicio - timedelta(days=dias[periodo])
        fim_ant = inicio
    elif periodo == "ano_atual":
        inicio = datetime(fim.year, 1, 1)
        inicio_ant = datetime(fim.year - 1, 1, 1)
        fim_ant = inicio
    else:
        return filtrar_periodo(df, col, "30_dias")

    atual = df[(df[col] >= inicio) & (df[col] <= fim)]
    anterior = df[(df[col] >= inicio_ant) & (df[col] < fim_ant)]

    return atual, anterior


def empty():
    return {
        "faturamento": {"valor": 0, "percentual": 0, "valor_anterior": 0},
        "lucro": {"valor": 0, "percentual": 0, "valor_anterior": 0},
        "despesa": {"valor": 0, "percentual": 0, "valor_anterior": 0},
        "crescimento": {"valor": 0}
    }


def empty_graph():
    return {"labels": [], "series": []}


# ======================
# DESempenho
# ======================
def calcular_desempenho(periodo="30_dias"):
    user = session.get('usuario_id')
    if not user:
        return jsonify({"mensagem": "Usuário não autenticado"}), 401

    try:
        doc = dados_colecao.find_one({"usuario_id": user}, sort=[("criado_em", -1)])
        if not doc:
            return jsonify(empty()), 200

        df = pd.DataFrame(doc.get("dados", []))
        if df.empty:
            return jsonify(empty()), 200

        col = encontrar_coluna_data(df)
        df = converter_datas(df, col)

        atual, anterior = filtrar_periodo(df, col, periodo)

        fat = calcular_total(atual, COL_FATURAMENTO)
        desp = calcular_total(atual, COL_DESPESA)
        luc = calcular_total(atual, COL_LUCRO) or (fat - desp)

        fat_ant = calcular_total(anterior, COL_FATURAMENTO)
        desp_ant = calcular_total(anterior, COL_DESPESA)
        luc_ant = calcular_total(anterior, COL_LUCRO) or (fat_ant - desp_ant)

        return jsonify({
            "faturamento": {
                "valor": round(fat, 2),
                "percentual": round(percentual(fat_ant, fat), 1),
                "valor_anterior": round(fat_ant, 2)
            },
            "lucro": {
                "valor": round(luc, 2),
                "percentual": round(percentual(luc_ant, luc), 1),
                "valor_anterior": round(luc_ant, 2)
            },
            "despesa": {
                "valor": round(desp, 2),
                "percentual": round(percentual(desp_ant, desp) * -1, 1),
                "valor_anterior": round(desp_ant, 2)
            },
            "crescimento": {
                "valor": round(percentual(fat_ant, fat), 1)
            }
        }), 200

    except Exception as e:
        print("Erro:", e)
        return jsonify(empty()), 500


# ======================
# GRÁFICOS
# ======================
def obter_dados_graficos(periodo="30_dias"):
    user = session.get('usuario_id')
    if not user:
        return jsonify({"mensagem": "Usuário não autenticado"}), 401

    try:
        doc = dados_colecao.find_one({"usuario_id": user}, sort=[("criado_em", -1)])
        if not doc:
            return jsonify({
                "grafico_linha": empty_graph(),
                "grafico_barras": empty_graph()
            }), 200

        df = pd.DataFrame(doc.get("dados", []))
        col = encontrar_coluna_data(df)

        if not col:
            return jsonify({
                "grafico_linha": empty_graph(),
                "grafico_barras": empty_graph()
            }), 200

        df = converter_datas(df, col).dropna(subset=[col])

        return jsonify({
            "grafico_linha": grafico_linha(df, col, periodo),
            "grafico_barras": grafico_barras(df, col, periodo)
        }), 200

    except Exception as e:
        print("Erro:", e)
        return jsonify({"erro": str(e)}), 500


# ======================
# PROCESSAMENTO GRÁFICOS
# ======================
def filtrar_df(df, col, periodo):
    fim = df[col].max()

    dias = {"7_dias": 7, "30_dias": 30, "90_dias": 90}
    if periodo in dias:
        inicio = fim - timedelta(days=dias[periodo])
    elif periodo == "ano_atual":
        inicio = datetime(fim.year, 1, 1)
    else:
        return filtrar_df(df, col, "30_dias")

    return df[(df[col] >= inicio) & (df[col] <= fim)]


def grafico_linha(df, col, periodo):
    df = filtrar_df(df, col, periodo)
    if df.empty:
        return empty_graph()

    df["data"] = df[col].dt.strftime('%d/%m')

    agrupado = df.groupby("data").apply(lambda x: calcular_total(x, COL_FATURAMENTO))

    labels = sorted(agrupado.index, key=lambda x: datetime.strptime(x + "/2000", "%d/%m/%Y"))

    return {
        "labels": labels,
        "series": [{
            "name": "Faturamento",
            "data": [float(agrupado[l]) for l in labels]
        }]
    }


def grafico_barras(df, col, periodo):
    df = filtrar_df(df, col, periodo)
    if df.empty:
        return empty_graph()

    df["periodo"] = df[col].dt.strftime('%b/%Y')
    grupos = df.groupby("periodo")

    labels, fat, desp, luc = [], [], [], []

    for nome, g in grupos:
        labels.append(nome)
        f = calcular_total(g, COL_FATURAMENTO)
        d = calcular_total(g, COL_DESPESA)
        l = calcular_total(g, COL_LUCRO) or (f - d)

        fat.append(f)
        desp.append(d)
        luc.append(l)

    return {
        "labels": labels,
        "series": [
            {"name": "Faturamento", "data": fat},
            {"name": "Despesas", "data": desp},
            {"name": "Lucro", "data": luc}
        ]
    }