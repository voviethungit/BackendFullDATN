const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteCarsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  favoriteCars: [{
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true, 
  }],
  title :{
    type: String,
  },
  imagePath: {
    type: String,
  },
  price : {
    type: Number
  }
});

module.exports = mongoose.model("Favorite", favoriteCarsSchema );