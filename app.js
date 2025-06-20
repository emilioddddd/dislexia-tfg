// app.js
const express = require('express');
const app = express();
const path = require('path');


// Middleware para poder recibir JSON
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS) desde cliente/public
app.use(express.static(path.join(__dirname, 'cliente/public')));

// Rutas API
const rutasUsuarios = require('./servidor/routes/usuarios');
app.use('/api/usuarios', rutasUsuarios);

// Ruta básica
app.get('/', (req, res) => {
  //res.send('Bienvenido a la aplicación de dislexia');
  res.sendFile(path.join(__dirname, 'cliente/public/index.html'));
});

// Arrancar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
