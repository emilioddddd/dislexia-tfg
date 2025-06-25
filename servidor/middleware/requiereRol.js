module.exports = function requiereRol(rolEsperado) {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({ mensaje: 'No has iniciado sesión' });
    }

    if (req.session.usuario.rol !== rolEsperado) {
      return res.status(403).json({ mensaje: 'No tienes permisos suficientes' });
    }

    req.usuario = req.session.usuario;

    next();
  };
};
