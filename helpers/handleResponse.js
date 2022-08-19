exports.errorHandler = ({
  res,
  code = 500,
  error = "Error is not mentioned",
  message = "Failed to comprehend api request or Bad Request",
}) => {
  if (code < 500) {
    console.log(error);
    return res.status(code).send({
      error: error,
      message: message || "Error may be because of Bad Request",
    });
  }
  console.log(error);
  return res.status(code).send({
    error: "Failed to comprehend api request or Bad Request",
    message: message,
  });
};

exports.responseHandler = ({
  res,
  error = "Error is not mentioned, Maybe Bad Request ",
  code = 200,
  message,
  data,
}) => {
  if (code >= 200 && code <= 399) {
    return res.status(code).send({
      message: message || " Success",
      data,
    });
  } else {
    console.log({ error });
    return res.status(code).send({
      error: error,
      message: message || " Bad Request ",
    });
  }
};
