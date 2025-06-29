const db = require("./db/db");
// Generate random dates between two dates
function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Format date to YYYY-MM-DD HH:MM:SS
function formatDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

// Generate weighted random dates (same logic as before)
function generateRandomDates() {
  const startDate = new Date("2025-05-25");
  const endDate = new Date("2025-06-25");
  const dates = [];

  // Create some "hot" dates where more entries were added
  const hotDates = [
    new Date("2025-05-28"), // Weekend activity
    new Date("2025-06-01"), // Month start
    new Date("2025-06-07"), // Random busy day
    new Date("2025-06-15"), // Mid-month
    new Date("2025-06-22"), // Weekend before end
  ];

  // Add random variance to hot dates and create clusters
  hotDates.forEach((hotDate) => {
    const numEntries = Math.floor(Math.random() * 5) + 2; // 2-6 entries per hot day
    for (let i = 0; i < numEntries; i++) {
      // Add some hours/minutes variance to the hot date
      const variedDate = new Date(hotDate);
      variedDate.setHours(Math.floor(Math.random() * 24));
      variedDate.setMinutes(Math.floor(Math.random() * 60));
      dates.push(variedDate);
    }
  });

  // Add some completely random dates throughout the range
  const randomCount = Math.floor(Math.random() * 20) + 15; // 15-35 random entries
  for (let i = 0; i < randomCount; i++) {
    dates.push(getRandomDate(startDate, endDate));
  }

  // Create some gaps by avoiding certain date ranges
  const gapStart1 = new Date("2025-06-03");
  const gapEnd1 = new Date("2025-06-06");
  const gapStart2 = new Date("2025-06-10");
  const gapEnd2 = new Date("2025-06-13");

  // Filter out dates in gap periods
  const filteredDates = dates.filter((date) => {
    return (
      !(date >= gapStart1 && date <= gapEnd1) &&
      !(date >= gapStart2 && date <= gapEnd2)
    );
  });

  // Sort dates chronologically
  return filteredDates.sort((a, b) => a - b);
}

async function fixTimestampColumn() {
  return new Promise((resolve, reject) => {
    console.log("🗑️  Step 1: Dropping created_at column...");

    // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
    db.serialize(() => {
      // First, get the current table structure
      db.all("PRAGMA table_info(song_presets)", (err, columns) => {
        if (err) {
          console.error("Error getting table info:", err);
          reject(err);
          return;
        }

        // Filter out the created_at column and build the new table structure
        const originalColumns = columns.filter(
          (col) => col.name !== "created_at"
        );
        const columnDefs = originalColumns
          .map((col) => {
            let def = `${col.name} ${col.type}`;
            if (col.notnull) def += " NOT NULL";
            if (col.dflt_value !== null) def += ` DEFAULT ${col.dflt_value}`;
            if (col.pk) def += " PRIMARY KEY";
            return def;
          })
          .join(", ");

        console.log(
          "📋 Original columns (excluding created_at):",
          originalColumns.map((c) => c.name).join(", ")
        );

        // Create a temporary table without created_at
        db.run(`CREATE TABLE song_presets_temp (${columnDefs})`, (err) => {
          if (err) {
            console.error("Error creating temp table:", err);
            reject(err);
            return;
          }

          // Copy data from original table to temp table (excluding created_at)
          const originalColumnNames = originalColumns
            .map((col) => col.name)
            .join(", ");
          db.run(
            `INSERT INTO song_presets_temp SELECT ${originalColumnNames} FROM song_presets`,
            (err) => {
              if (err) {
                console.error("Error copying data to temp table:", err);
                reject(err);
                return;
              }

              // Drop the original table
              db.run("DROP TABLE song_presets", (err) => {
                if (err) {
                  console.error("Error dropping original table:", err);
                  reject(err);
                  return;
                }

                // Rename temp table to original name
                db.run(
                  "ALTER TABLE song_presets_temp RENAME TO song_presets",
                  (err) => {
                    if (err) {
                      console.error("Error renaming temp table:", err);
                      reject(err);
                      return;
                    }

                    console.log("✅ Successfully dropped created_at column");
                    console.log(
                      "🔄 Step 2: Updating timestamp column with random dates..."
                    );

                    // Now get all rows and update their timestamp
                    db.all(
                      "SELECT id FROM song_presets ORDER BY id",
                      (err, rows) => {
                        if (err) {
                          console.error("Error fetching song_presets:", err);
                          reject(err);
                          return;
                        }

                        if (rows.length === 0) {
                          console.log("No song_presets found in database.");
                          db.close();
                          resolve();
                          return;
                        }

                        console.log(
                          `Found ${rows.length} song_presets to update.`
                        );

                        // Generate random dates
                        const randomDates = generateRandomDates();

                        // If we have more presets than dates, generate more dates
                        while (randomDates.length < rows.length) {
                          const startDate = new Date("2025-05-25");
                          const endDate = new Date("2025-06-25");
                          randomDates.push(getRandomDate(startDate, endDate));
                        }

                        // Shuffle the dates array
                        for (let i = randomDates.length - 1; i > 0; i--) {
                          const j = Math.floor(Math.random() * (i + 1));
                          [randomDates[i], randomDates[j]] = [
                            randomDates[j],
                            randomDates[i],
                          ];
                        }

                        // Update each song_preset with a random date in the timestamp column
                        let completed = 0;
                        const total = rows.length;

                        rows.forEach((row, index) => {
                          const randomDate = formatDateTime(
                            randomDates[index % randomDates.length]
                          );

                          db.run(
                            "UPDATE song_presets SET timestamp = ? WHERE id = ?",
                            [randomDate, row.id],
                            function (err) {
                              if (err) {
                                console.error(
                                  `Error updating song_preset ${row.id}:`,
                                  err
                                );
                              } else {
                                console.log(
                                  `Updated song_preset ${row.id} timestamp: ${randomDate}`
                                );
                              }

                              completed++;
                              if (completed === total) {
                                console.log(
                                  `\n✅ Successfully updated ${total} song_presets timestamps!`
                                );

                                // Show some stats
                                db.all(
                                  `
                            SELECT 
                              DATE(timestamp) as date, 
                              COUNT(*) as count 
                            FROM song_presets 
                            WHERE timestamp IS NOT NULL 
                            GROUP BY DATE(timestamp) 
                            ORDER BY date
                          `,
                                  (err, stats) => {
                                    if (!err && stats.length > 0) {
                                      console.log("\n📊 Date distribution:");
                                      stats.forEach((stat) => {
                                        console.log(
                                          `${stat.date}: ${stat.count} entries`
                                        );
                                      });
                                    }

                                    db.close((err) => {
                                      if (err) {
                                        console.error(
                                          "Error closing database:",
                                          err
                                        );
                                        reject(err);
                                      } else {
                                        console.log(
                                          "\n🎉 Database connection closed. Script completed!"
                                        );
                                        resolve();
                                      }
                                    });
                                  }
                                );
                              }
                            }
                          );
                        });
                      }
                    );
                  }
                );
              });
            }
          );
        });
      });
    });
  });
}

// Run the script
console.log("🚀 Starting to fix timestamp column...\n");
fixTimestampColumn()
  .then(() => {
    console.log("Script finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
