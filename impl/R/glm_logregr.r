setwd("/Users/toma/Documents/UdacityNanodegree/P6\ D3js/PISA2012")
pisadat <- read.csv("data/pisadat_all.csv", na.strings = c("", " ", "nan"))
pisadat$SAMELNG_GR <- as.factor(ifelse(pisadat$SAMELNG == 1, 'Same Lng', 'Other Lng'))

df <- data.frame(CODE=NA, CNT=NA, GENDER=NA, PRIMED=NA, 
                 ESCS_GR=NA, FAMSTRUC=NA, IMMIG=NA, SCHLOC=NA,
                 DIFFLNG=NA, GENDER_sgn=NA, PRIMED_sgn=NA, 
                 ESCS_GR_sgn=NA, FAMSTRUC_sgn=NA, IMMIG_sgn=NA, SCHLOC_sgn=NA,
                 DIFFLNG_sgn=NA)[numeric(0), ]



wlogreg <- function(alldata) {
  data <- na.omit(alldata)
  disadv_thrs <- quantile(data$ESCS, 0.25 )
  data[data$ESCS > disadv_thrs, c("ESCS_GR")] <- 'Adv'
  data[data$ESCS <= disadv_thrs, c("ESCS_GR")] <- 'Disadv'
  data$ESCS_GR <- as.factor(data$ESCS_GR)
  
  data$GENDER <- relevel(data$GENDER, ref='Male')
  data$PRIMED <- relevel(data$PRIMED, ref='Yes')
  data$ESCS_GR <- relevel(data$ESCS_GR, ref='Adv')
  data$FAMSTRUC <- relevel(data$FAMSTRUC, ref='Non-Single')
  data$IMMIG <- relevel(data$IMMIG, ref='Native')
  data$SCHLOC <- relevel(data$SCHLOC, ref="Urban")
  data$SAMELNG_GR <- relevel(data$SAMELNG_GR, ref="Same Lng")
  
  data$WEIGHT_NRM = 100 * (data$WEIGHT - (min(data$WEIGHT)) ) / 
    (max(data$WEIGHT) - min(data$WEIGHT)) + 1 
  
  weights <- NULL
  #weights = as.integer(WEIGHT_NRM)
  
  wlogreg <- glm(MATH_ISLP ~ C(GENDER) + C(PRIMED) + C(ESCS_GR) + 
                   C(FAMSTRUC) +  C(IMMIG) + 
                   C(SCHLOC) + C(SAMELNG_GR) , data=data,
                 family = 'binomial', weights = weights)
  
}


for (code in unique(pisadat$CODE)) {
  alldata <- pisadat[pisadat$CODE==code, c("CODE", "CNT", "MATH_ISLP", "GENDER",
                                        "PRIMED", "ESCS", "FAMSTRUC", "IMMIG", 
                                        "SCHLOC", "WEIGHT", "SAMELNG_GR")]
  CNT <-  as.character(alldata$CNT)[1]
  
  log.fit <- try(wlogreg(alldata))
  if(inherits(log.fit, "try-error"))
  {
    print (CNT)
    print ("Problems with calculations")
  } else {
  
    df[nrow(df)+1,] <- c(code, CNT, coef(summary(log.fit))[2:8,1],
                         coef(summary(log.fit))[2:8,4])
  }
}

write.csv(df, "R/glm_logreg.csv", row.names = FALSE)
