const express = require("express");
const app = express();
const db = require("./db/db");
const path = require("path");

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ------------------------------- Main routes ------------------------------ */
app.get("/", (req, res) => {
  res.render("static/index", { PATH_URL: "home" });
});

const searchRoutes = require("./routes/search");
app.use("/search", searchRoutes);
const submitRoute = require("./routes/submit");
app.use("/submit", submitRoute);

/* ------------------------------ Entry routes ------------------------------ */

const songRoutes = require("./routes/song");
app.use("/song", songRoutes);
const synthRoutes = require("./routes/synth");
app.use("/synth", synthRoutes);
const artistsRoutes = require("./routes/artist");
app.use("/artist", artistsRoutes);
const albumsRoutes = require("./routes/album");
app.use("/album", albumsRoutes);

/* ------------------------------ Browse Routes ----------------------------- */

const browseRoute = require("./routes/browse/browse");
app.use("/browse", browseRoute);
const browseSongsRoute = require("./routes/browse/songs");
app.use("/browse/songs", browseSongsRoute);
const browseArtistsRoute = require("./routes/browse/artists");
app.use("/browse/artists", browseArtistsRoute);
const browseAlbumsRoute = require("./routes/browse/albums");
app.use("/browse/albums", browseAlbumsRoute);
const browseSynthsRoute = require("./routes/browse/synths");
app.use("/browse/synths", browseSynthsRoute);
const browsePresetsRoute = require("./routes/browse/presets");
app.use("/browse/presets", browsePresetsRoute);

const popularRoute = require("./routes/browse/popular");
app.use("/browse/popular", popularRoute);
const hotRoute = require("./routes/browse/hot");
app.use("/browse/hot", hotRoute);
const recentlyAddedRoute = require("./routes/browse/recent");
app.use("/browse/recent", recentlyAddedRoute);

/* ------------------------------ Admin routes ------------------------------ */

const adminRoute = require("./routes/admin");
app.use("/admin", adminRoute);

/* ----------------------------------- 404 ---------------------------------- */

app.use((req, res) => {
  res.status(404).render("static/404", { PATH_URL: "404" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
