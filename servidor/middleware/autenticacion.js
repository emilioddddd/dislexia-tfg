function requiereSesion(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ mensaje: 'No has iniciado sesión' });
  }
  next();
}

function requiereRol(rolPermitido) {
  return (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.rol !== rolPermitido) {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }
    next();
  };
}

module.exports = { requiereSesion, requiereRol };
