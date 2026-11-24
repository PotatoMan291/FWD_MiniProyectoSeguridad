require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();

const PORT = Number(process.env.DEMO_PORT || 3001);

// Base de datos exclusiva para el laboratorio
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  application_name: "securenotes_demo",
  statement_timeout: 3000,
});

// ========================================
// VERSIÓN 1: VULNERABLE A SQL INJECTION
// ========================================

app.get("/api/demo/vulnerable", async (req, res) => {
  try {
    const titulo = req.query.titulo;

    if (typeof titulo !== "string" || titulo.length > 200) {
      return res.status(400).json({
        error: "Búsqueda inválida.",
      });
    }

    // INSEGURO: concatenamos directamente el dato del usuario.
    // Este código existe únicamente para la demostración local.
    const sql = `
      SELECT id, titulo, contenido
      FROM notas_demo
      WHERE titulo = '${titulo}'
      ORDER BY id
    `;

    const resultado = await pool.query(sql);

    res.json({
      version: "VULNERABLE",
      consulta: sql.trim(),
      total: resultado.rowCount,
      notas: resultado.rows,
    });
  } catch (error) {
    console.error("Error en demo vulnerable:", error.message);

    res.status(400).json({
      error: "La consulta SQL no pudo ejecutarse.",
    });
  }
});

// ========================================
// VERSIÓN 2: PROTEGIDA
// ========================================

app.get("/api/demo/seguro", async (req, res) => {
  try {
    const titulo = req.query.titulo;

    if (typeof titulo !== "string" || titulo.length > 200) {
      return res.status(400).json({
        error: "Búsqueda inválida.",
      });
    }

    // SEGURO: el dato se envía como parámetro.
    const sql = `
      SELECT id, titulo, contenido
      FROM notas_demo
      WHERE titulo = $1
      ORDER BY id
    `;

    const resultado = await pool.query(sql, [titulo]);

    res.json({
      version: "PROTEGIDA",
      consulta: sql.trim(),
      parametros: [titulo],
      total: resultado.rowCount,
      notas: resultado.rows,
    });
  } catch (error) {
    console.error("Error en demo segura:", error.message);

    res.status(500).json({
      error: "Error al ejecutar la consulta.",
    });
  }
});

// ========================================
// FRONTEND DEL LABORATORIO
// ========================================

app.use(express.static(path.join(__dirname, "public")));

// El laboratorio solo escucha en localhost.
app.listen(PORT, "127.0.0.1", () => {
  console.log("====================================");
  console.log("SECURENOTES - LABORATORIO SQL");
  console.log("====================================");
  console.log(`URL: http://127.0.0.1:${PORT}`);
  console.log("Modo: demostración local");
  console.log("No publicar este servidor en Internet.");
});
