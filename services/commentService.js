const mongoose = require("mongoose");
const Comment = require("../models/comment");
const { connectToMongoDB } = require("../utils/database");

async function getCommentsByIds(commentId) {
  let filterConditions = {
    $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }],
    user_id: commentId,
  };
  await connectToMongoDB();
  try {
    const comments = await Comment.find(filterConditions)
      .populate("user_id", "username")
      .populate("post_id", "title community_id")
      .populate("parent_comment_id", "user_id");
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

async function getCommentsForPost(postId) {
  try {
    var comments = await Comment.find({ post_id: postId })
      .populate("user_id", "username email profile_picture_src")
      .exec();
    var isComment = false;

    if (comments.length === 0) {
      comments = await Comment.find({ _id: postId })
        .populate("user_id", "username email profile_picture_src")
        .exec();
      isComment = true;
    }

    comments = comments.map((comment) => {
      if (comment.is_deleted) {
        comment.comment_text_body = undefined;
        comment.user_id = undefined;
      }
      return comment;
    });

    const commentMap = new Map(
      comments.map((comment) => [comment._id.toString(), comment])
    );

    function buildNestedCommentTree(comment) {
      const children = comment.child_comment_id
        .map((childId) => commentMap.get(childId.toString()))
        .filter((child) => child)
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((child) => buildNestedCommentTree(child));

      const subcommentCount = children.reduce(
        (count, child) => count + (child.totalSubcomments || 0) + 1,
        0
      );

      return {
        ...comment.toObject(),
        children,
        totalSubcomments: subcommentCount,
      };
    }

    if (isComment) {
      const nestedComments = comments.map((comment) =>
        buildNestedCommentTree(comment)
      );
      return nestedComments;
    } else {
      const nestedComments = comments
        .filter((comment) => !comment.parent_comment_id)
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((comment) => buildNestedCommentTree(comment));
      return nestedComments;
    }
  } catch (error) {
    throw new Error("Error fetching comments: " + error.message);
  }
}

module.exports = {
  getCommentsByIds,
  getCommentsForPost,
};
