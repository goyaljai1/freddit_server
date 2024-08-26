const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Controllers
const userController = require("./controller/userController");
const loginController = require("./controller/loginController");
const uploadController = require("./controller/uploadController");
const communityController = require("./controller/communityController");
const postController = require("./controller/postController");
const generalController = require("./controller/generalController");
const commentController = require("./controller/commentController");
const voteController = require("./controller/voteController");

// Middleware
const verifyToken = require("./middleware/authMiddleware");

// Middleware setup
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb" }));

// Routes
app.get("/api/:collection/:id", generalController.getDocumentById);
app.get("/community/post/:id?", communityController.getCommunityByPostId);
app.get("/users/:id?", userController.getUsers);
app.get("/communities/:id?", communityController.getCommunities);
app.get("/comments/:id?", commentController.getCommentsByIds);
app.get("/posts/:post_id/comments", commentController.getComments);
app.get("/getVotes/:postId/:userId", voteController.getVote);
app.get(
  "/getAllDocumentsWithFieldNames/:collectionName",
  generalController.getAllDocumentsWithFieldNames
);
app.get("/profile", verifyToken, userController.getUserProfile);
app.get("/popularCommunities", communityController.getPopularCommunities);
app.get("/post/community/:communityId", postController.findPostsByCommunityId);
app.get("/post/home", verifyToken, postController.findHomePagePosts);
app.get("/post/user/:userId", postController.findPostsByUserId);

app.post("/signUp", userController.createUser);
app.post("/login", loginController.authUser);
app.post("/community", verifyToken, communityController.createCommunity);
app.post("/post", verifyToken, postController.createPost);
app.post("/add/:collection", verifyToken, generalController.createDocument);
app.post(
  "/upload/:type/:entityId",
  verifyToken,
  uploadController.uploadFile,
  (req, res) => {
    if (!req.file && !req.files) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.status(200).json({ message: "File uploaded successfully" });
  }
);
app.post("/api/verify-token", verifyToken, (req, res) => {
  res.status(200).json({ message: "Token is valid", userId: req.user._id });
});

app.put("/updateUserField", verifyToken, userController.updateUserField);
app.put("/update_field", verifyToken, generalController.updateField);

app.delete(
  "/:collectionName/:documentId",
  verifyToken,
  generalController.handleDeleteDocument
);

app.get("/image/:fileType/:fileName", (req, res) => {
  const fileType = req.params.fileType;
  const fileName = req.params.fileName;
  const filepath = path.join(__dirname, `Uploads/${fileType}`, fileName);

  fs.access(filepath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("Image not found");
    }
    res.sendFile(filepath);
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
