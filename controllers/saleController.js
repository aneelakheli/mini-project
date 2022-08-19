const Book = require("../models/book.Model");
const { errorHandler, responseHandler } = require("../helpers/handleResponse");
const Author = require("../models/author.Model");
const Category = require("../models/category.Model");
const Language = require("../models/language.model");
const CategoryBookRelation = require("../models/categoryBookRelation.Model");
const AuthorBookRelation = require("../models/bookAuthorRel.model");
const bookAuthorRelModel = require("../models/bookAuthorRel.model");
const { getPaginatedDataWithRegex } = require("./helper/helper");
const Publisher = require("../models/publisher.Model");
const SaleBook = require("../models/saleBook.Model");
const RentItem = require("../models/rentItem.model");

async function addBookController(req, res) {
  try {
    const {
      name,
      isbn,
      edition,
      authors,
      publisherId,
      isFeatured,
      languageId,
      softCoverPrice,
      hardCoverPrice,
      description,
      categories,
      publishedYear,
    } = req.body;
    const fetchedBookpromise = Book.findOne({
      $or: [{ name }, { isbn }],
    }).lean();
    const fetchedLanguagePromise = Language.findOne({ _id: languageId });
    const [fetchedBook, fetchedLanguage] = await Promise.all([
      fetchedBookpromise,
      fetchedLanguagePromise,
    ]);
    if (fetchedBook) {
      if (fetchedBook.name === name) {
        return errorHandler({
          res,
          code: 400,
          error: "Duplicate Book name",
        });
      }
      if (fetchedBook.isbn === isbn) {
        return errorHandler({
          res,
          code: 400,
          error: "Duplicate ISBN please enter unique ISBN",
        });
      }
    }
    if (!fetchedLanguage) {
      return errorHandler({
        res,
        code: 400,
        error: "No language found",
      });
    }
    let fetchedAuthors = [],
      fetchedCategory = [];
    if (authors && authors.length) {
      fetchedAuthors = await Author.find({
        _id: {
          $in: authors,
        },
      });
    }
    if (categories && categories.length) {
      fetchedCategory = await Category.find({
        _id: {
          $in: categories,
        },
      });
    }
    const newBook = await new Book({
      name: name,
      isbn: isbn,
      edition: edition,
      coverImage: req.file ? req.file.location : null,
      publisherId: publisherId,
      isFeatured: isFeatured,
      languageId: languageId,
      price: {
        hardCoverPrice: hardCoverPrice ? hardCoverPrice : undefined,
        softCoverPrice: softCoverPrice ? softCoverPrice : undefined,
      },
      description: description,
      publishedYear: publishedYear,
    }).save();
    if (fetchedAuthors.length) {
      fetchedAuthors.map(async (authorMap) => {
        return await AuthorBookRelation.findOneAndUpdate(
          {
            authorId: authorMap,
            bookId: newBook._id,
          },
          {},
          { upsert: true }
        );
      });
    }
    if (fetchedCategory.length) {
      fetchedCategory.map(async (categoryMap) => {
        return await CategoryBookRelation.findOneAndUpdate(
          {
            categoryId: categoryMap,
            bookId: newBook._id,
          },
          {},
          { upsert: true }
        );
      });
    }
    return responseHandler({
      res,
      code: 200,
      data: newBook,
      message: "Successfully created",
    });
  } catch (err) {
    console.log(err);
    errorHandler({
      res,
      code: 500,
      error: "something went wrong",
      message: "Error cause due to bad request...",
    });
  }
}

