df = spark.read.option("header",True)\
    .csv("/Users/nirojpattnaik/Projects/free_company_dataset.csv")

df1 = df.groupBy("country").count()

df.selectExpr("count as tot,country,country||'_free_company_dataset.csv' as filename")

df1.selectExpr("count as tot","country",
               "country||'_free_company_dataset.csv' as filename")\
    .write.option("header",True).csv("company_tot_ds.csv")


df.groupBy("country","industry").count().repartition(1).write.option("header",True).csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_cntry_industry_wise.csv")


df.groupBy("industry").count().repartition(1).write.option("header",True)\
    .csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_industry_wise.csv")



df.groupBy("size").count().repartition(1).write.option("header",True)\
    .csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_size_world.csv")


df.groupBy("country", "size").count().orderBy("country")\
    .repartition(1).write.option("header",True)\
    .csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_size_companies.csv")


df.groupBy("country", "size").count().orderBy("country")\
    .repartition(1).write.option("header",True)\
    .csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_size_companies.csv")


df.groupBy("country", "founded").count().orderBy("country")\
    .repartition(1).write.option("header",True)\
    .csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_founded_companies.csv")

df.groupBy("founded").count().filter("founded is not NULL").orderBy("founded")\
    .repartition(1).write.option("header",True)\
    .csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_founded_world.csv")


df.groupBy("founded","industry").count().filter("founded is not NULL and industry is not NULL").orderBy("founded")\
    .repartition(1).write.option("header",True)\
    .csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_founded_industry_world.csv")

df.groupBy("founded","industry").count().filter("founded is not NULL and industry is not NULL").orderBy("founded")\
    .repartition(1).write.option("header",True)\
    .csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_founded_industry_companies.csv")


from pyspark.sql.window import Window
from pyspark.sql.functions import col, row_number

windowDept = Window.partitionBy("founded").orderBy(col("salary").desc())
df.groupBy("founded","industry")\
    .filter("founded is not NULL and industry is not NULL")\
    .count()\
    .where("")\
    .orderBy("founded")\
    .repartition(1).write.option("header",True)\
    .csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_founded_industry_top10.csv")


from pyspark.sql.window import Window
from pyspark.sql.functions import col, row_number
windowDept = Window.partitionBy("founded").orderBy(col("count").desc())
df.filter("founded is not NULL and industry is not NULL and founded >= 1982 and founded <= 2022")\
   .groupBy("founded","industry").count()\
  .withColumn("row",row_number().over(windowDept)) \
  .filter(col("row") <= 5) \
   .sort(col('founded').desc(), col('count').desc()) \
    .drop("row")\
    .repartition(1).write.option("header", True) \
    .csv("/Users/nirojpattnaik/Projects/NirojUIUC.github.io/data/company_founded_industry_top10.csv")


