module.exports = password => (req, res, next) => {
  if (!req.query || !req.query.password || req.query.password !== password) {
    res.send(`
        <html>
          <head>
            <link rel="stylesheet" href="/styles.css" />
            <title>${process.env.TITLE}</title>
          </head>
          
          <body>
            <div>
              <h1>Password incorrect or expired</h1>
            </div>
          </body>
        </html>
      `);
  } else {
    next();
  }
};
