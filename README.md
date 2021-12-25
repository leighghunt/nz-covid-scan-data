## Ooops - issues 18/19/20 December (ran out of disk space!), so my figures are wrong for these two days



Calls Ministry of Health's API to get daily Covid scanning numbers

Historic figures from [Ministroy of Health](https://www.health.govt.nz/our-work/diseases-and-conditions/covid-19-novel-coronavirus/covid-19-data-and-statistics/covid-19-nz-covid-tracer-app-data),
and then convert CSV to JSON using [CVSJ2JSON](https://csvjson.com/csv2json) until automated.

## Accessing scanning data:

If you'd like to access the (non-authoritative) SQLite data containing scan data since 10 September, it can be found here:
[here](https://github.com/leighghunt/nz-covid-scan-data/tree/main/backup)

## Backup to another instance:

```
backup.sh

```

or:

```
sqlite3 .data/database.sqlite .dump > database.dump; git commit -am'Latest db backup'; git push
```

## Backup from another instance:

`git pull; rm .data/database.sqlite; sqlite3 .data/database.sqlite < database.dump; refresh`

# Welcome to Glitch

Click `Show` in the header to see your app live. Updates to your code will instantly deploy and update live.

**Glitch** is the friendly community where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).

## Your Project

On the front-end,

- edit `public/client.js`, `public/style.css` and `views/index.html`
- drag in `assets`, like images or music, to add them to your project

On the back-end,

- your app starts at `server.js`
- add frameworks and packages in `package.json`
- safely store app secrets in `.env` (nobody can see this but you and people you invite)

## Made by [Glitch](https://glitch.com/)

\ ゜ o ゜)ノ
