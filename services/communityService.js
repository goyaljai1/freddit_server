const { connectToMongoDB } = require("../utils/database");
const Community = require("../models/community");

async function createCommunity(communityData) {
  await connectToMongoDB();
  try {
    const newcommunity = new Community(communityData);
    const savedcommunity = await newcommunity.save();
    return savedcommunity;
  } catch (error) {
    console.error("Error creating community:", error);
    throw error;
  }
}

async function findCommunity(query = {}) {
  await connectToMongoDB();
  try {
    const communities = await Community.find(query);
    return communities;
  } catch (error) {
    console.error("Error finding communities:", error);
    throw error;
  }
}

async function updateCommunityField(communityData) {
  await connectToMongoDB();
  const { id, field, fieldValue, isArray, arrayAction } = communityData;

  try {
    const updateObject = {};

    if (isArray) {
      if (arrayAction === "push") {
        updateObject["$push"] = { [field]: fieldValue };
      } else if (arrayAction === "pop") {
        updateObject["$pull"] = { [field]: fieldValue };
      } else {
        throw new Error("Invalid array action");
      }
    } else {
      updateObject["$set"] = { [field]: fieldValue };
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      updateObject,
      {
        new: true,
      }
    );

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }

    return updatedCommunity;
  } catch (error) {
    console.error("Error updating community field:", error);
    throw error;
  }
}

async function getCommunityByPostId(postId) {
  await connectToMongoDB();
  try {
    const community = await Community.findOne({ post_ids: postId });
    return community;
  } catch (error) {
    console.error("Error fetching community:", error);
    throw error;
  }
}

async function getTopPopularCommunities() {
  await connectToMongoDB();
  try {
    const popularCommunities = await Community.aggregate([
      {
        $project: {
          icon_img_src: 1,
          community_name: 1,
          display_name: 1,
          memberCount: {
            $size: { $ifNull: ["$members_ids", []] },
          },
        },
      },
      {
        $sort: { memberCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return popularCommunities;
  } catch (error) {
    console.error("Error fetching popular communities:", error);
    throw error;
  }
}

module.exports = {
  createCommunity,
  findCommunity,
  updateCommunityField,
  getCommunityByPostId,
  getTopPopularCommunities,
};
