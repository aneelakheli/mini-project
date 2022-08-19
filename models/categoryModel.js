const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: "text",
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamp: true }
);

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
