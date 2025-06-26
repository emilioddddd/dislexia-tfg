// app.js
const express = require('express');
const app = express();
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();


// Importar la conexión a la base de datos
const conectarDB = require('./servidor/config/db');
conectarDB();

const session = require('express-session');

app.use(session({
  secret: 'clave-secreta', // ⚠️ cámbiala por algo más seguro en producción
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true si usas HTTPS
    maxAge: 1000 * 60 * 60 // 1 hora
  }
}));


// Middleware para poder recibir JSON
app.use(express.json());

// Servir los HTML desde cliente/public
app.use(express.static(path.join(__dirname, 'cliente/public')));
app.use('/partials', express.static(path.join(__dirname, 'cliente/partials')));
// Sirve los estilos desde /cliente/styles
app.use('/styles', express.static(path.join(__dirname, 'cliente/styles')));

// Rutas API
const rutasUsuarios = require('./servidor/routes/usuarios');
const rutasCitas = require('./servidor/routes/citas');
const rutasJuegos = require('./servidor/routes/juegos');
const rutasResultados = require('./servidor/routes/resultados');
const rutasProgreso = require('./servidor/routes/progreso');
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/citas', rutasCitas);
app.use('/api/juegos', rutasJuegos);
app.use('/api/resultados', rutasResultados);
app.use('/api/resultados', rutasProgreso); 





// Ruta básica
app.get('/', (req, res) => {
  //res.send('Bienvenido a la aplicación de dislexia');
  res.sendFile(path.join(__dirname, 'cliente/public/login.html'));
});

// Arrancar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
