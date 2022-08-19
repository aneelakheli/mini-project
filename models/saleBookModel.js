const mongoose = require("mongoose");
const { BOOKTYPES, CONDITIONOFBOOKS, BOOKACTION } = require("./constants");

const SaleBookSchema = mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    index: true,
  },
  condition: {
    type: String,
    trim: true,
    enum: Object.values(CONDITIONOFBOOKS),
  },
  type: {
    type: String,
    trim: true,
    enum: Object.values(BOOKTYPES),
  },
  action: {
    type: String,
    trim: true,
    enum: Object.values(BOOKACTION),
  },
  count: {
    type: String,
    trim: true,
    required: false,
  },
  price: {
    type: Number,
    required: false,
  },
  remarks: {
    type: String,
    required: false,
  },
});

const SaleBook = mongoose.model("SaleBook", SaleBookSchema);
module.exports = SaleBook;
