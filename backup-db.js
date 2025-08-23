const fs = require("fs").promises;
const path = require("path");

async function stopDevServer() {
  console.log("Manually stop the dev server (Ctrl+C) before continuing");
  console.log(
    "Press any key once the server is stopped to continue with restore"
  );

  process.stdin.setRawMode(true);
  process.stdin.resume();

  return new Promise((resolve) => {
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      console.log("Restoring database...");
      resolve();
    });
  });
}

async function backupDatabase() {
  try {
    const sourceDb = "./db/presetbase.sqlite";
    const backupsDir = "./db/backups";

    const now = new Date();
    const timestamp = now.toISOString().replace(/:/g, "-").replace(/\..+/, "");

    const backupFileName = `presetbase-backup-${timestamp}.sqlite`;
    const backupPath = path.join(backupsDir, backupFileName);

    try {
      await fs.access(sourceDb);
    } catch (error) {
      throw new Error(`Source database '${sourceDb}' not found`);
    }

    try {
      await fs.mkdir(backupsDir, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }

    await fs.copyFile(sourceDb, backupPath);

    console.log("Database backup completed successfully");
    console.log(`Backup saved to: ${backupPath}`);
    console.log(`Backup size: ${(await fs.stat(backupPath)).size} bytes`);
  } catch (error) {
    console.error("Backup failed:", error.message);
    process.exit(1);
  }
}

async function restoreDatabase() {
  try {
    const sourceDb = "./db/presetbase.sqlite";
    const backupsDir = "./db/backups";

    await stopDevServer();

    try {
      await fs.access(backupsDir);
    } catch (error) {
      throw new Error(`Backups directory '${backupsDir}' not found`);
    }

    const files = await fs.readdir(backupsDir);
    const backupFiles = files.filter(
      (file) =>
        file.startsWith("presetbase-backup-") && file.endsWith(".sqlite")
    );

    if (backupFiles.length === 0) {
      throw new Error("No backup files found in backups directory");
    }

    const sortedBackups = backupFiles
      .map((filename) => {
        const match = filename.match(/presetbase-backup-(.+)\.sqlite/);
        if (!match) return null;

        const timestamp = match[1];
        const dateStr = timestamp.replace(
          /T(\d{2})-(\d{2})-(\d{2})/,
          "T$1:$2:$3"
        );
        return {
          filename,
          timestamp,
          date: new Date(dateStr),
        };
      })
      .filter((item) => item !== null && !isNaN(item.date.getTime()))
      .sort((a, b) => b.date - a.date);

    if (sortedBackups.length === 0) {
      throw new Error(
        "No valid backup files found with proper timestamp format"
      );
    }

    const mostRecentBackup = sortedBackups[0];
    const backupPath = path.join(backupsDir, mostRecentBackup.filename);

    console.log(`Found ${sortedBackups.length} backup(s)`);
    console.log(`Most recent backup: ${mostRecentBackup.filename}`);
    console.log(`Backup date: ${mostRecentBackup.date.toLocaleString()}`);

    try {
      await fs.access(sourceDb);
      await fs.unlink(sourceDb);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw new Error(`Error accessing source database: ${error.message}`);
      }
    }

    await fs.copyFile(backupPath, sourceDb);

    console.log("Database restore completed successfully");
    console.log(`Restored from: ${backupPath}`);
    console.log(`Restored size: ${(await fs.stat(sourceDb)).size} bytes`);
    console.log("Restart the dev server with npm run dev");
  } catch (error) {
    console.error("Restore failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error("Error: Exactly one command argument is required");
    process.exit(1);
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case "backup":
      backupDatabase();
      break;
    case "restore":
      restoreDatabase();
      break;
    default:
      console.error(`Error: Unknown command '${command}'`);
      process.exit(1);
  }
}

module.exports = { backupDatabase, restoreDatabase };
