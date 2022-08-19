exports.USERTYPES = {
  ADMIN: "admin",
  LIBRARIAN: "librarian",
  VENDOR: "vendor",
  LIBRARYMEMBER: "library_member",
};

exports.BOOKTYPES = {
  HARDCOVER: "hardcover",
  PAPERBACK: "paperback",
};

exports.CONDITIONOFBOOKS = {
  NEW: "new",
  USED: "used",
};

exports.STATUSOFBOOKTOBERENTED = {
  AVAILABLE: "available",
  TAKEN: "taken",
  OVERDUE: "overdue",
};

exports.USERBOOKRELATION = {
  RENTITEM: "SaleBook",
  SALEBOOK: "RentItem",
};

exports.DIRECTORIES = {
  BOOK: "bookLifter/book",
  KYC: "bookLifter/kyc",
  CITIZENSHIP: "bookLifter/citizenship",
  AUTHOR: "bookLifter/authorr",
};

exports.BOOKACTION = {
  ACCEPT: "accept",
  REJECT: "reject",
};
