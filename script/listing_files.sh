#!/bin/sh
>company_dataset_list.csv
for file in *_free_company_dataset.csv
do
c=`wc -l "$file"|awk '{print $1}'`
name="`echo "$file"|cut -d'_' -f1`"
echo "$c,$name,$file" >> ../data/company_dataset_list.csv
done