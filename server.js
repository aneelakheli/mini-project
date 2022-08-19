const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

const authorRoute = require("./routes/author.routes");
const bookRoute = require("./routes/book.Routes");
const categoryRoute = require("./routes/category.Routes");
const saleBookRoute = require("./routes/saleBook.Routes");

dotenv.config({
  path: "./config/config.env",
});

app.use(cors());

const connectDB = require("./config/db");
connectDB();

//morgan,bodyParser,port setup

// app.use(morgan("combined"));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.set("port", port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/author", authorRoute);
app.use("/api/book", bookRoute);
app.use("/api/salebook", saleBookRoute);
app.use("/api/category", categoryRoute);

//handle other requests with 404 if not handled previously
app.use("*", (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: "Api endpoint does not exist!",
  });
});

//server listening, named server as it can be further used. Eg, in peparing socket connection
const server = app.listen(port, () => {
  console.log(`Server is listening at http: //localhost: ${Date()}`, port);
});
