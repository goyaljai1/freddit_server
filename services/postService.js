const { connectToMongoDB } = require("../utils/database");
const Post = require("../models/post");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const getLoggedInUserId = require("../utils/getLoggedInUserId");
async function createPost(postData) {
  await connectToMongoDB();
  try {
    const newpost = new Post(postData);
    const savedpost = await newpost.save();
    return savedpost;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

async function getPostById(id, req, res) {
  await connectToMongoDB();

  try {
    const Post = mongoose.model("Post");
    const document = await Post.findById(id).exec();

    if (!document) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Use getLoggedInUserId to get the user ID from the token
    let loggedInUserId = null;
    try {
      loggedInUserId = await getLoggedInUserId(req);
    } catch (err) {
      return res.status(401).json({ message: err.message });
    }

    // If no user is logged in, check if the post is approved
    if (!loggedInUserId) {
      if (document.status !== "approved") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      return res.json(document);
    }

    // User is authenticated
    const postCreatorId = document.creator_id;

    // Fetch the community to check if the user is a moderator
    const Community = mongoose.model("Community");
    const community = await Community.findById(document.community_id).exec();

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const moderatorId = community.moderator_id;
    const isModerator = loggedInUserId == moderatorId;
    const isPostCreator = loggedInUserId == postCreatorId;

    // Access control logic
    if (document.status !== "approved" && !(isModerator || isPostCreator)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.json(document);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: `Unable to fetch post: ${error.message}` });
  }
}
getAllPostsWithFieldNames = async (fieldNames) => {
  await connectToMongoDB();
  try {
    const projection = fieldNames.reduce((acc, field) => {
      acc[field] = 1;
      return acc;
    }, {});

    const posts = await Post.find({}, projection).lean();
    return posts;
  } catch (error) {
    console.error("Error retrieving posts:", error);
    throw error;
  }
};
module.exports = {
  getPostById,
  createPost,
  getAllPostsWithFieldNames,
};
