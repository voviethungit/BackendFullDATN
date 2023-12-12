const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiscountsSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
      },
      discountRate: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
},{ timestamps: true });

module.exports = mongoose.model("Discount", DiscountsSchema);
