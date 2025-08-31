import multer from "multer";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";
const MAX_FILE_SIZE =
  parseInt(process.env.MAX_FILE_SIZE, 10) || 1024 * 1024 * 8;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isAudio = file.mimetype === "audio/mpeg";

    if (isImage) {
      cb(null, `${UPLOAD_DIR}/images/pending`);
    } else if (isAudio) {
      cb(null, `${UPLOAD_DIR}/audio/pending`);
    } else {
      cb(new Error("Unsupported file type"), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${nanoid()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isImage = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
  ].includes(file.mimetype);

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
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export default upload.any();
