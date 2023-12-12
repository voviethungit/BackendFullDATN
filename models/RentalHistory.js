const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RentalHistorySchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Success", "Fail"],
    default: "Success"
  },
  rentedAt: {
    type: Date,
    default: Date.now,
  },
  isDelete: {
    type: String,
    enum: ["active", "deleted"],
    default: "active",
  }
});

module.exports = mongoose.model('RentalHistory', RentalHistorySchema);
