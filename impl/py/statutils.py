from statsmodels.discrete.discrete_model import Logit
import numpy as np

class LogitWeight(Logit):
    def __init__(self, endog, exog, **kargs):
        super(Logit, self).__init__(endog, exog, **kargs)
        weights = kargs.get("weights", np.ones_like(endog))
        self.weights = np.array(weights) 

    def loglike(self, params):
        q = 2*self.endog - 1
        X = self.exog
        return np.sum(self.weights*np.log(self.cdf(q*np.dot(X, params))))

    def loglikeobs(self, params):
        q = 2*self.endog - 1
        X = self.exog
        return self.weights*np.log(self.cdf(q*np.dot(X, params)))
        #return np.log(self.cdf(q*np.dot(X, params)))


    def jac(self, params):
        y = self.endog
        X = self.exog
        L = self.cdf(np.dot(X, params))
        return ((y - L) * self.weights)[:, None] * X
        #return ((y - L))[:, None] * X


    def score_obs(self, params):
        """
        Logit model Jacobian of the log-likelihood for each observation
        Parameters
        ----------
        params: array-like
            The parameters of the model
        Returns
        -------
        jac : ndarray, (nobs, k_vars)
            The derivative of the loglikelihood for each observation evaluated
            at `params`.
        Notes
        -----
        .. math:: \\frac{\\partial\\ln L_{i}}{\\partial\\beta}=\\left(y_{i}-\\Lambda_{i}\\right)x_{i}
        for observations :math:`i=1,...,n`
        """

        y = self.endog
        X = self.exog
        L = self.cdf(np.dot(X, params))
        return ((y - L) * self.weights)[:, None] * X



    def score(self, params):
        y = self.endog
        X = self.exog
        L = self.cdf(np.dot(X, params))
        #return np.dot((y - L), X)
        return np.dot((y - L)*self.weights, X)

    def hessian(self, params):
        X = self.exog
        L = self.cdf(np.dot(X, params))
        return -np.dot((self.weights*L*(1-L)*X.T), X)
        #return -np.dot((L*(1-L)*X.T), X)


wlogit = LogitWeight.from_formula
