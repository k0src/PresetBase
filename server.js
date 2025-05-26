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

const searchRoutes = require("./routes/search");
app.use("/search", searchRoutes);

const songRoutes = require("./routes/songs");
app.use("/song", songRoutes);
const synthRoutes = require("./routes/synths");
app.use("/synth", synthRoutes);
const artistsRoutes = require("./routes/artists");
app.use("/artist", artistsRoutes);
const albumsRoutes = require("./routes/albums");
app.use("/album", albumsRoutes);
const homeRoutes = require("./routes/home");
app.use("/", homeRoutes);

const browseRoute = require("./routes/browse");
app.use("/browse", browseRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
