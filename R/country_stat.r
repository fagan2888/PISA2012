library(Hmisc)

pisadat <- read.csv("../data/pisadat_all.csv", na.strings = c("", " ", "nan"))


df <- data.frame(CODE=NA, CNT=NA, MATH_mean=NA, MATH_quant_05=NA, 
                MATH_quant_25=NA, MATH_quant_50=NA, MATH_quant_75=NA,
                MATH_quant_95=NA,  READ_mean=NA, READ_quant_05=NA, 
                READ_quant_25=NA, READ_quant_50=NA, READ_quant_75=NA,
                READ_quant_95=NA,  SCIE_mean=NA, SCIE_quant_05=NA, 
                SCIE_quant_25=NA, SCIE_quant_50=NA, SCIE_quant_75=NA,
                SCIE_quant_95=NA)[numeric(0), ]

df_lp <- data.frame(CODE=NA, CNT=NA, MATHLP_perc=NA, READLP_perc=NA, 
                    SCIELP_perc=NA, LPANY_perc=NA, LPALL_perc=NA,
                    MATHLP_notall_perc=NA)[numeric(0), ]

pisadat$MATH_ISLP_notall <- pisadat$MATH_ISLP * (1-pisadat$ISLP_ALL)

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
  
  MATHLP_notall_perc <- wtd.mean(data$MATH_ISLP_notall, weights = data$WEIGHT)
  
  df[nrow(df)+1,] <- c(code, CNT, MATH_mean, MATH_quant, 
                     READ_mean, READ_quant, 
                    SCIE_mean, SCIE_quant)
  
  df_lp[nrow(df_lp)+1,] <- c(code, CNT, MATHLP_perc, READLP_perc, SCIELP_perc,
                             LPANY_perc, LPALL_perc, MATHLP_notall_perc)
  
  
}

df_lp_srt <- df_lp[order(df_lp$LPANY_perc),]

stat_file <- "country_stat.csv"
lp_file <- "country_lp.csv"

args <- commandArgs(trailingOnly = TRUE)
path <- args[1]
if (!is.na(path)) {
  stat_file <- paste(path, stat_file, sep="/")
  lp_file <- paste(path, lp_file, sep="/")
}

write.csv(df, stat_file, row.names = FALSE)
write.csv(df_lp_srt, lp_file, row.names = FALSE)

msg = paste("Calculated aggregate country statistics are saved in file: ",
            stat_file)
print(msg)

