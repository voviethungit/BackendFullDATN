const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BillsSchema = new Schema({
  car: {
    type: Schema.Types.ObjectId,
    ref: 'cars', 
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  rentStartDate: {
    type: Date,
    required: true
  },
  rentEndDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

BillsSchema.pre('save', async function (next) {
  const car = await this.model('Car').findById(this.car);
  if (car) {
    this.totalAmount = car.price; 
  }
  next();
});

module.exports = mongoose.model("Bill", BillsSchema);
