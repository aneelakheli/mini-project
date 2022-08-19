const jwt = require("jsonwebtoken");

async function checkAuthValidation(req, res, next) {
  try {
    if (!req.headers["authorization"]) {
      res.locals.authData = {
        status: 401,
        success: false,
        message: "Access Denied...",
      };
    }
    const authHeader = req.authData["authorization"];
    const bearerToken = authHeader.split(" ");
    const [bearerValue, token] = bearerToken;
    if (bearerValue === "Bearer" && token) {
      try {
        const verifyData = jwt.verify(token, process.env.SECRETKEY);
        res.locals.authData = {
          success: true,
          message: " verified...",
          data: verifyData,
        };
        next();
      } catch (error) {
        res.locals.authData = {
          status: 401,
          success: false,
          message: "Accessed Denied ...",
        };
      }
    }
    next();
  } catch (error) {
    res.locals.authData = {
      status: 500,
      success: false,
      message: "Invalid Token...",
    };
    next();
  }
}
async function throwAuthValidation(req, res, next) {
  if (!res.locals.authData || !res.locals.authData.success) {
    return res
      .status(res.locals.authData.status)
      .send({ message: res.locals.authData.message });
  }
  next();
}

async function checkValidation(req, res, next) {
  return [
    checkAuthValidation(req, res, next),
    throwAuthValidation(req, res, next),
  ];
  next();
}
module.exports = {
  checkAuthValidation,
  throwAuthValidation,
  checkValidation,
};
