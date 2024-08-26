const voteService = require("../services/voteService");

async function getVote(req, res) {
  const query = { entity_id: req.params.postId, user_id: req.params.userId };
  const voteStatus = await voteService.findVoteStatus(query);
  if (voteStatus !== null) {
    res.send(voteStatus); // Return as an object for flexibility
  } else {
    res.status(404).send({ message: "Vote not found" });
  }
}

module.exports = {
  getVote,
};
