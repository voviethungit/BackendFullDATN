const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Customer");
require("../models/Car");
const Customer = mongoose.model("Customer");
const Car = mongoose.model("Car");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");

router.post("/create-customer", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { fullName, nameCar,  status, Date, location } = req.body;
    const car = await Car.findById(nameCar);
    const newCustomer = new Customer({
      fullName,
      location,
      nameCar,
      title: car.title,
      status,
      amount: car.price,
      Date,
    });
    await newCustomer.save();
    res.status(201).json({ message: "Khách hàng đã được tạo thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo khách hàng",
      error: error.message,
    });
  }
});

router.get("/get-customer", verifyToken, checkAdmin, async (req, res) => {
  try {
    const customers = await Customer.find({ isDelete: { $ne: 'deleted' } });
    res.status(200).json({ customers });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách khách hàng",
      error: error.message,
    });
  }
});

router.get("/get-customer/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.status(200).json({ customer });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy thông tin khách hàng",
      error: error.message,
    });
  }
});

router.put(
  "/delete-customer/:id",
  verifyToken,
  checkAdmin,
  async (req, res) => {
    const customerId = req.params.id;
    try {
      const customer = await Customer.findById(customerId);
  
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy Khách Hàng",
        });
      }
      if (customer.isDelete === 'deleted') {
        return res.status(400).json({
          success: false,
          message: "Khách Hàng đã được đánh dấu là đã xóa trước đó",
        });
      }
      customer.isDelete = 'deleted';
      const updatedCustomer = await customer.save();
      res.json({
        success: true,
        message: "Khách Hàng đã được đánh dấu là đã xóa",
        category: updatedCustomer,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server" });
    }
  }
);

router.put("/update-customer/:id", verifyToken, checkAdmin, async (req, res) => {
  const customerId = req.params.id;
  try {
    const { fullName, nameCar, status, Date, location } = req.body;
    const car = await Car.findById(nameCar);

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy Khách Hàng",
      });
    }

    if (customer.isDelete === 'deleted') {
      return res.status(400).json({
        success: false,
        message: "Khách Hàng đã bị xóa trước đó",
      });
    }

    customer.fullName = fullName || customer.fullName;
    customer.nameCar = nameCar || customer.nameCar;
    customer.title = car ? car.title : customer.title;
    customer.status = status || customer.status;
    customer.Date = Date || customer.Date;
    customer.location = location || customer.location;
    customer.amount = car ? car.price : customer.amount;

    const updatedCustomer = await customer.save();
    res.json({
      success: true,
      message: "Thông tin Khách Hàng đã được cập nhật",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server" });
  }
});

module.exports = router;
