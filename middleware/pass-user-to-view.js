const passUserToView = (req, res, next) => {
  res.locals.user = req.session.user ? req.session.user : null;
  res.locals.imagePrefix = process.env.PRODUCTION === 'true' ? '/public' : ''
  next();
};

module.exports = passUserToView;