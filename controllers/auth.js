/* eslint-disable no-undef */
const jwt = require("jsonwebtoken");

// middle ware to authorize token and return user
function authToken(req, res, next) {
  // extract token from header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // if there is no token
  if (token == null)
    return res.status(401).json({ message: `Token can not be retrieved` });

  // verify token using jwt
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    // add user object to the request
    req.user = user;
    next();
  });
}

module.exports = authToken;