async function updateBookController(req, res) {
  try {
    const bookId = req.params.bookId;
    const {
      name,
      isbn,
      categories,
      removedCategories,
      authors,
      removedAuthors,
      publisherId,
      editionNumber,
      isFeatured,
      languageId,
      description,
    } = req.body;

    const languagePromise = Language.findOne({ _id: languageId });

    const publisherPromise = Publisher.findOne({ _id: publisherId });

    const [language, publisher] = await Promise.all([
      languagePromise,
      publisherPromise,
    ]);

    let updateBook = await Book.findByIdAndUpdate(
      bookId,
      {
        name,
        isbn,
        publisherId,
        editionNumber,
        // coverImages: req.file ? coverImage : null,
        isFeatured: isFeatured,
        languageId: language ? languageId : null,
        publisherId: publisher ? publisherId : null,
        description: description,
      },
      { new: true }
    );
    const addedCategoryPromise =
      categories && categories.length
        ? categories.map((categoryMap) => {
            return CategoryBookRelation.findOneAndUpdate(
              {
                categoryId: categoryMap,
                bookId: bookId,
              },
              {},
              {
                upsert: true,
              }
            );
          })
        : [];
    const removedCategoryPromise =
      removedCategories && removedCategories.length
        ? removedCategories.map((categoryMap) => {
            return CategoryBookRelation.findOneAndDelete({
              bookId: bookId,
              categoryId: categoryMap,
            });
          })
        : [];
    const addedAuthorPromise =
      authors && authors.length
        ? authors.map((authorMap) => {
            return AuthorBookRelation.findOneAndUpdate(
              {
                authorId: authorMap,
                bookId: bookId,
              },
              {},
              {
                upsert: true,
              }
            );
          })
        : [];
    const removedAuthorPromise =
      removedAuthors && removedAuthors.length
        ? removedAuthors.map((authorMap) => {
            return AuthorBookRelation.findOneAndDelete({
              bookId: bookId,
              authorId: authorMap,
            });
          })
        : [];
    await Promise.all([
      Promise.all(removedCategoryPromise),
      Promise.all(removedAuthorPromise),
      Promise.all(addedCategoryPromise),
      Promise.all(addedAuthorPromise),
    ]);
    return responseHandler({
      res,
      code: 200,
      data: updateBook,
      message: "Successfully update...",
    });
  } catch (error) {
    console.log(error);
    errorHandler({
      res,
      message: "Error cause due to bad request...",
    });
  }
}

async function getOneBookController(req, res) {
  try {
    const { bookId } = req.params;
    const book = await Book.findOne({ _id: bookId })
      .populate({
        path: "languageId",
        model: Language,
        select: "name",
      })
      .populate({
        path: "publisherId",
        model: Publisher,
        select: "name",
      })
      .lean();
    if (!book) {
      errorHandler({
        res,
        code: 400,
        error: "No book found",
      });
    }
    //Cannot set property 'categories' of null
    book.categories = (
      await CategoryBookRelation.find({ bookId })
        .populate({
          path: "categoryId",
          // select: { categoryId: 1 },
        })
        .lean()
    ).map((category) => {
      return {
        name: category.categoryId.name,
        _id: category.categoryId._id,
      };
    });
    book.authors = (
      await AuthorBookRelation.find({ bookId })
        .populate({
          path: "authorId",
          // select: { categoryId: 1 },
        })
        .lean()
    ).map((author) => {
      return {
        name: author.authorId.name,
        _id: author.authorId._id,
      };
    });
    book["publisher"] = book["publisherId"];
    book["language"] = book["languageId"];
    delete book["publisherId"];
    delete book["languageId"];
    return responseHandler({ res, data: book });
  } catch (error) {
    errorHandler({
      res,
      code: 500,
      error,
      message: "Error cause due to bad request...",
    });
  }
}

