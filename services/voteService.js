const { connectToMongoDB } = require("../utils/database");
const Vote = require("../models/vote");

async function findVoteStatus(query) {
  await connectToMongoDB();
  try {
    const vote = await Vote.findOne(query);
    if (vote) {
      return { status: vote.status, voteId: vote._id };
    } else {
      return { status: 0, voteId: null };
    }
  } catch (error) {
    console.error("Error finding vote:", error);
    throw error;
  }
}

module.exports = {
  findVoteStatus,
};
