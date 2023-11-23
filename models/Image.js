const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImagesSchema = new Schema({
avatar: {
type: String,
},
userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
})

module.exports = mongoose.model("Image", ImagesSchema);