async function getAllBookController(req, res) {
  try {
    const {
      count,
      page,
      query,
      featured,
      categoryId,
      sort,
      languageId,
      random,
    } = req.query;
    const getBookQuery = async () => {
      data = {};
      if (!featured) {
        data.isFeatured = false;
      }
      if (languageId) {
        data.languageId = languageId;
      }
      if (categoryId) {
        let bookIds = await Book.find({}, "_id");
        const categoryBookIds = (
          await CategoryBookRelation.find({
            categoryId,
          })
        ).map((relation) => relation.bookId);
        bookIds = bookIds.filter((book) =>
          categoryBookIds.some(
            (cBook) => cBook.toString() === book._id.toString()
          )
        );
        data._id = {
          $in: bookIds,
        };
      }
      return data;
    };
    const books = await getPaginatedDataWithRegex(Book, await getBookQuery(), {
      query,
      page,
      random,
      limit: count || 20,
      searchAts: ["name"],
      sort: `${sort}`,
      select: "-__v ",
      populate: {
        path: "publisherId languageId",
      },
      lean: true,
    });
    books.docs.length
      ? await Promise.all(
          books.docs.map(async (dat) => {
            delete dat["random"];
            dat.categories = (
              await CategoryBookRelation.find({
                bookId: dat._id,
              }).populate({
                path: "categoryId",
                // select:'authorId'
              })
            ).map((dat) => {
              return {
                name: dat.categoryId?.name,
                _id: dat.categoryId?._id,
              };
            });
            dat.authors = (
              await bookAuthorRelModel
                .find({
                  bookId: dat._id,
                })
                .populate({
                  path: "authorId",
                  // select:'authorId'
                })
            ).map((dat) => {
              return {
                name: dat.authorId?.name,
                _id: dat.authorId?._id,
              };
            });
          })
        )
      : null;
    // const books = fetchedBooks.docs.sort(function (a, b) { return b.createdAt - a.createdAt });
    return responseHandler({ res, code: 200, data: books });
  } catch (error) {
    errorHandler({
      res,
      error,
      message: "Error cause due to bad request...",
    });
  }
}

async function getFeaturedBooksController(req, res) {
  try {
    const books = await Book.find({ isFeatured: true }).lean();
    const counts = await Book.count({ isFeatured: true });
    await Promise.all(
      books.map(async (dat) => {
        dat.categories = (
          await CategoryBookRelation.find({
            bookId: dat._id,
          }).populate({
            path: "categoryId",
            // select:'authorId'
          })
        ).map((dat) => {
          return {
            name: dat.categoryId.name,
            _id: dat.categoryId._id,
          };
        });
        dat.authors = (
          await bookAuthorRelModel
            .find({
              bookId: dat._id,
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
      })
    );
    return responseHandler({
      res,
      code: 200,
      data: { books, totalNoOfBooks: counts },
    });
  } catch (error) {
    errorHandler({
      res,
      error,
      message: "Error cause due to bad request...",
    });
  }
}

async function deleteBookController(req, res) {
  try {
    const { bookId } = req.params;
    await Promise.all([
      Book.deleteOne({ _id: bookId }),
      CategoryBookRelation.deleteMany({ bookId }),
      AuthorBookRelation.deleteMany({ bookId }),
      SaleBook.deleteMany({ bookId }),
      RentItem.deleteMany({ "book.id": bookId }),
    ]);
    const deleteBook = await Book.deleteOne({ _id: bookId });
    return responseHandler({
      res,
      message: "Successfully delete...",
      data: deleteBook,
    });
  } catch (error) {
    errorHandler({
      res,
      error,
      message: "Error cause due to bad request...",
    });
  }
}

async function updateBookImageController(req, res) {
  try {
    const { bookId } = req.params;
    if (req.files) {
      const updateBookImage = await Book.findByIdAndUpdate(
        { _id: bookId },
        { coverImage: req.files[0].path },
        {
          new: true,
        }
      );
      return responseHandler({
        res,
        code: 200,
        message: "Scucessfully updated Image",
        data: updateBookImage,
      });
    } else {
      return errorHandler({
        res,
        code: 400,
        error: "Book does not exists",
      });
    }
  } catch (error) {
    console.log(error);
    return errorHandler({ res, code: 500, error: "Something  went wrong" });
  }
}

module.exports = {
  getAllBookController,
  getOneBookController,
  addBookController,
  updateBookController,
  deleteBookController,
  updateBookImageController,
  getFeaturedBooksController,
};
