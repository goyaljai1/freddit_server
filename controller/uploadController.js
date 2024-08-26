const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    const baseDir = path.resolve(__dirname, "../Uploads");
    if (req.params.type === "profilePicture") {
      uploadPath = path.join(baseDir, "profilePictures");
    } else if (req.params.type === "singleImagePost") {
      uploadPath = path.join(baseDir, "singleImagePost");
    } else if (req.params.type === "multipleImagesPost") {
      uploadPath = path.join(baseDir, "multipleImagesPosts");
    } else if (req.params.type === "singleVideoPost") {
      uploadPath = path.join(baseDir, "singleVideoPost");
    } else if (req.params.type === "communityBanner") {
      uploadPath = path.join(baseDir, "communityBanner");
    } else if (req.params.type === "communityIcon") {
      uploadPath = path.join(baseDir, "communityIcon");
    }

    fs.ensureDir(uploadPath)
      .then(() => cb(null, uploadPath))
      .catch((err) => {
        console.error("Error creating directory:", err);
        cb(err);
      });
  },
  filename: (req, file, cb) => {
    if (req.params.type === "profilePicture") {
      const entityId = req.params.entityId;
      const fileExtension = path.extname(file.originalname);
      const filename = `avatar_${entityId}${fileExtension}`;
      cb(null, filename);
    } else if (req.params.type === "communityIcon") {
      const entityId = req.params.entityId;
      const fileExtension = path.extname(file.originalname);
      const filename = `communityIcon_${entityId}${fileExtension}`;
      cb(null, filename);
    } else if (req.params.type === "communityBanner") {
      const entityId = req.params.entityId;
      const fileExtension = path.extname(file.originalname);
      const filename = `communityBanner_${entityId}${fileExtension}`;
      cb(null, filename);
    } else if (req.params.type === "singleImagePost") {
      const entityId = req.params.entityId;
      const fileExtension = path.extname(file.originalname);
      const filename = `post_${entityId}${fileExtension}`;
      cb(null, filename);
    } else if (req.params.type === "singleVideoPost") {
      const entityId = req.params.entityId;
      const fileExtension = path.extname(file.originalname);
      const filename = `post_${entityId}${fileExtension}`;
      cb(null, filename);
    } else {
      cb(new Error("Invalid upload type"), null);
    }
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Define the uploadFile function
const uploadFile = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File size should not exceed 10 MB." });
      }
      return res.status(500).json({ error: "File upload failed." });
    }

    res.status(200).json({ message: "File uploaded successfully." });
  });
};

module.exports = {
  uploadFile,
};
