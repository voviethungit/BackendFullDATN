const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImagesSchema = new Schema({
  avatar: {
    type: String
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Image", ImagesSchema);
