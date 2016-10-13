import pandas as pd
import numpy as np
import random
from pandas_datareader import wb
import recode as rec

baselevel = {
    "math" : 420,
    "read" : 407,
    "scie" : 410
}


def getavg(df, field):
    names = ["PV" + str(i) + field.upper() for i in range(1,6)]
    return df[names].sum(axis=1) / 5

def manage(studfile, schoolfile, studcols=None, schoolcols=None):
    """ Read data file, extract specific columns and perform pre-processing """
    pisa_stud = pd.read_csv(studfile, usecols = studcols)
    pisa_school = pd.read_csv(schoolfile, usecols = schoolcols)

    pisa_stud["CODE"] = pisa_stud["STRATUM"].apply(lambda s: s[:3])

    pisadat = pd.merge(pisa_stud, pisa_school, left_on = ["CODE", "SCHOOLID"],
                            right_on=["CNT", "SCHOOLID"], how="left")

    pisadat.rename(columns= {
                        "ST05Q01" : "PRIMED",
                        "SC01Q01" : "SCHTYPE",
                        "SC03Q01" : "SCHLOC",
                        "ST04Q01" : "GENDER",
                        "CNT_x" : "CNT",
                        "W_FSTUWT" : "WEIGHT"},
                inplace=True

        )


    pisadat["PVMATH"] = getavg(pisadat, "math")
    pisadat["PVREAD"] = getavg(pisadat, "read")
    pisadat["PVSCIE"] = getavg(pisadat, "SCIE")
    pisadat["SAMELNG"] = (pisadat.LANGN == pisadat.TESTLANG).astype(int)
    pisadat["MATH_ISLP"] = (pisadat.PVMATH < baselevel["math"]).astype(int)
    pisadat["READ_ISLP"] = (pisadat.PVREAD < baselevel["read"]).astype(int)
    pisadat["SCIE_ISLP"] = (pisadat.PVSCIE < baselevel["scie"]).astype(int)

    pisadat["ISLP_ANY"] = np.any(pisadat[["MATH_ISLP", "READ_ISLP",
                "SCIE_ISLP"]], axis=1).astype(int)
    pisadat["ISLP_ALL"] = np.all(pisadat[["MATH_ISLP", "READ_ISLP",
                "SCIE_ISLP"]], axis=1).astype(int)

    pisadat.loc[pisadat.CNT == "China-Shanghai", "CODE"] = "CHN"
    pisadat.loc[pisadat.CNT == "Chinese Taipei", "CODE"] = "TWN"


    pisadat.drop(['PV1READ', 'PV2READ', 'PV3READ', 'PV4READ', 'PV5READ', 'PV1SCIE',
       'PV2SCIE', 'PV3SCIE', 'PV4SCIE', 'PV5SCIE', 'PV1MATH', 'PV2MATH',
       'PV3MATH', 'PV4MATH', 'PV5MATH', 'LANGN', 'TESTLANG', 'STRATUM',
       'SCHOOLID', 'STIDSTD', 'CNT_y' ],
            axis=1, inplace=True)

    return pisadat

def preprocess(studfile, schoolfile, recode_table_f, recode_vars_f):
    studcols = ["STIDSTD", "CNT", "STRATUM", "SCHOOLID", "ST04Q01", "ESCS",
            "IMMIG", "LANGN", "TESTLANG",
            "FAMSTRUC", "ST05Q01", 'PV1READ', 'PV2READ', 'PV3READ', 'PV4READ',
            'PV5READ', 'PV1SCIE', 'PV2SCIE', 'PV3SCIE', 'PV4SCIE', 'PV5SCIE',
            'PV1MATH', 'PV2MATH', 'PV3MATH', 'PV4MATH', 'PV5MATH', 'W_FSTUWT']

    schoolcols  = [ "CNT", "SCHOOLID", "SC01Q01", "SC03Q01"]


    pisadat = manage(studfile, schoolfile, studcols=studcols,
            schoolcols=schoolcols)

    recode_vars = pd.read_csv(recode_vars_f)["variable"].unique()
    pisadat[recode_vars] = pisadat[recode_vars].applymap(rec.strip)
    rec.recode(pisadat, recode_table_f, recode_vars_f)

    return pisadat

def getGDP(codes):
    """
    Download GDP data from World Bank.
    Returns data frame in a format: country, GDP, iso3c, region
    iso3c is a ISO-3 country code which can be used later for join
    """
    gdpdat = wb.download(indicator='NY.GDP.PCAP.PP.CD',
                     country=[s for s in list(codes) if s in wb.country_codes],
                     errors = "warn",
                     start=2012, end=2012).reset_index()

    gdpdat.rename(columns = {"NY.GDP.PCAP.PP.CD" : "GDP"}, inplace=True)
    gdpdat.drop("year", axis=1, inplace=True)

    countries = wb.get_countries()
    gdpdat = pd.merge(gdpdat, countries[["iso3c", "name", "region"]], left_on="country", right_on="name", how="left")
    gdpdat.drop("name", axis=1, inplace=True)

    return gdpdat

def getSample(datafile, perc):

    num_lines = pd.read_csv(datafile, usecols=[0]).shape[0]
    print "Initial data file has {} lines".format(num_lines)

    size = int(num_lines * perc)
    skip_idx = random.sample(range(1, num_lines), num_lines - size)
    sample = pd.read_csv(datafile, skiprows=skip_idx)
    return sample

def readTxtSas(file, sas_syntax_file):
    """
    Parse sas syntax file and read txt file
    """
    names = []
    colspecs = []

    with open(sas_syntax_file, "r") as f:
        doRead = False
        didRead = False
        for line in f:
            line = line.strip()

            if line == ";" and didRead:
                break

            if doRead:
                name, pos = line.split(" ", 1)
                p1, p2 = pos.split("-")
                colspecs.append((int(p1)-1, int(p2)))
                names.append(name)
                didRead = True

            if line == "input":
                doRead = True

    return pd.read_fwf(file, colspecs=colspecs, names = names)
