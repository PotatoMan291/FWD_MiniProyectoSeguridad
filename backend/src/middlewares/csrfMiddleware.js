const crypto = require("crypto");

// Generar un token seguro vinculado a la sesión
function obtenerTokenCSRF(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }

  return req.session.csrfToken;
}

// Endpoint para obtener el token CSRF
function entregarTokenCSRF(req, res) {
  const token = obtenerTokenCSRF(req);

  res.set("Cache-Control", "no-store");
  res.json({
    csrfToken: token,
  });
}

// Validar el token en operaciones que modifican datos
function verificarCSRF(req, res, next) {
  const metodosSeguros = ["GET", "HEAD", "OPTIONS"];

  if (metodosSeguros.includes(req.method)) {
    return next();
  }

  const tokenRecibido = req.get("X-CSRF-Token");
  const tokenSesion = req.session.csrfToken;

  if (
    typeof tokenRecibido !== "string" ||
    typeof tokenSesion !== "string" ||
    !/^[a-f0-9]{64}$/.test(tokenRecibido)
  ) {
    return res.status(403).json({
      error: "Token CSRF ausente o inválido.",
    });
  }

  const recibido = Buffer.from(tokenRecibido, "hex");
  const esperado = Buffer.from(tokenSesion, "hex");

  if (
    recibido.length !== esperado.length ||
    !crypto.timingSafeEqual(recibido, esperado)
  ) {
    return res.status(403).json({
      error: "Token CSRF ausente o inválido.",
    });
  }

  next();
}

module.exports = {
  entregarTokenCSRF,
  verificarCSRF,
};
