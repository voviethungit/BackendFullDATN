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
    type: Date,
    required: true,
  },
  hinhAnhGiayPhep: {
    type: String,
    required: true,
  },
  sendAt:{
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("VerifyUser", VerifyUsersSchema);
