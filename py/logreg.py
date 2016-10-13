
import pandas as pd
import numpy as np
from statutils import wlogit
from statsmodels.formula.api import logit


def wlogregr(data):
    model = wlogit("MATH_ISLP ~ C(GENDER, Treatment(reference='Male')) + C(PRIMED, Treatment(reference='Yes')) + \
                    C(ESCS_GR, Treatment(reference='Disadv')) + \
                  C(FAMSTRUC, Treatment(reference='Non-Single')) +  C(IMMIG, Treatment(reference='Native')) + \
                  C(SCHTYPE, Treatment(reference='Private') ) + \
                  C(SCHLOC, Treatment(reference='Urban') )",
                  data, weights=data.WEIGHT).fit()
    return model

def logreg(data):
    model = logit("MATH_ISLP ~ C(GENDER, Treatment(reference='Male')) + C(PRIMED, Treatment(reference='Yes')) + \
                    C(ESCS_GR, Treatment(reference='Disadv')) + \
                  C(FAMSTRUC, Treatment(reference='Non-Single')) +  C(IMMIG, Treatment(reference='Native')) + \
                  C(SCHTYPE, Treatment(reference='Private') ) + \
                  C(SCHLOC, Treatment(reference='Urban') )",
                  data).fit()
    return model


def calc_countries(pisadat, codes):

    countries_stat = pd.DataFrame(columns = ['CODE', 'GENDER', 'PRIMED',
            'ESCS_GR', 'FAMSTRUC', 'IMMIG', 'SCHTYPE', "SCHLOC",
            'GENDER_sgnf', 'PRIMED_sgnf', 'ESCS_GR_sgnf', 'FAMSTRUC_sgnf',
            'IMMIG_sgnf', 'SCHTYPE_sgnf', "SCHLOC_sgnf",
            'prec', 'recall', 'spec', 'f', 'n'
            ])
    i = 0
    for code in codes:
        print "Calculate " + code
        variables = ['GENDER', 'PRIMED', 'FAMSTRUC',
            'IMMIG', 'WEIGHT', 'SCHTYPE', 'SCHLOC', 'SAMELNG', 'MATH_ISLP', 'ESCS']
        data = pisadat[pisadat.CODE == code][variables].dropna()

        if data.empty:
            print "No data is available"
            continue

        #define disadvantaged students according to ESCS
        disadv_thrs = np.percentile(data.ESCS, 25 )
        data["ESCS_GR"] = data.ESCS
        data.loc[data.ESCS > disadv_thrs, "ESCS_GR"] = 'Adv'
        data.loc[data.ESCS <= disadv_thrs, "ESCS_GR"] = 'Disadv'

        try:
            # fit logistic regression
            model = logreg(data)

            #measure clf perfomance
            prtable = model.pred_table()
            TN = prtable[0,0]
            FP = prtable[0,1]
            FN = prtable[1,0]
            TP = prtable[1,1]

            precision = TP / (TP + FP)
            recall = TP / (TP + FN)
            specifity = TN / (TN + FP)
            F = 2*precision*recall/(precision + recall)
            n = model.nobs

            countries_stat.loc[i] = [code] + list(np.exp(model.params[1:])) + \
                    list(model.pvalues[1:]) + [precision, recall, specifity, F, n]
            i += 1
        except Exception:
            print "Errors while calcualting regression"



    return countries_stat

if __name__ == "__main__":


    pisadat = pd.read_csv("data/pisadat_all.csv")
    codes = pisadat.CODE.unique()
    countries_stat = calc_countries(pisadat, codes)
    countries_stat.to_csv('countries_logreg_stat.csv')
    #codes = pisadat.CODE.unique()
