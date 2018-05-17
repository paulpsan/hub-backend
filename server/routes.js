"use strict";

export default app => {
  app.use("/api/usuarios", require("./routes/usuario"));
  app.use("/api/organizaciones", require("./routes/organizacion"));
  app.use("/api/usuarioRepositorios", require("./routes/usuarioRepositorio"));
  app.use("/api/repositorios", require("./routes/repositorio"));
  app.use("/api/proyectos", require("./routes/proyecto"));
  app.use("/api/gitlab", require("./routes/gitlab"));
  app.use("/api/auth", require("./routes/auth"));
};
