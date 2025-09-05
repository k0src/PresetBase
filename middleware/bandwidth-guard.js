import fs from "fs";
import path from "path";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

// Configuration
const BANDWIDTH_FILE = path.join(process.cwd(), "bandwidth.json");
const MAX_BYTES = parseInt(process.env.MAX_BYTES || "107374182400", 10); // 100 GB
const MAX_DAILY_SUBMISSIONS = parseInt(
  process.env.MAX_DAILY_SUBMISSIONS || "600",
  10
);

// Load or initialize usage
let usage = { totalBytes: 0, daily: {} };
if (fs.existsSync(BANDWIDTH_FILE)) {
  try {
    usage = JSON.parse(fs.readFileSync(BANDWIDTH_FILE, "utf-8"));
  } catch {
    usage = { totalBytes: 0, daily: {} };
  }
}

// Helper to persist usage
function saveUsage() {
  try {
    fs.writeFileSync(BANDWIDTH_FILE, JSON.stringify(usage));
  } catch (err) {
    console.error("Failed to save bandwidth usage:", err);
  }
}

// Middleware
export function bandwidthGuard(req, res, next) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if (!usage.daily[today]) usage.daily[today] = 0;

  // Only track POST submissions
  if (req.method === "POST") {
    // Check daily submission limit
    if (usage.daily[today] >= MAX_DAILY_SUBMISSIONS) {
      return res.status(429).send("Daily submission limit reached.");
    }

    // Increment daily submission count
    usage.daily[today] += 1;

    // Track upload size (request body)
    const reqSize = parseInt(req.headers["content-length"] || "0", 10);
    usage.totalBytes += reqSize;

    // Persist usage immediately
    saveUsage();

    // Check if approaching bandwidth limit
    if (usage.totalBytes >= MAX_BYTES) {
      console.error(
        `Bandwidth limit of ${MAX_BYTES} bytes reached. Shutting down server.`
      );
      // Send 503 to current request before shutdown
      res.status(503).send("Server shutting down due to bandwidth limit.");
      setTimeout(() => process.exit(1), 1000);
      return;
    }
  }

  next();
}
