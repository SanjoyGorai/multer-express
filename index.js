import express from "express";
const app = express();
import multer from "multer";
import fs from "fs";
import path, { dirname, extname } from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

// Use express.json() middleware to parse JSON request bodies
app.use(express.json());
// Get the filename of the current module
const __filename = fileURLToPath(import.meta.url);
// Get the directory name of the current module
const __dirname = dirname(__filename);
// Define the uploads directory
const uploadsDir = path.join(__dirname, "uploads");

// Middleware to check if the uploads directory exists
const checkUploadsFolder = (req, res, next) => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  next(); // Proceed to the next middleware or route handler
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const originalName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    const fileExt = extname(file.originalname);
    const baseName = originalName.replace(fileExt, "");

    // Combine the base name, unique suffix, and file extension
    cb(null, `${baseName}-${uniqueSuffix}${fileExt}`);
  },
});

const uploadStorage = multer({ storage });

app.post(
  "/upload",
  checkUploadsFolder,
  uploadStorage.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.send(req.file);
    res.send(`File uploaded successfully: ${req.file.originalname}`);
  }
);
app.post(
  "/upload/array",
  checkUploadsFolder,
  uploadStorage.array("file"),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }
    // List of uploaded files
    const uploadedFiles = req.files.map((file) => file.filename);
    res
      .status(200)
      .json({ message: "Files uploaded successfully", files: uploadedFiles });
  }
);

app.get("/", (req, res) => {
  res.send({
    name: "Sanjoy Gorai ",
    age: 24,
    phone: 9064619983,
    email: "sanjoygorai@gmail.com",
    address: {
      village: "Dubrajpur",
      pin: 722132,
      sub_district: "Chhatna",
      district: "Bankura",
      state: "West Bengal",
      country: "India",
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Example app listening on port port!", PORT);
});
