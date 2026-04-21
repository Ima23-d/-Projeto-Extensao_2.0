import pandas as pd

# ======================
# UTIL
# ======================
def encontrar_coluna_data(df):
    return next((c for c in df.columns if c.lower() == "data"), None)


def converter_datas(df, col):
    if col not in df.columns:
        return df

    df = df.copy()

    # tentativa simples e eficiente
    datas = pd.to_datetime(df[col], errors='coerce', dayfirst=True)

    # se falhar totalmente, mantém original
    if datas.notna().sum() == 0:
        return df

    df[col] = datas.dt.strftime("%Y-%m-%d").fillna("")
    return df


# ======================
# LIMPEZA PRINCIPAL
# ======================
def limpar_dados(df):
    if df.empty:
        return df

    # limpar nomes das colunas
    df.columns = df.columns.str.strip()

    # remover linhas vazias
    df = df.dropna(how="all")

    # limpar strings
    df = df.map(lambda x: x.strip() if isinstance(x, str) else x)

    # tratar datas
    col_data = encontrar_coluna_data(df)
    if col_data:
        df = converter_datas(df, col_data)

    # preencher vazios
    df = df.fillna("")

    # remover duplicados
    df = df.drop_duplicates()

    return df