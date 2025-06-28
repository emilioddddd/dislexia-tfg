module.exports = (req, res, next) => {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.status(403).json({ mensaje: 'No autenticado' });
  }
};
