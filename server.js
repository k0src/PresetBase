const express = require("express");
const app = express();
const path = require("path");

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ----------------------------------- API ---------------------------------- */
const apiRoutes = require("./routes/api/api");
app.use("/api", apiRoutes);

/* ------------------------------- Static routes ------------------------------ */
const indexRoutes = require("./routes/static/index");
app.use("/", indexRoutes);

const aboutRoutes = require("./routes/static/about");
app.use("/about-us", aboutRoutes);

app.get("/privacy-policy", (req, res) => {
  res.render("static/privacy-policy", { PATH_URL: "privacy-policy" });
});

/* ------------------------------- Main routes ------------------------------ */
const statsRoutes = require("./routes/main/stats");
app.use("/stats", statsRoutes);
const searchRoutes = require("./routes/main/search");
app.use("/search", searchRoutes);
const submitRoute = require("./routes/main/submit");
app.use("/submit", submitRoute);

/* ------------------------------ Entry routes ------------------------------ */
const songRoutes = require("./routes/entries/song");
app.use("/song", songRoutes);
const synthRoutes = require("./routes/entries/synth");
app.use("/synth", synthRoutes);
const artistsRoutes = require("./routes/entries/artist");
app.use("/artist", artistsRoutes);
const albumsRoutes = require("./routes/entries/album");
app.use("/album", albumsRoutes);

/* ------------------------------ Browse Routes ----------------------------- */
const browseRoute = require("./routes/main/browse");
app.use("/browse", browseRoute);
const browseSongsRoute = require("./routes/main/browse/songs");
app.use("/browse/songs", browseSongsRoute);
const browseArtistsRoute = require("./routes/main/browse/artists");
app.use("/browse/artists", browseArtistsRoute);
const browseAlbumsRoute = require("./routes/main/browse/albums");
app.use("/browse/albums", browseAlbumsRoute);
const browseSynthsRoute = require("./routes/main/browse/synths");
app.use("/browse/synths", browseSynthsRoute);
const browsePresetsRoute = require("./routes/main/browse/presets");
app.use("/browse/presets", browsePresetsRoute);

const browseGenresRoutes = require("./routes/main/browse/genres");
app.use("/browse/genres", browseGenresRoutes);

const popularRoute = require("./routes/main/browse/popular");
app.use("/browse/popular", popularRoute);
const hotRoute = require("./routes/main/browse/hot");
app.use("/browse/hot", hotRoute);
const recentlyAddedRoute = require("./routes/main/browse/recent");
app.use("/browse/recent", recentlyAddedRoute);

/* ------------------------------ Admin routes ------------------------------ */
const adminRoute = require("./routes/admin/admin");
app.use("/admin", adminRoute);

/* ----------------------------------- 404 ---------------------------------- */
app.use((req, res) => {
  res.status(404).render("static/404", { PATH_URL: "404" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
