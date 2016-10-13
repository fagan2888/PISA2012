import utils as myutils
import logreg as lr
import pandas as pd
import numpy as np
import itertools
import sys
import subprocess


studfile = "data/pisa2012.csv"
schoolfile = "data/pisa_school2012.csv"


def do_clean(studfile, schoolfile,  cldata_file):

    print "Perform data cleaning and save to " + cldata_file

    recode_table_f = "../data/recode/recode_table_regr.csv"
    recode_vars_f = "../data/recode/recode_vars_regr.csv"

    pisadat = myutils.preprocess(studfile, schoolfile,
            recode_table_f, recode_vars_f)
    pisadat.to_csv(cldata_file, index=False)

def do_logreg(cldata_file, clogstat_file):
    print "Perform multilevel log reg and save to " + clogstat_file

    pisadat = pd.read_csv(cldata_file)
    codes = pisadat.CODE.unique()
    countries_logstat = lr.calc_countries(pisadat, codes)
    countries_logstat.to_csv(clogstat_file, index=False)

def do_addGDP(cstatfile_MATH, cstatfile_READ, cstatfile_SCIE,
                cstatfile_MATH_new, cstatfile_READ_new, cstatfile_SCIE_new):
    """
    cstatfile(_MATH,_READ, _SCIE) - file path to read countries statistics
                file. It is prepared by R code
    cstatfile(_MATH,_READ, _SCIE)_new - file path to save countries statistics
                aggregated with GDP data
    """
    print "Add GDP to country stat"

    cstat_files = [cstatfile_MATH, cstatfile_READ, cstatfile_SCIE]
    cstat_files_new = [cstatfile_MATH_new, cstatfile_READ_new, cstatfile_SCIE_new]

    cstats = [pd.read_csv(cstat_file) for cstat_file in cstat_files ]


    codes = set(itertools.chain(*[list(cstat.CODE.unique()) for cstat in cstats]))
    gdpdat = myutils.getGDP(codes)

    for i, cstat in enumerate(cstats):
        data = pd.merge(cstat, gdpdat[["iso3c", "GDP"]],
                    right_on="iso3c", left_on="CODE", how="left")
        data.to_csv(cstat_files_new[i], index=False)

def do_sample(datafile, perc, smplpath):
        sample = myutils.getSample(datafile, perc)
        sample.to_csv(smplpath)

def do_schdata_tocsv():
    sas_syntax_file = "../data/PISA2012_SAS_school.sas"
    file = "../data/pisa_school2012.txt"
    schooldat = myutils.readTxtSas(file, sas_syntax_file)
    schooldat.to_csv("../data/pisa_school2012.csv", index=False)


if __name__ == "__main__":
    studfile = "../data/pisa2012.csv"
    schoolfile = "../data/pisa_school2012.csv"

    cldata_file =  "../data/pisadat_all.csv"
    clogstat_file = "countries_logreg_stat.csv"

    cstatfile_MATH = "../R/country_stat_MATH.csv"
    cstatfile_READ = "../R/country_stat_READ.csv"
    cstatfile_SCIE = "../R/country_stat_SCIE.csv"

    cstatfile_MATH_new = "../R/country_stat_MATH_gdp.csv"
    cstatfile_READ_new = "../R/country_stat_READ_gdp.csv"
    cstatfile_SCIE_new = "../R/country_stat_SCIE_gdp.csv"

    for arg in sys.argv[1:]:
        if arg == 'clean':
            do_clean(studfile, schoolfile,  cldata_file)
        if arg == "logreg":
            do_logreg(cldata_file, clogstat_file)
        if arg == "stat":
            print "Run R script to calculate country statistics"
            cmd = ['Rscript', '../R/country_stat.r', '../R']
            msg = subprocess.check_output(cmd, universal_newlines=True)
            print msg
        if arg == "addGDP":
            do_addGDP(cstatfile_MATH, cstatfile_READ, cstatfile_SCIE,
                    cstatfile_MATH_new, cstatfile_READ_new, cstatfile_SCIE_new)
        if arg == "sample":
            perc = 0.2
            smplpath = "../data/sample.csv"
            do_sample(studfile, perc, smplpath)
        if arg == "schdata_tocsv":
            print "Transform school data to csv format"
            do_schdata_tocsv()
