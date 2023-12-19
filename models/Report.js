const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  report: {
    type: String
  }
});

module.exports = mongoose.model('Report', ReportSchema);
