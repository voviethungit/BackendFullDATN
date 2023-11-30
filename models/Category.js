const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorysSchema = new Schema({
  model: {
    type: String,
    required: true,
    unique: true,
  },
  imageCategory: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: "active"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Category", CategorysSchema);
