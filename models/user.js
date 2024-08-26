const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    iv: { type: String },
    encrypted_data: { type: String },
  },
  selected_interests: {
    type: [String],
    required: true,
  },
  display_name: {
    type: String,
  },
  profile_picture_src: {
    type: String,
  },
  cake_day: {
    type: String,
  },
  about_description: {
    type: String,
  },
  community_ids: {
    type: [String],
    default: [],
  },
  joined_communities: {
    type: [String],
  },
  created_post_ids: {
    type: [String],
    default: [],
  },
  saved_post_ids: {
    type: [String],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
