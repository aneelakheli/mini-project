const mongoose = require("mongoose");

module.exports = connectDB = async () => {
  try {
    const url = process.env.MONGO_URI_OFFLINE;
    mongoose
      .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((data) => {
        console.log(
          "Connected to database with host:" +
            `${data?.connection?.host} and name: ${data?.connection?.name}`
        );
      });
  } catch (err) {
    console.log(err);
  }
};
