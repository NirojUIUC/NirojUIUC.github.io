#set -x
SRC_FILE=free_company_dataset.csv00
rm -rf *_${SRC_FILE} 2>/dev/null

#for file in *_free_company_dataset.csv
#do
#   echo "country,founded,id,industry,linkedin_url,locality,name,region,size,website" > file
#done
tot_lines=`wc -l $SRC_FILE|awk '{print $1}'`
cnt=0
echo "0.00% completed ..."
flag=0
lst_val=0
while read data
do
 let cnt=$cnt+1
 percent=`bc <<< "scale=2; $cnt/$tot_lines*100"`
 let percent_mod=$percent%10
 #echo "${cnt}/${tot_lines}*100=${percent},percent_mod=${percent_mod}"
 cntry=`echo $data|cut -d',' -f1|sed 's:"::g'`
 cntry=$(echo $cntry|sed "s:^ *::g"|sed "s: *$::g")
 if [ "$cntry" != "" ];then
    NFILE="${cntry}_${SRC_FILE}"
    [[ ! -f "$NFILE" ]] && echo "country,founded,id,industry,linkedin_url,locality,name,region,size,website">"$NFILE"
    echo "$data" >>  "$NFILE"
 fi
 curr=${percent%.*}
 [[ $curr -gt $lst_val ]] && echo "${percent}% completed ..."
 lst_val=${percent%.*}
 #[[ $flag -eq 1 && $percent_mod -le 0 ]] && echo "${percent}% completed ..." && flag=1
done<"$SRC_FILE"
