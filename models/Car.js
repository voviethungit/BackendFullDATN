const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require('./Review');
const CarsSchema = new Schema({
  categoryID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  imagePath: {
    type: String,
    default: ""
  },
  image1: {
    type: String,
    default: ""
  },
  image2: {
    type: String,
    default: ""
  },
  image3: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: "Da Nang"
  },
  price: {
    type: Number
  },
  chair: {
    type: Number,
    minlength: 1,
    maxlength: 2,
  },
  fuel: {
    type: String,
  },
  flash: {
    type: String,
    default: "Miễn thế chấp",
   },
   star: {
    type: Number,
  },
   usage: {
    type: String,
    default: "0 Lượt Thuê"
   },
   tax: {
    type: String,
    default: "Đặt xe nhanh"
   },
   tax2: {
    type: String,
    default: "Số tự động"
   },
   status: {
    type: String,
    enum: ['active', 'deleted'],
    default: "active"
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'reviews'
  }]
});

module.exports = mongoose.model("Car", CarsSchema);