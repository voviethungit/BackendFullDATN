const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");

router.post('/payment', async( req, res) => {
    const { amount, language, bankCode} = req.body;
    try {
        res.json({ success: true, message: amount, language, bankCode });
        console.log(req.body);
    } catch (error) {
        console.log(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server!" });
    }
});

module.exports = router;