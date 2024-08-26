const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const communitySchema = new Schema({
  community_name: { type: String, required: true },
  display_name: { type: String },
  members_ids: { type: [String] },
  description: { type: String, required: true },
  topics: { type: [String], required: true },
  guidelines: { type: [String], required: true },
  banner_img_src: { type: String },
  icon_img_src: { type: String },
  members_count: { type: Number, default: 1 },
  community_type: { type: String, required: true },
  moderator_id: { type: String, required: true },
  post_ids: { type: [String] },
});

const Community = mongoose.model("Community", communitySchema);

module.exports = Community;
