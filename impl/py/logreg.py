
import pandas as pd
import numpy as np
from statutils import wlogit
from statsmodels.formula.api import logit
from sklearn.linear_model import LogisticRegressionCV




def wlogreg(data):
    model = wlogit("MATH_ISLP ~ C(GENDER, Treatment(reference='Male')) + C(PRIMED, Treatment(reference='Yes')) + \
                    C(ESCS_GR, Treatment(reference='Adv')) + \
                  C(FAMSTRUC, Treatment(reference='Non-Single')) +  C(IMMIG, Treatment(reference='Native')) + \
                  C(SCHLOC, Treatment(reference='Urban') )",
                  data, weights=data.WEIGHT).fit()
    return model

def logreg(data):
    model = logit("MATH_ISLP ~ C(GENDER, Treatment(reference='Male')) + C(PRIMED, Treatment(reference='Yes')) + \
                    C(ESCS_GR, Treatment(reference='Adv')) + \
                  C(FAMSTRUC, Treatment(reference='Non-Single')) +  C(IMMIG, Treatment(reference='Native')) + \
                  C(SCHLOC, Treatment(reference='Urban') )",
                  data).fit()
    return model

def calc_countries_reg(pisadat, codes):
    """Weighted logistic regression with regularization calculated separately for
    each country. Sklearn implementation.
    """
    countries_stat = pd.DataFrame(columns = ['CODE', 'CNT', 'GENDER', 'PRIMED',
            'FAMSTRUC', 'IMMIG', "SCHTYPE", "SCHLOC", 'ESCS_GR', 'n'
            ])
    i = 0
    for code in codes:
        CNT = pisadat[pisadat.CODE == code]["CNT"].iloc[0]
        print "Calculate " + code
        variables = ['GENDER', 'PRIMED', 'FAMSTRUC',
            'IMMIG', 'WEIGHT', 'SCHTYPE', 'SCHLOC', 'SAMELNG',
            'MATH_ISLP', 'ESCS']

        data = pisadat[pisadat.CODE == code][variables].dropna()

        if data.empty:
            print "No data is available"
            continue

        try:
            #define disadvantaged students according to ESCS
            disadv_thrs = np.percentile(data.ESCS, 25 )
            data["ESCS_GR"] = data.ESCS
            data.loc[data.ESCS > disadv_thrs, "ESCS_GR"] = 'Adv'
            data.loc[data.ESCS <= disadv_thrs, "ESCS_GR"] = 'Disadv'

            y = data["MATH_ISLP"]
            w = data["WEIGHT"]
            data.drop(["WEIGHT", "MATH_ISLP", "ESCS", "SAMELNG"], axis=1, inplace=True)
            data_dm = pd.get_dummies(data)
            reference_levels = ["GENDER_Male", "PRIMED_Yes", "FAMSTRUC_Non-Single",
                       "IMMIG_Native", "SCHTYPE_Private", "SCHLOC_Urban",
                        "ESCS_GR_Adv"]
            data_dm.drop(reference_levels, axis=1, inplace=True)
            X = data_dm


                # fit logistic regression
            clf = LogisticRegressionCV()
            clf.fit(X, y, w)
                #measure clf perfomance
            n = X.shape[0]

            countries_stat.loc[i] = [code, CNT] + list(clf.coef_[0]) + [n]
            i += 1
        except Exception as e:
            print "Errors while calcualting regression"
            print e.message, e.args

    return countries_stat

def calc_countries(pisadat, codes):
    """ Logistic regression calculated separately for each country.
    Statmodels implementation. """

    countries_stat = pd.DataFrame(columns = ['CODE', 'CNT', 'GENDER', 'PRIMED',
            'ESCS_GR', 'FAMSTRUC', 'IMMIG', "SCHLOC",
            'GENDER_sgnf', 'PRIMED_sgnf', 'ESCS_GR_sgnf', 'FAMSTRUC_sgnf',
            'IMMIG_sgnf', "SCHLOC_sgnf",
            'prec', 'recall', 'spec', 'f', 'n'
            ])
    i = 0
    for code in codes:
        CNT = pisadat[pisadat.CODE == code]["CNT"].iloc[0]
        print "Calculate " + code
        variables = ['GENDER', 'PRIMED', 'FAMSTRUC',
            'IMMIG', 'WEIGHT', 'SCHLOC', 'SAMELNG', 'MATH_ISLP', 'ESCS']
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

            countries_stat.loc[i] = [code, CNT] + list(model.params[1:]) + \
                    list(model.pvalues[1:]) + [precision, recall, specifity, F, n]
            i += 1
        except Exception as e:
            print "Errors while calcualting regression"
            print e.message, e.args



    return countries_stat

if __name__ == "__main__":


    pisadat = pd.read_csv("data/pisadat_all.csv")
    codes = pisadat.CODE.unique()
    countries_stat = calc_countries(pisadat, codes)
    countries_stat.to_csv('countries_logreg_stat.csv')
    #codes = pisadat.CODE.unique()
