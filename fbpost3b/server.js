const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // replace with your MySQL password
  database: "fbpost",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Create table if not exists
db.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image VARCHAR(255),
      subtext TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );  
  `);

// API endpoint to post an image with subtext
app.post("/api/posts", upload.single("image"), (req, res) => {
  const { subtext } = req.body;
  const image = req.file ? req.file.filename : "";

  const query = "INSERT INTO posts (image, subtext) VALUES (?, ?)";
  db.query(query, [image, subtext], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error posting the image." });
    } else {
      res.status(200).json({ message: "Post created successfully!" });
    }
  });
});

// API endpoint to get all posts
app.get("/api/posts", (req, res) => {
  db.query("SELECT * FROM posts ORDER BY created_at DESC", (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error retrieving posts." });
    } else {
      res.status(200).json(results);
    }
  });
});

app.use("/uploads", express.static("uploads"));

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
