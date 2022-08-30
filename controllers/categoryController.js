const { errorHandler, responseHandler } = require("../helpers/handleResponse");
const Book = require("../models/book.Model");
const Category = require("../models/category.Model");
const getPaginatedDataWithRegex = require("./helpers/paginationHelper");

async function addCategoryController(req, res) {
  const { name, description } = req.body;
  try {
    const newCategory = await new Category({
      name: name,
      description: description,
    }).save();
    return responseHandler({
      res,
      code: 200,
      message: "Category created",
      data: newCategory,
    });
  } catch (error) {
    return errorHandler({ res, code: 500, error: "Something went wrong" });
  }
}
async function getOneCategoryBooksController(req, res) {
  try {
    const { categoryId } = req.params;
    const { count, page } = req.query;
    const fetchedCategory = await Category.findOne(
      { _id: categoryId },
      "-__v"
    ).lean();
    let fetchedBooks = await getPaginatedDataWithRegex(
      CategoryBookRelation,
      { categoryId },
      {
        page,
        limit: count || 20,
        lean: true,
        populate: [
          {
            path: "bookId",
            model: Book,
            select: "-__v",
          },
        ],
        lean: true,
      }
    );
    const mappedBooks = await Promise.all(
      fetchedBooks.docs.map(async (dat) => {
        dat.bookId.authors = (
          await bookAuthorRelModel
            .find({
              bookId: dat.bookId._id,
            })
            .populate({
              path: "authorId",
              // select:'authorId'
            })
        ).map((dat) => {
          return {
            name: dat.authorId.name,
            _id: dat.authorId._id,
          };
        });
        return dat.bookId;
      })
    );
    const category = {
      category: fetchedCategory,
      docs: mappedBooks,
      totalCount: fetchedBooks.totalCount,
      nextPage: fetchedBooks.nextPage,
      totalPages: fetchedBooks.totalPages,
    };
    return responseHandler({
      res,
      code: 200,
      data: category,
    });
  } catch (error) {
    return errorHandler({
      res,
      code: 500,
      error,
      message: "Something went wrong",
    });
  }
}
async function getCategoryController(req, res) {
  try {
    const { categoryId } = req.params;
    const category = await Category.findOne({ _id: categoryId }, "-__v").lean();
    return responseHandler({
      res,
      code: 200,
      data: category,
    });
  } catch (error) {
    return errorHandler({
      res,
      code: 500,
      error,
      message: "Something went wrong",
    });
  }
}

async function getAllCategoryController(req, res) {
  try {
    const { count, page, query, forDropDown } = req.query;
    if (forDropDown) {
      return responseHandler({
        res,
        code: 200,
        data: await Category.find({}),
      });
    }
    // const categories = await Category.find({}).limit(count).skip(page).lean();
    const categories = await getPaginatedDataWithRegex(
      Category,
      {},
      {
        query,
        page,
        limit: count || 20,
        lean: true,
        searchAts: ["name"],
        // lean: false, // authors will not be set on lean false as such property doesnt exist
      }
    );
    await Promise.all(
      categories.docs.map(async (category) => {
        category.books = await CategoryBookRelation.count({
          categoryId: category._id,
        });
      })
    );
    return responseHandler({
      res,
      code: 200,
      data: categories,
    });
  } catch (error) {
    return errorHandler({
      res,
      code: 500,
      error,
      message: "Something went wrong",
    });
  }
}
async function updateCategoryController(req, res) {
  try {
    const { categoryId } = req.params;
    const { name, description, books, removedBooks } = req.body;
    const updateCategory = await Category.findByIdAndUpdate(
      { _id: categoryId },
      {
        name: name,
        description: description,
      },
      { new: true }
    );
    const addedBooksPromise =
      books && books.length
        ? books.map((bookMap) => {
            return CategoryBookRelation.findOneAndUpdate(
              {
                categoryId: categoryId,
                bookId: bookMap,
              },
              {},
              {
                upsert: true,
              }
            );
          })
        : [];
    const removedBooksPromise =
      removedBooks && removedBooks.length
        ? removedBooks.map((bookMap) => {
            return CategoryBookRelation.findOneAndDelete({
              bookId: bookMap,
              categoryId: categoryId,
            });
          })
        : [];
    await Promise.all([
      Promise.all(addedBooksPromise),
      Promise.all(removedBooksPromise),
    ]);
    return responseHandler({
      res,
      code: 200,
      message: "Successfully updated.",
      data: updateCategory,
    });
  } catch (error) {
    return errorHandler({
      res,
      code: 500,
      error,
      message: "Something went wrong",
    });
  }
}
async function deleteCategoryController(req, res) {
  try {
    const { categoryId } = req.params;
    const deleteCategory = await Category.findOneAndDelete({
      _id: categoryId,
    });
    return responseHandler({
      res,
      data: deleteCategory,
      message: "succeesfully deleted",
    });
  } catch (error) {
    return errorHandler({
      res,
      code: 500,
      error,
      message: "Something went wrong",
    });
  }
}

module.exports = {
  addCategoryController,
  getOneCategoryBooksController,
  getCategoryController,
  getAllCategoryController,
  updateCategoryController,
  deleteCategoryController,
};
