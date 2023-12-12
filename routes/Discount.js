const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Discount");
const Discount = mongoose.model("Discount");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");

// CREATE - Tạo mới Discount
app.post('/discounts', verifyToken, checkAdmin, (req, res) => {
    const { code, discountRate, description } = req.body;
    
    const newDiscount = new Discount({
      code,
      discountRate,
      description,
    });
  
    newDiscount.save()
      .then(savedDiscount => {
        res.status(201).json(savedDiscount); 
      })
      .catch(error => {
        res.status(400).json({ error: 'Không thể tạo mới mã khuyến mãi' });
      });
  });
  
  // READ - Đọc thông tin Discount
  app.get('/discounts', (req, res) => {
    Discount.find()
      .then(allDiscounts => {
        res.status(200).json(allDiscounts); 
      })
      .catch(error => {
        res.status(400).json({ error: 'Không thể đọc thông tin mã khuyến mãi' });
      });
  });
  
  // UPDATE - Cập nhật thông tin Discount
  app.put('/discounts/:id', verifyToken, checkAdmin, (req, res) => {
    const { id } = req.params;
    const { code, discountRate, description } = req.body;
  
    Discount.findByIdAndUpdate(id, { code, discountRate, description }, { new: true })
      .then(updatedDiscount => {
        res.status(200).json(updatedDiscount); 
      })
      .catch(error => {
        res.status(400).json({ error: 'Không thể cập nhật thông tin mã khuyến mãi' });
      });
  });
  
  // DELETE - Xóa Discount
  app.delete('/discounts/:id', verifyToken, checkAdmin, (req, res) => {
    const { id } = req.params;
  
    Discount.findByIdAndDelete(id)
      .then(deletedDiscount => {
        res.status(200).json(deletedDiscount); 
      })
      .catch(error => {
        res.status(400).json({ error: 'Không thể xóa mã khuyến mãi' });
      });
  });

module.exports = router;
