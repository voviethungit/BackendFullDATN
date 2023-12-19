const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/User");
const User = mongoose.model("User");
const argon2 = require("argon2");
const verifyToken = require("../middleware/auth");
const jwt = require("jsonwebtoken");

router.get("/get-vnpay", async (req, res) => {
  const vnp_Amount = req.query.vnp_Amount;
  const vnp_OrderInfo = req.query.vnp_OrderInfo;
  const vnp_ResponseCode = req.query.vnp_ResponseCode;
  console.log(vnp_Amount, vnp_OrderInfo, vnp_ResponseCode);

  try {
    const userId = vnp_OrderInfo; 

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "0 tìm thấy user" });
    }

    user.accountBalance += parseInt(vnp_Amount);
    await user.save(); 

    res.redirect("http://localhost:3000/vi-cua-toi");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports = router;
