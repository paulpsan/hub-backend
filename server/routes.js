"use strict";

import user_routes from "./routes/user";

export default app => {
  // app.use("/api", user_routes);
  app.use("/api/usuarios", require("./routes/usuario"));
  app.use("/api/organizaciones", require("./routes/organizacion"));
  app.use("/api/usuarioRepositorios", require("./routes/usuarioRepositorio"));
  app.use("/api/repositorios", require("./routes/repositorio"));
  app.use("/api/proyectos", require("./routes/proyecto"));
  app.use("/api/auth", require("./routes/auth"));
};
