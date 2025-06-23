function notFoundError(req, res) {
  res.status(404)
  res.json({message:'routes does not exsit'});
  return
}

module.exports = notFoundError;
