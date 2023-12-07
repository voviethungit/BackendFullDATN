const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  title: {
    type: String,
    minlength: 10,
    maxlength: 256,
  },
  content: {
    type: String,
    maxlength: 25600,
  },
  imageBlog: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: "active"
  },
  createAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Blog", BlogSchema);
