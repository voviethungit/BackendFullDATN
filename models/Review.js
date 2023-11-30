const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  car:{
    type: Schema.Types.ObjectId,
    ref: "cars",
  },
  content: {
    type: String,
    required: true,
  },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);