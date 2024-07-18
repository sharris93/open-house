const authenticatedRedirect = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/users/profile')
  }
  next()
}

module.exports = authenticatedRedirect