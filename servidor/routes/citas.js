const express = require('express');
const router = express.Router();
const requiereRol = require('../middleware/requiereRol');
const Cita = require('../models/Cita');
const moment = require('moment');

// Obtener citas del profesional logueado
router.get('/mis-citas', requiereRol('profesional'), async (req, res) => {
  try {
    const citas = await Cita.find({ profesional: req.session.usuario.id })
      .populate('paciente', 'nombre')
      .sort({ fecha: 1 });

    const eventos = citas.map(cita => ({
      title: ` - ${cita.paciente.nombre}`,
      start: cita.fecha
    }));

    res.json({ eventos });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ mensaje: 'Error al obtener las citas' });
  }
});

// GET /api/citas/horarios-dia?fecha=YYYY-MM-DD
router.get('/horarios-dia', requiereRol('profesional'), async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ mensaje: 'Se requiere fecha' });

  const inicio = new Date(`${fecha}T00:00:00`);
  const fin = new Date(`${fecha}T23:59:59`);

  // Crear todas las franjas de 30 min entre 09:00 y 17:00
  const horarios = [];
  let cur = new Date(inicio);
  cur.setHours(9, 0, 0, 0);
  while (cur.getHours() < 17 || (cur.getHours() === 17 && cur.getMinutes() === 0)) {
    horarios.push({ hora: cur.toTimeString().slice(0, 5), paciente: null });
    cur = new Date(cur.getTime() + 30 * 60000);
  }

  try {
    const citas = await Cita.find({
      profesional: req.session.usuario.id,
      fecha: { $gte: inicio, $lte: fin }
    }).populate('paciente', 'nombre');

    citas.forEach(c => {
      const h = c.fecha.toTimeString().slice(0, 5);
      const idx = horarios.findIndex(x => x.hora === h);
      if (idx > -1) horarios[idx].paciente = c.paciente.nombre;
    });

    res.json({ horarios });
  } catch (e) {
    console.error('Error horarios-dia:', e);
    res.status(500).json({ mensaje: 'Error interno' });
  }
});



// Obtener horarios disponibles para una fecha
// Obtener horas disponibles para un día
// Obtener horas disponibles para un día (con bloques de 30 min)
router.get('/horas-disponibles', requiereRol('profesional'), async (req, res) => {
  const moment = require('moment');
  const fechaDia = req.query.fecha; // formato YYYY-MM-DD

  if (!fechaDia) {
    return res.status(400).json({ mensaje: 'Fecha requerida' });
  }

  const inicio = moment(fechaDia + ' 09:00');
  const fin = moment(fechaDia + ' 17:00'); // Hasta las 17:00 (última cita a las 16:30)

  // Generar todas las franjas de 30 minutos entre 9:00 y 16:30
  const todasHoras = [];
  const actual = inicio.clone();
  while (actual.isBefore(fin)) {
    todasHoras.push(actual.format('HH:mm'));
    actual.add(30, 'minutes');
  }

  const citas = await Cita.find({
    profesional: req.session.usuario.id,
    fecha: {
      $gte: inicio.toDate(),
      $lt: fin.toDate()
    }
  });

  const ocupadas = citas.map(c => moment(c.fecha).format('HH:mm'));
  const disponibles = todasHoras.filter(h => !ocupadas.includes(h));

  res.json({ horas: disponibles });
});




// Crear una nueva cita si el horario está libre
router.post('/nueva', requiereRol('profesional'), async (req, res) => {
  try {
    const { paciente, fecha } = req.body;
    const fechaCita = new Date(fecha);

    // Verificar si ya hay una cita en esa fecha y hora
    const existe = await Cita.findOne({
      profesional: req.session.usuario.id,
      fecha: fechaCita
    });

    if (existe) {
      return res.status(400).json({ mensaje: 'Ya hay una cita programada a esa hora.' });
    }

    const nuevaCita = new Cita({
      paciente,
      profesional: req.session.usuario.id,
      fecha: fechaCita
    });

    await nuevaCita.save();
    res.json({ mensaje: 'Cita creada correctamente.' });

  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ mensaje: 'Error al crear la cita' });
  }
});



module.exports = router;
