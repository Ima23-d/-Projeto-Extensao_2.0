import pandas as pd

def limpar_dados(df):
    # remover espaços nos nomes das colunas
    df.columns = df.columns.str.strip()

    # remover linhas totalmente vazias
    df = df.dropna(how="all")

    # remover espaços nas strings
    df = df.map(lambda x: x.strip() if isinstance(x, str) else x)

    # ===============================
    # FORMATAR DATA
    # ===============================
    if "Data" in df.columns:
        df["Data"] = pd.to_datetime(
            df["Data"],
            errors="coerce",
            dayfirst=True
        )

        # Converter para string, mas manter valores inválidos vazios
        df["Data"] = df["Data"].dt.strftime("%Y-%m-%d").fillna("")

    # preencher vazios
    df = df.fillna("")

    # remover duplicados
    df = df.drop_duplicates()

    return df