// app.js
const express = require('express');
const app = express();

// Middleware para poder recibir JSON
app.use(express.json());

// Ruta básica
app.get('/', (req, res) => {
  res.send('Bienvenido a la aplicación de dislexia');
});

// Arrancar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
