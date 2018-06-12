"use strict";

export default app => {
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/commits", require("./routes/commit"));
  app.use("/api/gitlab", require("./routes/gitlab"));
  app.use("/api/proyectos", require("./routes/proyecto"));
  app.use("/api/repositorios", require("./routes/repositorio"));
  app.use("/api/usuarios", require("./routes/usuario"));
  app.use("/api/upload", require("./routes/upload"));
};
