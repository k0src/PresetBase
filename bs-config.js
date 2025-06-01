const browserSync = require("browser-sync").create();

browserSync.init({
  proxy: "http://localhost:3000",
  files: ["public/**/*.*", "views/**/*.ejs", "routes/**/*.js"],
  port: 4000,
  open: false,
  notify: false,
});
