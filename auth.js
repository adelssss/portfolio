exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
      return next();
  }
  res.redirect('/');
};

exports.isEditor = (req, res, next) => {
  if (req.user && req.user.role === 'editor') {
      return next();
  }
  res.redirect('/');
};
