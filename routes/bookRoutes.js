const express = require("express");
const { check, query, oneOf } = require("express-validator");
const router = express.Router();
const {
  getAllBookController,
  getOneBookController,
  addBookController,
} = require("../controllers/book.Controller");
const multer = require("multer");
const { validator, validate } = require("../middleware/validators");
const { uploadImages } = require("../middleware/multer");

const checkWithFeatured = () => {
  return [
    query("featured", "featured be boolean").optional().isBoolean().toBoolean(),
  ];
};

const checkCategory = () => {
  return [
    check("categories", "categories should be MongoId").optional().toArray(),
    check("categories.*").isMongoId(),
  ];
};

const checkAuthors = () => {
  return [
    check("authors", "Authors should be array").optional().toArray(),
    check("authors.*").isMongoId(),
  ];
};

const checkPrice = () => {
  return [
    oneOf([
      check("hardCoverPrice", "Invalid Hard Cover Price") //this is boolean
        .isNumeric()
        .toFloat()
        .custom((price) => {
          if (price < 0) {
            return Promise.reject("Price cannot be negative");
          }
          return Promise.resolve("");
        }),
      check("softCoverPrice", "Invalid Discount")
        .isNumeric()
        .toFloat()
        .custom((price) => {
          if (price < 0) {
            return Promise.reject("Price cannot be negative");
          }
          return Promise.resolve("");
        }),
    ]),
  ];
};

router.get(
  "/",
  validate(["page"]),
  checkWithFeatured(),
  validator,
  getAllBookController
);

router.get(
  "/:bookId",
  validate(["page"]),
  validate(["bookId"]),
  validator,
  getOneBookController
);

//#endregion

//post
//#region
router.post(
  "/",
  uploadImages({
    path: DIRECTORIES.BOOK,
    multi: false,
    singleName: "coverImage",
    secondaryPath: "/book",
  }),
  // validate(["isbn"]),
  checkCategory(),
  checkAuthors(),
  checkPrice(),
  validateBookData(["name"]),
  validator,
  checkValidation(),
  isUserType(USERTYPES.ADMIN),
  addBookController
);

module.exports = router;
