#!/bin/bash

backupFolder="backup/*.dump"


sqlite3 .data/database.sqlite .dump > database.dump; 

for f in $backupFolder
do
  echo "Processing $f file..."
  sqlite3 .data/database.sqlite .dump > database.dump; 

done
