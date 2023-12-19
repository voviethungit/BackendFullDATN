const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomersSchema = new Schema({
  fullName: {
    type: String
  },
  nameCar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cars', 
    required: true
  },
  location: {
    type: String
  },
  title :{
    type: String,
  },
  status: {
    type: String,
    enum: ['success', 'false', 'waiting'],
  },
  amount: {
    type: Number
  },
  Date: {
    type: String
  },
  isDelete: {
    type: String,
    default: "active",
    enum: ['active', 'deleted'],
  }
});

module.exports = mongoose.model("Customer", CustomersSchema);
