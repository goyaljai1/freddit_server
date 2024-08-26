const postService = require("../services/postService");
const Post = require("../models/post");
const User = require("../models/user");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const getLoggedInUserId = require("../utils/getLoggedInUserId");
async function createPost(req, res) {
  const postData = req.body;

  try {
    const newPost = await postService.createPost(postData);
    res.status(201).send(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).send(error);
  }
}

async function getAllPostsWithFieldNames(req, res) {
  try {
    const fieldNames = req.query.fields ? req.query.fields.split(",") : []; // Get the field names from query parameters
    const posts = await postService.getAllPostsWithFieldNames(fieldNames);
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: "Error retrieving posts", error });
  }
}

async function findPostsByCommunityId(req, res) {
  try {
    const { communityId } = req.params;
    const Community = mongoose.model("Community");
    const community = await Community.findById(communityId).exec();
    const loggedInUserId = await getLoggedInUserId(req);
    let filterConditions = {
      $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }],
      community_id: communityId,
    };
    if (loggedInUserId !== community.moderator_id) {
      filterConditions.status = "approved";
    }

    const posts = await Post.find(filterConditions).populate(
      "creator_id",
      "username profile_picture_src"
    );

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function findPostsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const loggedInUserId = await getLoggedInUserId(req);
    let filterConditions = {
      $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }],
      creator_id: userId,
    };

    if (loggedInUserId === userId) {
    } else {
      filterConditions.status = "approved";
    }
    const posts = await Post.find(filterConditions).populate(
      "community_id",
      "community_name icon_img_src"
    );
    const postsWithTempUser = posts.map((post) => ({
      ...post.toObject(),
      tempUser: post.creator_id,
    }));
    res.json(postsWithTempUser);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function findHomePagePosts(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const skip = parseInt(req.query.skip) || 0;
    const sortBasedOn = req.query.sortBasedOn || "recency";

    let posts;

    const filterConditions = {
      status: "approved",
      $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }],
    };

    if (sortBasedOn === "popularity") {
      posts = await getPopularPosts(limit, skip, filterConditions);
    } else {
      posts = await getRecentPosts(limit, skip, req.user);
    }

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
}

async function getPopularPosts(limit, skip, filterConditions) {
  const currentTime = new Date();
  const allPosts = await Post.aggregate([
    {
      $match: filterConditions,
    },
    {
      $addFields: {
        popularityScore: {
          $divide: [
            {
              $add: [
                { $multiply: [1.2, "$vote_count"] },
                { $multiply: [1.35, "$comment_count"] },
              ],
            },
            {
              $divide: [
                { $subtract: [currentTime, "$time_of_posting"] },
                3600000,
              ],
            },
          ],
        },
      },
    },
    { $sort: { popularityScore: -1 } },
  ]);

  // Aadd pagination
  const paginatedPosts = allPosts.slice(skip, skip + limit);

  // Populate additional fields
  const populatedPosts = await Post.populate(paginatedPosts, [
    {
      path: "community_id",
      select: "community_name icon_img_src",
      model: "Community",
    },
  ]);

  return populatedPosts;
}

async function getRecentPosts(limit, skip, user) {
  let userWithCommunities;
  let joinedCommunityPosts = [];
  let otherPosts = [];
  const filterConditions = {
    status: "approved",
    $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }],
  };

  if (user) {
    userWithCommunities = await User.findById(user._id).select(
      "joined_communities"
    );
    if (
      userWithCommunities &&
      userWithCommunities.joined_communities.length > 0
    ) {
      joinedCommunityPosts = await Post.find({
        ...filterConditions,
        community_id: { $in: userWithCommunities.joined_communities },
      })
        .sort({ time_of_posting: -1 })
        .exec();
    }
  }

  // Get posts from other communities (excluding those already fetched)
  const excludedCommunityIds = userWithCommunities
    ? userWithCommunities.joined_communities
    : [];
  otherPosts = await Post.find({
    ...filterConditions,
    community_id: { $nin: excludedCommunityIds },
  })
    .sort({ time_of_posting: -1 })
    .exec();

  // send joined community posts first
  const allPosts = [...joinedCommunityPosts, ...otherPosts];

  // Pagination
  const paginatedPosts = allPosts.slice(skip, skip + limit);

  const populatedPosts = await Post.populate(paginatedPosts, [
    {
      path: "community_id",
      select: "community_name icon_img_src",
      model: "Community",
    },
  ]);

  return populatedPosts;
}

module.exports = {
  createPost,
  getAllPostsWithFieldNames,
  findPostsByCommunityId,
  findPostsByUserId,
  findHomePagePosts,
};
