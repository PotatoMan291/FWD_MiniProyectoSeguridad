const contrasenasComunes = new Set([
  "password",
  "password123",
  "password12345678",
  "123456789012345",
  "1234567890123456",
  "qwerty123456789",
  "contrasena123456",
  "contrasena123456789",
  "admin12345678901",
  "securenotes123456",
]);

function validarPassword(password) {
  if (typeof password !== "string") {
    return {
      valida: false,
      error: "La contraseña debe ser texto.",
    };
  }

  const caracteres = [...password].length;
  const bytes = Buffer.byteLength(password, "utf8");

  if (caracteres < 15) {
    return {
      valida: false,
      error: "La contraseña debe tener al menos 15 caracteres.",
    };
  }

  // bcrypt procesa como máximo 72 bytes.
  if (bytes > 72) {
    return {
      valida: false,
      error: "La contraseña supera el límite de 72 bytes.",
    };
  }

  if (contrasenasComunes.has(password.toLowerCase())) {
    return {
      valida: false,
      error: "Esta contraseña es demasiado común.",
    };
  }

  return {
    valida: true,
    error: null,
  };
}

module.exports = { validarPassword };
