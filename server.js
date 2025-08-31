import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("Missing required JWT environment variables");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";
const PROJECT_ROOT = process.env.PROJECT_ROOT || ".";

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  keyGenerator: ipKeyGenerator,
});
app.use("/api/", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { securityHeaders, validateInput } from "./middleware/security.js";

app.use(securityHeaders);
app.use(validateInput);

app.use(express.static(path.join(PROJECT_ROOT, "public")));

if (isProd) {
  app.use(express.static(path.join(PROJECT_ROOT, "client/dist")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "client/dist/index.html"));
  });
}
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
import apiRoutes from "./routes/api/api.js";
app.use("/api", apiRoutes);

// Auth routes
import authRoutes from "./routes/auth/auth.js";
app.use("/api/auth", authRoutes);

// Main routes
import statsRoutes from "./routes/main/stats.js";
app.use("/api/stats", statsRoutes);

import searchRoutes from "./routes/main/search.js";
app.use("/api/search", searchRoutes);

import submitRoute from "./routes/main/submit.js";
app.use("/api/submit", submitRoute);

// Entry routes
import songRoutes from "./routes/entries/song.js";
app.use("/api/song", songRoutes);

import synthRoutes from "./routes/entries/synth.js";
app.use("/api/synth", synthRoutes);

import artistsRoutes from "./routes/entries/artist.js";
app.use("/api/artist", artistsRoutes);

import albumsRoutes from "./routes/entries/album.js";
app.use("/api/album", albumsRoutes);

// Browse routes
import browseSongsRoute from "./routes/main/browse/songs.js";
app.use("/api/browse/songs", browseSongsRoute);

import browseArtistsRoute from "./routes/main/browse/artists.js";
app.use("/api/browse/artists", browseArtistsRoute);

import browseAlbumsRoute from "./routes/main/browse/albums.js";
app.use("/api/browse/albums", browseAlbumsRoute);

import browseSynthsRoute from "./routes/main/browse/synths.js";
app.use("/api/browse/synths", browseSynthsRoute);

import browsePresetsRoute from "./routes/main/browse/presets.js";
app.use("/api/browse/presets", browsePresetsRoute);

import browseGenresRoutes from "./routes/main/browse/genres.js";
app.use("/api/browse/genres", browseGenresRoutes);

// Admin routes
import adminRoute from "./routes/admin/admin.js";
app.use("/api/admin", adminRoute);

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
