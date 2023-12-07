const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullName: {
    type: String,
    minlength: 6,
    maxLength: 30,
    required: true
  },
  birthDay:{
    type: String
  },
  sex:{
    type: String,
    default: "Nam",
  },
  Vip:{
    type: String,
    default: "VIP 1"
  },
  phoneNumber: {
    type: Number,
    minlength: 10,
    unique: true,
    required: true
  },
  email: {
    type: String,
    minlength: 5,
    maxLength: 40,
    unique: true,
    required: true
  },
  password: {
    type: String,
    minlength: 6,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"
  },
  isAdmin: {
    type: Boolean,
    default: "false"
  },
  location: {
    type:String,
    default: "Việt Nam"
  },
  status:{
    type: String,
    enum: ["banned", "active"],
    default: "active"
  },
  isVerified:{
    type: String,
    enum: ["Yes", "No"],
    default: "No"
  },
  GPLX:{
    type: String,
  },
  amount: {
    type: Number,
    default: "0"
  },
  linkFB: {
    type: String,
    default: "Chưa Liên Kết"
  }
});
UserSchema.methods.depositAmount = function(amountToDeposit) {
  const amount = parseFloat(amountToDeposit);

  if (isNaN(amount) || amount <= 10000) {
    throw new Error("Số tiền nạp không hợp lệ");
  }

  this.amount += amount; 

  return this.save(); 
};

module.exports = mongoose.model("User", UserSchema);