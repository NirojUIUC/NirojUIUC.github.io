src_path="$1"
dest=${2:-"../data"}
header=`head -1 "$src_path"`
tot_lines=`wc -l "$src_path"|awk '{print $1}'`
src_dir=`dirname "$src_path"`
mkdir -p $dest
[[ $? -ne 0 ]] && echo "In correct dir location. Exiting" && exit 1
SRC_FILE=`basename "$src_path"`
rm -rf *_${SRC_FILE} 2>/dev/null

#for file in *_free_company_dataset.csv
#do
#   echo "country,founded,id,industry,linkedin_url,locality,name,region,size,website" > file
#done
cnt=0
echo "0.00% completed ..."
flag=0
lst_val=0
while read data
do
 let cnt=cnt+1
 percent=`bc <<< "scale=2; $cnt/$tot_lines*100"`
 #echo "${cnt}/${tot_lines}*100=${percent},percent_mod=${percent_mod}"
 cntry=`echo $data|cut -d',' -f1|sed 's:"::g'`
 cntry=$(echo $cntry|sed "s:^ *::g"|sed "s: *$::g")
 if [ "$cntry" != "" ];then
    NFILE="$dest/${cntry}_${SRC_FILE}"
    [[ ! -f "$NFILE" ]] && echo "$header">"$NFILE"
    echo "$data" >>  "$NFILE"
 fi
 curr=${percent%.*}
 [[ $curr -gt $lst_val ]] && echo "${percent}% completed ..."
 lst_val=${percent%.*}
 #[[ $flag -eq 1 && $percent_mod -le 0 ]] && echo "${percent}% completed ..." && flag=1
done<"$src_dir/$SRC_FILE"
