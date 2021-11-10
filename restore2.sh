#!/bin/bash

backupFolder="backup/*"


# sqlite3 .data/database.sqlite .dump > database.dump; 

for f in $backupFolder
do
  echo "Processing $f file..."
done
