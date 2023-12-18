const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VerifyUsersSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  soGPLX: {
    type: String,
    required: true,
  },
  hoTen: {
    type: String,
    required: true,
  },
  ngaySinh: {
    type: String,
    required: true,
  },
  hinhAnhGiayPhep: {
    type: String,
  },
  sendAt:{
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "Chờ Xác Nhận"
  }
});

module.exports = mongoose.model("VerifyUser", VerifyUsersSchema);
