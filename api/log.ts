module.exports = (req, res) => {
  console.log(req.body);
  res.json({
    body: req.body,
    query: req.query,
    cookies: req.cookies,
  });
};
