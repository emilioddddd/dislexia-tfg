const express = require('express');
const router = express.Router();
const Resultado = require('../models/Resultado');
const Juego = require('../models/Juego');
const mongoose = require('mongoose');
const requiereAuth = require('../middleware/requiereAuth');

// Normaliza una métrica a escala 0–100 (cuanto menor tiempo/intentos, mayor puntuación)
function normalizarInverso(valor, max) {
    return Math.max(0, 100 - (valor / max) * 100);
}

// Ruta para progreso del usuario logueado (paciente)
router.get('/progreso', requiereAuth, async (req, res) => {
    try {
        const pacienteId = req.session?.usuario?.id;
        if (!pacienteId) return res.status(401).json({ mensaje: 'No autenticado' });

        const resultados = await Resultado.find({ paciente: pacienteId }).populate('juego');

        const progreso = calcularProgreso(resultados);
        res.json(progreso);

    } catch (error) {
        console.error('Error al calcular progreso:', error);
        res.status(500).json({ mensaje: 'Error al calcular el progreso' });
    }
});

// Ruta para progreso de un paciente concreto (solo accesible por profesionales)
router.get('/progreso/:id', async (req, res) => {
    try {
        const pacienteId = req.params.id;

        // Validar que el ID tenga el formato correcto
        if (!mongoose.Types.ObjectId.isValid(pacienteId)) {
            return res.status(400).json({ mensaje: 'ID de paciente inválido' });
        }

        const resultados = await Resultado.find({ paciente: pacienteId }).populate('juego');
        const progreso = calcularProgreso(resultados);
        res.json(progreso);

    } catch (error) {
        console.error('Error al calcular progreso del paciente:', error);
        res.status(500).json({ mensaje: 'Error al calcular progreso del paciente' });
    }
});

function calcularProgreso(resultados) {
    let velocidad = [], precision = [], comprension = [], escritura = [];

    resultados.forEach(r => {
        const tipo = r.juego.tipo;
        const datos = r.datos;

        if (tipo === 'memoria') {
            velocidad.push(normalizarInverso(datos.tiempo || 60, 60));
            precision.push(normalizarInverso(datos.intentos || 20, 20));

        } else if (tipo === 'sopa-letras') {
            velocidad.push(normalizarInverso(datos.duracionSegundos || 120, 120));
            precision.push(normalizarInverso(datos.intentos || 20, 20));
            comprension.push(normalizarInverso(datos.ayudas || 10, 10));

        } else if (tipo === 'orden-letras') {
            if (datos.acierto) {
                escritura.push(normalizarInverso(datos.intentos || 10, 10));
                velocidad.push(normalizarInverso(datos.duracionSegundos || 60, 60));
                precision.push(normalizarInverso(datos.intentos || 10, 10));
            }

        } else if (tipo === 'comprension') {
            comprension.push(normalizarInverso(datos.ayudas || 10, 10));

        } else if (tipo === 'imagen-palabra') {
            const { aciertos = 0, intentos = 0, tiempo = 60 } = datos;
            precision.push(normalizarInverso(intentos - aciertos, 10));
            comprension.push(normalizarInverso(tiempo, 60));
        }
    });

    const promedio = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    return {
        velocidad: promedio(velocidad),
        precision: promedio(precision),
        comprension: promedio(comprension),
        escritura: promedio(escritura)
    };
}

module.exports = router;
