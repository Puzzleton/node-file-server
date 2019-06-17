module.exports = (password) => (
  (req, res, next) => {
    if (!req.query || !req.query.password || req.query.password !== password) {
      res.send('<div><h1>Password incorrect or expired</h1></div>')
    } else {
      next();
    }
  }
);
