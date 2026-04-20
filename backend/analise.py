from flask import session, jsonify, request
from backend.db import dados_colecao
from datetime import datetime, timedelta
import pandas as pd

COL_FATURAMENTO = ["Total", "Faturamento", "faturamento", "Vendas", "vendas", "Receita", "receita"]
COL_DESPESA     = ["Custo", "Despesa", "despesa", "Despesas", "despesas", "Gastos", "gastos"]
COL_LUCRO       = ["Lucro", "lucro", "Profit", "profit"]

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
    df[col_data] = pd.to_datetime(df[col_data], errors="coerce", dayfirst=True)
    df = df.dropna(subset=[col_data])
    return df[(df[col_data] >= inicio) & (df[col_data] <= fim)]

def calcular_metricas(df):
    fat = calcular_total(df, COL_FATURAMENTO)
    desp = calcular_total(df, COL_DESPESA)
    luc  = calcular_total(df, COL_LUCRO) or (fat - desp)
    mg = 0.0 if fat == 0 else round((luc/fat) * 100, 2)
    return fat, desp, luc, mg