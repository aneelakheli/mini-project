const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    isbn: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: "text",
    },
    publisherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publisher",
      required: false,
      index: true,
    },
    publishedYear: {
      type: String,
      required: false,
    },
    edition: {
      type: String,
      required: false,
    },
    price: {
      hardCoverPrice: {
        type: Number,
        required: false,
      },
      softCoverPrice: {
        type: Number,
        required: function () {
          return !this.price.hardCoverPrice;
        },
      },
    },
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: false,
      index: true,
    },
    totalSold: {
      type: Number,
      required: true,
      default: 0,
    },
    totalRented: {
      type: Number,
      required: true,
      default: 0,
    },
    coverImage: { type: String, required: false },
    isFeatured: {
      type: Boolean,
      required: true,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    noOfRating: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    publisherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publisher",
      required: false,
      index: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", BookSchema);
module.exports = Book;
