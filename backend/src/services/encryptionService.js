const crypto = require("node:crypto");

const ALGORITMO = "aes-256-gcm";

function obtenerLlave() {
  const valor = process.env.DATA_ENCRYPTION_KEY;

  if (!valor) {
    throw new Error("Falta DATA_ENCRYPTION_KEY");
  }

  const llave = Buffer.from(valor, "base64");

  if (llave.length !== 32 || llave.toString("base64") !== valor) {
    throw new Error("Llave de cifrado inválida");
  }

  return llave;
}

function cifrar(texto) {
  if (typeof texto !== "string") {
    throw new TypeError("El dato debe ser texto");
  }

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITMO, obtenerLlave(), iv, {
    authTagLength: 16,
  });

  const cifrado = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()]);

  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64"),
    tag.toString("base64"),
    cifrado.toString("base64"),
  ].join(".");
}

function descifrar(valor) {
  if (typeof valor !== "string") {
    throw new Error("Dato cifrado inválido");
  }

  const partes = valor.split(".");

  if (partes.length !== 4 || partes[0] !== "v1") {
    throw new Error("Formato de cifrado inválido");
  }

  const [, ivB64, tagB64, datosB64] = partes;

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const datos = Buffer.from(datosB64, "base64");

  if (iv.length !== 12 || tag.length !== 16) {
    throw new Error("Estructura cifrada inválida");
  }

  const decipher = crypto.createDecipheriv(ALGORITMO, obtenerLlave(), iv, {
    authTagLength: 16,
  });

  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(datos), decipher.final()]).toString(
    "utf8",
  );
}

module.exports = {
  cifrar,
  descifrar,
};
