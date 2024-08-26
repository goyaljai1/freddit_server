const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  entity_id: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "entity_type",
  },
  status: { type: Number, enum: [-1, 0, 1], required: true },
  user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

voteSchema.pre("save", async function (next) {
  let entity = await mongoose.model("Post").findById(this.entity_id).exec();
  if (entity && entity.status != "approved") {
    return next(new Error("Cannot vote on a post which is not yet approved"));
  }
  next();
});

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
