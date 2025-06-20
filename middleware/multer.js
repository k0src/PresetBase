const multer = require("multer");
const path = require("path");
const nanoid = require("nanoid").nanoid;

const MAX_UPLOAD_SIZE = 1024 * 1024 * 8;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isAudio = file.mimetype === "audio/mpeg";

    if (isImage) {
      cb(null, path.join(__dirname, "../public/uploads/images/pending/"));
    } else if (isAudio) {
      cb(null, path.join(__dirname, "../public/uploads/audio/pending/"));
    } else {
      cb(new Error("Unsupported file type"), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, nanoid() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const isImage =
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp";

  const isAudio = file.mimetype === "audio/mpeg";

  if (isImage || isAudio) {
    cb(null, true);
  } else {
    const err = new Error("Invalid file upload.");
    err.name = "ExtensionError";
    cb(err);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter,
});

module.exports = upload.any();
