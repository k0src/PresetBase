const fs = require("fs").promises;
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const projectRoot = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(projectRoot, ".env") });
const dbPath = path.resolve(projectRoot, process.env.DB_PATH);

function connectToDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log("Connected to the SQLite database.");
        resolve(db);
      }
    });
  });
}

function dbGet(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function getAllUsedImageFiles(db) {
  const usedFiles = new Set();

  const tables = ["albums", "artists", "songs", "synths"];

  for (const table of tables) {
    try {
      const rows = await dbGet(
        db,
        `SELECT image_url FROM ${table} WHERE image_url IS NOT NULL AND image_url != ''`
      );
      rows.forEach((row) => {
        if (row.image_url) {
          usedFiles.add(row.image_url);
        }
      });
      console.log(`Found ${rows.length} image files in ${table} table`);
    } catch (error) {
      console.error(`Error querying ${table}:`, error.message);
    }
  }

  return usedFiles;
}

async function getAllUsedAudioFiles(db) {
  const usedFiles = new Set();

  try {
    const rows = await dbGet(
      db,
      `SELECT audio_url FROM song_presets WHERE audio_url IS NOT NULL AND audio_url != ''`
    );
    rows.forEach((row) => {
      if (row.audio_url) {
        usedFiles.add(row.audio_url);
      }
    });
    console.log(`Found ${rows.length} audio files in song_presets table`);
  } catch (error) {
    console.error("Error querying song_presets:", error.message);
  }

  return usedFiles;
}

async function getFilesInDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);
        return { name: file, isFile: stat.isFile(), path: filePath };
      })
    );
    return fileStats.filter((item) => item.isFile);
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
    return [];
  }
}

async function deleteUnusedFiles(dirPath, allFiles, usedFiles, fileType) {
  const unusedFiles = [];
  let totalSize = 0;

  for (const file of allFiles) {
    if (!usedFiles.has(file.name)) {
      try {
        const stats = await fs.stat(file.path);
        totalSize += stats.size;
        unusedFiles.push(file.name);

        await fs.unlink(file.path);
        console.log(`Deleted unused ${fileType}: ${file.name}`);
      } catch (error) {
        console.error(`Error deleting ${file.path}:`, error.message);
      }
    }
  }

  return { count: unusedFiles.length, size: totalSize, files: unusedFiles };
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function cleanupUnusedFiles() {
  let db;

  try {
    db = await connectToDatabase();

    const projectRoot = path.resolve(__dirname, "..");
    const imageDir = path.join(
      projectRoot,
      "public",
      "uploads",
      "images",
      "approved"
    );
    const audioDir = path.join(
      projectRoot,
      "public",
      "uploads",
      "audio",
      "approved"
    );

    const [usedImageFiles, usedAudioFiles] = await Promise.all([
      getAllUsedImageFiles(db),
      getAllUsedAudioFiles(db),
    ]);

    console.log(`Found ${usedImageFiles.size} used image files in database`);
    console.log(`Found ${usedAudioFiles.size} used audio files in database`);

    const [imageFiles, audioFiles] = await Promise.all([
      getFilesInDirectory(imageDir),
      getFilesInDirectory(audioDir),
    ]);

    console.log(`Found ${imageFiles.length} image files in ${imageDir}`);
    console.log(`Found ${audioFiles.length} audio files in ${audioDir}`);

    const [imageCleanup, audioCleanup] = await Promise.all([
      deleteUnusedFiles(imageDir, imageFiles, usedImageFiles, "image file"),
      deleteUnusedFiles(audioDir, audioFiles, usedAudioFiles, "audio file"),
    ]);

    const totalFilesDeleted = imageCleanup.count + audioCleanup.count;
    const totalSizeFreed = imageCleanup.size + audioCleanup.size;

    console.log("\nCleanup Summary:");
    console.log(`Images deleted: ${imageCleanup.count}`);
    console.log(`Audio files deleted: ${audioCleanup.count}`);
    console.log(`Total files deleted: ${totalFilesDeleted}`);
    console.log(`Total space freed: ${formatBytes(totalSizeFreed)}`);

    if (totalFilesDeleted === 0) {
      console.log("No unused files found");
    } else {
      console.log("Cleanup completed successfully");
    }
  } catch (error) {
    console.error("Cleanup failed:", error.message);
    process.exit(1);
  } finally {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err.message);
        } else {
          console.log("Database connection closed.");
        }
      });
    }
  }
}

if (require.main === module) {
  cleanupUnusedFiles();
}

module.exports = cleanupUnusedFiles;
