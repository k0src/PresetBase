#!/usr/bin/env node

import sqlite3 from "sqlite3";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Debug environment variables
console.log("DB_PATH:", process.env.DB_PATH);
console.log("Current working directory:", process.cwd());

const sqlite = sqlite3.verbose();
const dbPath = process.env.DB_PATH;

if (!dbPath) {
  console.error("❌ DB_PATH environment variable is not set");
  process.exit(1);
}

function connectToDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database(dbPath, sqlite.OPEN_READONLY, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log("Connected to database for grid calculation.");
        resolve(db);
      }
    });
  });
}

function queryDatabase(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function getTableColumns(db, tableName) {
  const query = `PRAGMA table_info(${tableName})`;
  const rows = await queryDatabase(db, query);
  return rows
    .filter((row) => row.name.toLowerCase() !== "id") // Exclude ID columns
    .map((row) => ({
      name: row.name,
      type: row.type,
    }));
}

async function getColumnLengthDistribution(db, tableName, columnName) {
  // Get all non-null lengths for statistical analysis
  const query = `
    SELECT LENGTH(COALESCE(${columnName}, '')) as length
    FROM ${tableName}
    WHERE ${columnName} IS NOT NULL AND ${columnName} != ''
    ORDER BY length
  `;

  const rows = await queryDatabase(db, query);
  return rows.map((row) => row.length);
}

function calculateSmartColumnWidth(lengths, columnName) {
  if (lengths.length === 0) {
    return { width: 5, reason: "No data" };
  }

  // Sort lengths for percentile calculations
  const sortedLengths = [...lengths].sort((a, b) => a - b);
  const count = sortedLengths.length;

  // Calculate percentiles to understand distribution
  const p50 = sortedLengths[Math.floor(count * 0.5)]; // Median
  const p75 = sortedLengths[Math.floor(count * 0.75)]; // 75th percentile
  const p90 = sortedLengths[Math.floor(count * 0.9)]; // 90th percentile
  const p95 = sortedLengths[Math.floor(count * 0.95)]; // 95th percentile

  const min = sortedLengths[0];
  const max = sortedLengths[count - 1];
  const mean = lengths.reduce((sum, len) => sum + len, 0) / count;

  // Smart width calculation logic
  let targetWidth;
  let reason;

  // For very consistent data (low variance), use 75th percentile
  const variance = p75 - p50;
  if (variance <= 2) {
    targetWidth = Math.max(p75, 8); // Minimum readable width
    reason = `Consistent data (p75: ${p75})`;
  }
  // For moderate variance, use 85th percentile (between p75 and p90)
  else if (variance <= 10) {
    const p85 = sortedLengths[Math.floor(count * 0.85)];
    targetWidth = Math.max(p85, 8);
    reason = `Moderate variance (p85: ${p85})`;
  }
  // For high variance, cap at 90th percentile to avoid outlier influence
  else if (p90 <= mean * 1.5) {
    targetWidth = Math.max(p90, 10);
    reason = `High variance, using p90 (${p90})`;
  }
  // For extreme outliers, use 75th percentile + small buffer
  else {
    targetWidth = Math.max(p75 + Math.min(variance * 0.3, 10), 12);
    reason = `Extreme outliers detected, using p75+buffer (${Math.round(
      targetWidth
    )})`;
  }

  // Apply column-type specific adjustments
  const columnLower = columnName.toLowerCase();

  // Common patterns and their typical needs
  if (columnLower.includes("name") || columnLower.includes("title")) {
    targetWidth = Math.max(targetWidth, 15); // Names need minimum readable space
  } else if (
    columnLower.includes("description") ||
    columnLower.includes("bio")
  ) {
    targetWidth = Math.min(targetWidth, 40); // Descriptions can be truncated more aggressively
  } else if (columnLower.includes("url") || columnLower.includes("link")) {
    targetWidth = Math.min(targetWidth, 20); // URLs can be shortened
  } else if (columnLower.includes("date") || columnLower.includes("time")) {
    targetWidth = Math.max(Math.min(targetWidth, 12), 10); // Dates are usually consistent
  } else if (columnLower.includes("email")) {
    targetWidth = Math.max(Math.min(targetWidth, 25), 15); // Emails have reasonable max
  }

  return {
    width: Math.round(targetWidth),
    reason,
    stats: { min, max, mean: Math.round(mean), p50, p75, p90, p95, count },
  };
}

function normalizeGridSizes(columnWidths) {
  // Convert absolute widths to proportional fr units
  const totalWidth = columnWidths.reduce((sum, col) => sum + col.width, 0);
  const minFr = 2; // Minimum fr value for readability

  // Calculate initial fr values
  let frValues = columnWidths.map((col) => {
    const fr = Math.max((col.width / totalWidth) * 50, minFr); // Scale to reasonable fr range
    return Math.round(fr);
  });

  // Ensure minimum values and reasonable distribution
  frValues = frValues.map((fr) => Math.max(fr, minFr));

  // If total is too high, scale down proportionally
  const totalFr = frValues.reduce((sum, fr) => sum + fr, 0);
  if (totalFr > 100) {
    frValues = frValues.map((fr) =>
      Math.max(Math.round((fr / totalFr) * 80), minFr)
    );
  }

  return frValues;
}

async function calculateGridForTable(db, tableName) {
  try {
    console.log(`\n📊 Analyzing ${tableName.toUpperCase()}...`);

    const columns = await getTableColumns(db, tableName);
    if (columns.length === 0) {
      console.log(`  No non-ID columns found in ${tableName}`);
      return null;
    }

    const columnAnalysis = [];

    for (const column of columns) {
      const lengths = await getColumnLengthDistribution(
        db,
        tableName,
        column.name
      );
      const analysis = calculateSmartColumnWidth(lengths, column.name);

      columnAnalysis.push({
        name: column.name,
        type: column.type,
        ...analysis,
      });

      console.log(
        `  ${column.name}: ${analysis.width} chars (${analysis.reason})`
      );
    }

    const frValues = normalizeGridSizes(columnAnalysis);
    const gridTemplate = frValues.map((fr) => `${fr}fr`).join(" ");

    return {
      tableName,
      columns: columnAnalysis,
      frValues,
      gridTemplate,
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${tableName}:`, error.message);
    return null;
  }
}

async function calculateOptimalGrids() {
  let db;

  try {
    db = await connectToDatabase();

    console.log("🎯 SMART GRID CALCULATOR");
    console.log("========================");
    console.log("Calculating optimal CSS Grid fr values...\n");

    // Target tables (you can modify this list)
    const targetTables = [
      "songs",
      "artists",
      "albums",
      "synths",
      "presets",
      "genre_tags",
      "users",
    ];

    const results = [];

    for (const tableName of targetTables) {
      const result = await calculateGridForTable(db, tableName);
      if (result) {
        results.push(result);
      }
    }

    // Display final results
    console.log("\n" + "=".repeat(60));
    console.log("🎨 FINAL GRID TEMPLATES");
    console.log("=".repeat(60));

    results.forEach((result) => {
      console.log(`\n${result.tableName.toUpperCase()} Grid:`);
      console.log(result.gridTemplate);

      // Show column mapping
      console.log("Columns:", result.columns.map((col) => col.name).join(", "));
      console.log("Fr values:", result.frValues.join(", "));
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ Grid calculation complete!");
    console.log("\nCopy the grid-template-columns values above into your CSS.");
    console.log(
      "These are optimized to minimize truncation while maintaining even spacing."
    );
  } catch (error) {
    console.error("❌ Grid calculation failed:", error.message);
    process.exit(1);
  } finally {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err.message);
        } else {
          console.log("\nDatabase connection closed.");
        }
      });
    }
  }
}

// Main execution - simplified check
if (process.argv[1].endsWith(import.meta.url.split("/").pop())) {
  console.log("🚀 Starting grid calculator...");
  calculateOptimalGrids().catch(console.error);
}

export default calculateOptimalGrids;
