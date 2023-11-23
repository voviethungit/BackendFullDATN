const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
userReview: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  Car:{
    type: Schema.Types.ObjectId,
    ref: "cars",
  },
  content: {
    type: String
  }
})

module.exports = mongoose.model("Review", ReviewSchema);