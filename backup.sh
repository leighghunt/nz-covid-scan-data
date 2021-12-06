#!/bin/bash

sqlite3 .data/database.sqlite .dump > database.dump; 


backupFolder="backup"
mkdir -p $backupFolder

# input_start=2021-09-10
input_start=2021-11-29

# input_end=

# After this, startdate and enddate will be valid ISO 8601 dates,
# or the script will have aborted when it encountered unparseable data
# such as input_end=abcd
startdate=$(date -I -d "$input_start") || exit -1
enddate=$(date -I)     || exit -1
enddate=$(date -I -d "$enddate + 1 day")

d="$startdate"
while [ "$d" != "$enddate" ]; do 
  echo $d
  cat database.dump | grep $d > $backupFolder/$d.dump
  d=$(date -I -d "$d + 1 day")

  git add backup/$d.dump

done


# git commit -m'Latest db backup'; git push

