import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { pathToFileURL } from "url";
import { createWriteStream } from "fs";
import archiver from "archiver";
import extract from "extract-zip";

dotenv.config();

const projectRoot = process.env.PROJECT_ROOT || ".";
const uploadsDir = path.join(projectRoot, "public", "uploads");
const backupsDir = path.join(projectRoot, "public", "fs-backups");

async function createZipFromDirectory(sourceDir, outputPath) {
  const output = createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      console.log(`Created zip file: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on("error", (err) => reject(err));
    output.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function extractZipToDirectory(zipPath, targetDir) {
  try {
    await extract(zipPath, { dir: path.resolve(targetDir) });
  } catch (error) {
    throw new Error(`Failed to extract zip: ${error.message}`);
  }
}

export async function backupFileSystem() {
  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/:/g, "-").replace(/\..+/, "");
    const backupFileName = `uploads-backup-${timestamp}.zip`;
    const backupPath = path.join(backupsDir, backupFileName);

    try {
      await fs.access(uploadsDir);
    } catch {
      throw new Error(`Source uploads directory '${uploadsDir}' not found`);
    }

    await fs.mkdir(backupsDir, { recursive: true });

    console.log(`Backing up: ${uploadsDir}`);
    console.log(`Creating: ${backupPath}`);

    await createZipFromDirectory(uploadsDir, backupPath);

    const backupStats = await fs.stat(backupPath);

    console.log("File system backup completed successfully!");
    console.log(`Backup saved to: ${backupPath}`);
    console.log(`Backup size: ${formatBytes(backupStats.size)}`);
  } catch (error) {
    console.error("❌ Backup failed:", error.message);
    process.exit(1);
  }
}

export async function restoreFileSystem() {
  try {
    try {
      await fs.access(backupsDir);
    } catch {
      throw new Error(`Backups directory '${backupsDir}' not found`);
    }

    const files = await fs.readdir(backupsDir);
    const backupFiles = files.filter(
      (file) => file.startsWith("uploads-backup-") && file.endsWith(".zip")
    );

    if (backupFiles.length === 0) {
      throw new Error("No backup files found in backups directory");
    }

    const sortedBackups = backupFiles
      .map((filename) => {
        const match = filename.match(/uploads-backup-(.+)\.zip/);
        if (!match) return null;

        const timestamp = match[1];
        const dateStr = timestamp.replace(
          /T(\d{2})-(\d{2})-(\d{2})/,
          "T$1:$2:$3"
        );
        return { filename, date: new Date(dateStr) };
      })
      .filter((item) => item && !isNaN(item.date.getTime()))
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
      await fs.rm(uploadsDir, { recursive: true, force: true });
    } catch (error) {
      console.log(`Warning removing uploads: ${error.message}`);
    }

    await fs.mkdir(uploadsDir, { recursive: true });

    console.log("Extracting backup...");
    await extractZipToDirectory(backupPath, uploadsDir);

    const restoredStats = await fs.stat(backupPath);

    console.log(`Files restored from: ${backupPath}`);
    console.log(`Backup size: ${formatBytes(restoredStats.size)}`);
  } catch (error) {
    console.error("Restore failed:", error.message);
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error("Error: Exactly one command argument is required");
    process.exit(1);
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case "backup":
      backupFileSystem();
      break;
    case "restore":
      restoreFileSystem();
      break;
    default:
      console.error(`Error: Unknown command '${command}'`);
      console.log("Valid commands: backup, restore");
      process.exit(1);
  }
}
