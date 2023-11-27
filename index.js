require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const crypto = require('crypto');
const mongoose = require("mongoose");
const authRouter = require("./routes/Auth");
const carRouter = require("./routes/Car");
const userRouter = require("./routes/User");
const reviewRouter = require("./routes/Review");
const blogRouter = require("./routes/Blog");
const categoryRouter = require("./routes/Category");
const paymentRouter = require("./routes/Payment");
const billRouter = require("./routes/Bill");
const verifyUserRouter = require("./routes/VerifyUser");
// Khai báo database
const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.pv6rkef.mongodb.net/GOODCAR?retryWrites=true&w=majority`
    );
    console.log("Connect DB Thanh Cong");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
connectDB();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));


// API AUTH
app.use("/", authRouter);

// API CAR
app.use("/", carRouter);

// API USER DETAILS
app.use("/", userRouter);

// API COMMENT
app.use("/", reviewRouter);


// API BLOG
app.use("/", blogRouter);

// API CATEGORY
app.use("/", categoryRouter);

// API THANH TOAN VNPAY
app.use("/", paymentRouter);

// API HOA DON
app.use("/", billRouter);

// API GPLX
app.use("/", verifyUserRouter);

// API SERVER
app.listen(process.env.PORT, () => {
  console.log(
    `Server dang chay tai PORT : http://localhost:${process.env.PORT}/`
  );
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});