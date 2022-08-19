const express = require("express");
const { check, query, oneOf } = require("express-validator");
const router = express.Router();
const {
  getAllBookController,
  getOneBookController,
  addBookController,
  deleteBookController,
  updateBookController,
  updateBookImageController,
  getFeaturedBooksController,
} = require("../controllers/book.Controller");
const multer = require("multer");
const { validator, validate } = require("../middleware/validators");
const { checkValidation } = require("../middleware/userAuthentication");
const { isUserType } = require("../middleware/checkUserTypes");
const { USERTYPES, DIRECTORIES } = require("../models/constants");
const { uploadImages } = require("../middleware/multer");
const {
  addSalesBookController,
  getIndividualBookVendors,
  updateSalesBookController,
  deleteSalesBookController,
  getOneSalesBookController,
  getAllSalesBookController,
  listedBooksController,
  acceptBookController,
} = require("../controllers/salesBook.Controller");
// const getAllVendorBookSellList = require("../controllers/vendorPOVBookBuyList.controller");

//middleware
//#region

const validateBookData = (params) => {
  const result = [];
  params.forEach((param) => {
    switch (param) {
      case "name":
        result.push(
          check("name").notEmpty().withMessage("Name should be required")
        );
        break;
      case "editionNumber":
        result.push(
          check("editionNumber")
            .isNumeric()
            .isLength({ min: 0, max: 7 })
            .withMessage("edition number should be in number")
        );
        break;
    }
  });
  return result;
};

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

const checkRemovedAuthors = () => {
  return [
    check("removedAuthors").optional().toArray(),
    check("removedAuthors.*").isMongoId(),
  ];
};

const checkRemovedCategory = () => {
  return [
    check("removedCategories").optional().toArray(),
    check("removedCategories.*").isMongoId(),
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

//#endregion

//get
//#region
router.get(
  "/",
  validate(["page"]),
  checkWithFeatured(),
  validator,
  getAllBookController
);

router.get("/featured", validator, getFeaturedBooksController);
// router.get("/search", searchBookController);
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

//#endregion

//patch
//#region
router.patch(
  "/:bookId",
  uploadImages({
    path: DIRECTORIES.BOOK,
    multi: false,
    singleName: "coverImage",
  }),
  validate(["bookId"]),
  checkValidation(),
  checkCategory(),
  checkAuthors(),
  checkRemovedCategory(),
  checkRemovedAuthors(),
  isUserType(USERTYPES.ADMIN),
  // validate(["isbn"]),
  validator,
  updateBookController
);
router.patch(
  "/:bookId/image",
  uploadImages({
    path: DIRECTORIES.BOOK,
    multi: false,
    singleName: "coverImage",
  }),
  checkValidation(),
  isUserType(USERTYPES.ADMIN),
  validate(["bookId"]),
  // validate(["isbn"]),
  validator,
  updateBookImageController
);
//#endregion

//delete
//#region
router.delete(
  "/:bookId",
  checkValidation(),
  isUserType(USERTYPES.ADMIN),
  validate(["bookId"]),
  validator,
  deleteBookController
);
//#endregion

//SALEBOOK ONLY ACCESSIBLE TO VENDORS AKA SELLERS
//#region
router.post(
  "/:bookId/salebook",
  validate(["bookId", "condition", "type", "price", "remarks"]),
  checkValidation(),
  isUserType(USERTYPES.VENDOR),
  validator,
  addSalesBookController
);
// router.get("/:bookId/salebook/:saleBookId", getOneSalesBookController);
// router.get("/:bookId/salebook", getAllSalesBookController);
router.get("/:vendorId/bookList", listedBooksController);
router.get(
  "/:bookId/bookVendors",
  validate(["bookId"]),
  validator,
  getIndividualBookVendors
);
router.patch(
  "/:bookId/:saleBookId",
  validate(["userId,bookId,condition,type,price,remarks"]),
  checkValidation(),
  isUserType(USERTYPES.VENDOR),
  validator,
  updateSalesBookController
);
router.delete(
  "/salebook/:saleBookId",
  checkValidation(),
  isUserType(USERTYPES.VENDOR),
  deleteSalesBookController
);

//#endregion

//TO SEE WHICH BOOKS WERE SOLD BY INDIVIDUAL VENDORS
//#region
// router.get(
//   "/soldbyvendor",
//   validate(["model"]),
//   validator,
//   checkValidation(),
//   isUserType(USERTYPES.VENDOR),
//   getAllVendorBookSellList
// );
//#endregion

module.exports = router;
