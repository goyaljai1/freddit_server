const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  post_id: { type: Schema.Types.ObjectId, required: true, ref: "Post" },
  parent_comment_id: { type: Schema.Types.ObjectId, ref: "Comment" },
  child_comment_id: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  comment_text_body: { type: String, required: true },
  vote_count: { type: Number, default: 0 },
  user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  level: { type: Number, required: true },
  updatedAt: { type: Date },
  is_deleted: { type: Boolean },
});

commentSchema.pre("save", async function (next) {
  let entity = await mongoose.model("Post").findById(this.entity_id).exec();
  if (entity && entity.status != "approved") {
    return next(
      new Error("Cannot comment on a post which is not yet approved")
    );
  }
  next();
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
