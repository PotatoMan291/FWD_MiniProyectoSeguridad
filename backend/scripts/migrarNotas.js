require("dotenv").config();

const pool = require("../src/config/db");
const { cifrar, descifrar } = require("../src/services/encryptionService");

async function migrar() {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    const resultado = await cliente.query(`
      SELECT id, contenido
      FROM notas
      WHERE contenido_cifrado IS NULL
      ORDER BY id
      FOR UPDATE
    `);

    for (const nota of resultado.rows) {
      if (typeof nota.contenido !== "string") {
        throw new Error(`La nota ${nota.id} no tiene texto para migrar`);
      }

      const contenidoCifrado = cifrar(nota.contenido);

      if (descifrar(contenidoCifrado) !== nota.contenido) {
        throw new Error(`Falló la verificación de la nota ${nota.id}`);
      }

      await cliente.query(
        `UPDATE notas
         SET contenido_cifrado = $1
         WHERE id = $2`,
        [contenidoCifrado, nota.id],
      );
    }

    await cliente.query("COMMIT");

    console.log(`Migración exitosa: ${resultado.rowCount} notas cifradas.`);
  } catch (error) {
    await cliente.query("ROLLBACK");
    console.error("Migración cancelada:", error.message);
    process.exitCode = 1;
  } finally {
    cliente.release();
    await pool.end();
  }
}

migrar();
