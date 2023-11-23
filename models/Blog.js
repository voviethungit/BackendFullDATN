const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  title: {
    type: String,
    minlength: 20,
    maxlength: 256,
  },
  content: {
    type: String,
    maxlength: 25600,
  },
  imageBlog: {
    type: String
  }
});

module.exports = mongoose.model("Blog", BlogSchema);
