const express = require("express");
const app = express();
const db = require("./db/db");
const path = require("path");

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const homeRoutes = require("./routes/home");
app.use("/", homeRoutes);

const searchRoutes = require("./routes/search");
app.use("/search", searchRoutes);

const songRoutes = require("./routes/song");
app.use("/song", songRoutes);
const synthRoutes = require("./routes/synth");
app.use("/synth", synthRoutes);
const artistsRoutes = require("./routes/artist");
app.use("/artist", artistsRoutes);
const albumsRoutes = require("./routes/album");
app.use("/album", albumsRoutes);

/* Browse Routes */
const browseRoute = require("./routes/browse/browse");
app.use("/browse", browseRoute);
const browseSongsRoute = require("./routes/browse/songs");
app.use("/browse/songs", browseSongsRoute);
const browseArtistsRoute = require("./routes/browse/artists");
app.use("/browse/artists", browseArtistsRoute);
const browseAlbumsRoute = require("./routes/browse/albums");
app.use("/browse/albums", browseAlbumsRoute);
// const browseSynthsRoute = require("./routes/browse/synths");
// app.use("/browse/synths", browseSynthsRoute);
// const browsePresetsRoute = require("./routes/browse/presets");
// app.use("/browse/presets", browsePresetsRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
