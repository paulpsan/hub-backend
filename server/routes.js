"use strict";

export default app => {
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/commits", require("./routes/commit"));
  app.use("/api/rating", require("./routes/rating"));
  app.use("/api/grupos", require("./routes/grupo"));
  app.use("/api/proyectos", require("./routes/proyecto"));
  app.use("/api/repositorios", require("./routes/repositorio"));
  app.use("/api/usuarios", require("./routes/usuario"));
  app.use("/api/publicos", require("./routes/publicos"));
  app.use("/api/upload", require("./routes/upload"));
  app.use("/api/solicitudes", require("./routes/solicitud"));
};
