const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the Post Schema
const postSchema = new Schema({
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Assuming you have a User model
  },
  community_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Community", // Assuming you have a Community model
  },
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
  },
  img_src: {
    type: String,
    default: null,
  },
  vid_src: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: true,
  },
  vote_count: {
    type: Number,
    default: 0,
  },
  comment_count: {
    type: Number,
    default: 0,
  },
  time_of_posting: {
    type: Date,
    default: Date.now,
  },
  parent_comment_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  status_changed_at: {
    type: Date,
  },
  is_deleted: {
    type: Boolean,
  },
});

postSchema.post("findOne", function (doc) {
  if (doc && doc.is_deleted === true) {
    doc.creator_id = undefined;
    doc.text = undefined;
    doc.img_src = undefined;
    doc.vid_src = undefined;
  }
});

//Post model
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
