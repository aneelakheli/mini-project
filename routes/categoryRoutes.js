const express = require("express");
const {
  addCategoryController,
  getAllCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getCategoryController,
  getOneCategoryBooksController,
} = require("../controllers/category.Controller");
const { isUserType } = require("../middleware/checkUserTypes");
const { checkAuthValidation } = require("../middleware/userAuthentication");
const { validator, validate } = require("../middleware/validators");
const { USERTYPES } = require("../models/constants");
const router = express.Router();

router.post(
  "/",
  checkAuthValidation,
  isUserType(USERTYPES.ADMIN),
  addCategoryController
);
router.get("/", getAllCategoryController);
router.get(
  "/:categoryId/book",
  validate(["categoryId"]),
  validator,
  getOneCategoryBooksController
);
router.get(
  "/:categoryId",
  validate(["categoryId"]),
  validator,
  getCategoryController
);
router.patch(
  "/:categoryId",
  checkAuthValidation,
  isUserType(USERTYPES.ADMIN),
  validate(["categoryId"]),
  validator,
  updateCategoryController
);
router.delete(
  "/:categoryId",
  checkAuthValidation,
  isUserType(USERTYPES.ADMIN),
  validate(["categoryId"]),
  validator,
  deleteCategoryController
);

module.exports = router;
