import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";
import passport from "./config/passport.js";
import { bandwidthGuard } from "./middleware/bandwidth-guard.js";

import * as Routes from "./routes/index.js";

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("Missing required JWT environment variables");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";
const PROJECT_ROOT = process.env.PROJECT_ROOT || ".";

app.use(bandwidthGuard);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  keyGenerator: ipKeyGenerator,
});
app.use("/api/", limiter);

// Session configuration for passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

app.use("/api", Routes.apiRoutes);
app.use("/api/auth", Routes.authRoutes);
app.use("/api/admin", Routes.adminRoutes);

app.use("/api/stats", Routes.statsRoutes);

app.use("/api/album", Routes.albumRoutes);
app.use("/api/artist", Routes.artistRoutes);
app.use("/api/song", Routes.songRoutes);
app.use("/api/synth", Routes.synthRoutes);

app.use("/api/browse/albums", Routes.browseAlbumsRoutes);
app.use("/api/browse/artists", Routes.browseArtistsRoutes);
app.use("/api/browse/genres", Routes.browsGenresRoutes);
app.use("/api/browse/presets", Routes.browsePresetsRoutes);
app.use("/api/browse/songs", Routes.browseSongsRoutes);
app.use("/api/browse/synths", Routes.browseSynthsRoutes);

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
