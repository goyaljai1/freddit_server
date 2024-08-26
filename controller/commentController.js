const commentService = require("../services/commentService.js");

async function getCommentsByIds(req, res) {
  const commentId = req.params.id;

  try {
    const comments = await commentService.getCommentsByIds(commentId);
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send(error);
  }
}

async function getComments(req, res) {
  const { post_id } = req.params;

  try {
    const comments = await commentService.getCommentsForPost(post_id);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getCommentsByIds,
  getComments,
};
