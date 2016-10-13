library(Hmisc)

pisadat <- read.csv("../data/pisadat_all.csv", na.strings = c("", " ", "nan"))


df_MATH <- data.frame(CODE=NA, CNT=NA, MATH_mean=NA, MATH_quant_05=NA, 
                MATH_quant_25=NA, MATH_quant_50=NA, MATH_quant_75=NA,
                MATH_quant_95=NA, MATHLP_perc=NA, LPANY_perc=NA,
                LPALL_perc=NA)[numeric(0), ]

df_READ <- data.frame(CODE=NA, CNT=NA, READ_mean=NA, READ_quant_05=NA, 
                      READ_quant_25=NA, READ_quant_50=NA, READ_quant_75=NA,
                      READ_quant_95=NA, READLP_perc=NA, LPANY_perc=NA,
                      LPALL_perc=NA)[numeric(0), ]

df_SCIE <- data.frame(CODE=NA, CNT=NA, SCIE_mean=NA, SCIE_quant_05=NA, 
                      SCIE_quant_25=NA, SCIE_quant_50=NA, SCIE_quant_75=NA,
                      SCIE_quant_95=NA, SCIELP_perc=NA, LPANY_perc=NA,
                     LPALL_perc=NA)[numeric(0), ]


for (code in levels(pisadat$CODE)) {
  data <- subset(pisadat, CODE == code)
  
  CNT <-  as.character(data$CNT)[1]
  MATH_mean <- wtd.mean(data$PVMATH, weights = data$WEIGHT)
  READ_mean <- wtd.mean(data$PVREAD, weights = data$WEIGHT)
  SCIE_mean <- wtd.mean(data$PVSCIE, weights = data$WEIGHT)
  
  MATH_quant <- wtd.quantile(data$PVMATH, weights=data$WEIGHT, probs=c(0.05, 0.25, 0.5, 0.75, 0.95))
  READ_quant <- wtd.quantile(data$PVREAD, weights=data$WEIGHT, probs=c(0.05, 0.25, 0.5, 0.75, 0.95))
  SCIE_quant <- wtd.quantile(data$PVSCIE, weights=data$WEIGHT, probs=c(0.05, 0.25, 0.5, 0.75, 0.95))
  
  MATHLP_perc <- wtd.mean(data$MATH_ISLP, weights = data$WEIGHT)
  READLP_perc <- wtd.mean(data$READ_ISLP, weights = data$WEIGHT)
  SCIELP_perc <- wtd.mean(data$SCIE_ISLP, weights = data$WEIGHT)
  LPANY_perc <- wtd.mean(data$ISLP_ANY, weights = data$WEIGHT)
  LPALL_perc <- wtd.mean(data$ISLP_ALL, weights = data$WEIGHT)
  
  df_MATH[nrow(df_MATH)+1,] <- c(code, CNT, MATH_mean, MATH_quant, MATHLP_perc, 
                    LPANY_perc, LPALL_perc)
  
  df_READ[nrow(df_READ)+1,] <- c(code, CNT, READ_mean, READ_quant, READLP_perc, 
                            LPANY_perc, LPALL_perc)
  
  df_SCIE[nrow(df_SCIE)+1,] <- c(code, CNT, SCIE_mean, SCIE_quant, SCIELP_perc, 
                            LPANY_perc, LPALL_perc)
  
  
}

stat_MATH_file <- "country_stat_MATH.csv"
stat_READ_file <- "country_stat_READ.csv"
stat_SCIE_file <- "country_stat_SCIE.csv"

args <- commandArgs(trailingOnly = TRUE)
path <- args[1]
if (!is.na(path)) {
  stat_MATH_file <- paste(path, stat_MATH_file, sep="/")
  stat_READ_file <- paste(path, stat_READ_file, sep="/")
  stat_SCIE_file <- paste(path, stat_SCIE_file, sep="/")
}

write.csv(df_MATH, stat_MATH_file, row.names = FALSE)
write.csv(df_READ, stat_READ_file, row.names = FALSE)
write.csv(df_SCIE, stat_SCIE_file, row.names = FALSE)


msg = paste("Calculated aggregate country statistics are saved in files: ",
            stat_SCIE_file, stat_READ_file, stat_MATH_file)
print(msg)

