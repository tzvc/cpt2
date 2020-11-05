module.exports = (req: any, res: any) => {
  console.log(req.body);
  res.json({
    body: req.body,
    query: req.query,
    cookies: req.cookies,
  });
};
