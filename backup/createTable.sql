PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE `stats` (`id` INTEGER PRIMARY KEY, `timestamp` DATETIME, `generated` DATETIME, `qr_code_scans_today` INTEGER, `manual_entries_today` INTEGER, `people_with_bluetooth_tracing_active_today` INTEGER, `all_time_app_registrations` INTEGER, `all_time_app_registrations_daily_change` VARCHAR(255), `all_time_posters_created` INTEGER, `all_time_posters_created_daily_change` VARCHAR(255), `JSON` VARCHAR(255), `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
COMMIT;
