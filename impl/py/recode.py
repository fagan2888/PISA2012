import pandas as pd

def strip(text):
    try:
        return str(text).strip()
    except AttributeError:
        return text

def recode(df, recode_table_f, recode_vars_f):
    """ Recode specified variables according to recode table
        Recode table format: recode_id, old, new
        Recode vars format: recode_id, variable
    """
    recode_table = pd.read_csv(recode_table_f, na_values=[""], dtype=object)
    recode_vars = pd.read_csv(recode_vars_f, dtype=object)

    match = {}
    recdf = pd.merge(recode_vars, recode_table, on="recode_id", how="left")
    for name, group in recdf.groupby("variable"):
        d = group.set_index("old")["new"].to_dict()
        match[name] = d

    #Simple df.replace(match, inplace=True, regex=True) throws
    #ValueError: Replacement not allowed with overlapping keys and values
    #https://github.com/pydata/pandas/issues/5338
    for col, rec in match.iteritems():
        df[col].replace(rec, inplace=True, regex=True)


if __name__ == "__main__":
    recode_table_f = "recode_table.csv"
    recode_vars_f = "recode_vars.csv"

    # Read recode tables and list of variables to recode

    # Read sample
    sample = pd.read_csv("data//sample.csv", dtype=object)
    recode(sample, recode_table_f, recode_vars_f)
    sample.to_csv("sample_rcd.csv")
