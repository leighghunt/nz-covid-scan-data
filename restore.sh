#!/bin/bash

backupFolder="backup/*.dump"


# sqlite3 .data/database.sqlite .dump > database.dump; 

mv .data/database.sqlite .data/database.old
cat backup/createTable.sql | sqlite3 .data/database.sqlite

for f in $backupFolder
do
  echo "Processing $f file..."
  cat $f | sqlite3 .data/database.sqlite
done
