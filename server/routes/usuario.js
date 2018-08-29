"use strict";

var express = require("express");
var controller = require("../controllers/usuario");
import { generarOpciones } from "../components/sequelize-middleware";
import * as autenticacion from "../auth/auth.service";

var router = express.Router();

router.get("/captcha",controller.captchaUser);
router.get(
  "/",
  // autenticacion.isAuthenticated(),
  generarOpciones,
  controller.index
);

router.get(
  "/:id",
  autenticacion.isAuthenticated(),
  generarOpciones,
  controller.show
);

router.get(
  "/graficos/:id",
  autenticacion.isAuthenticated(),
  controller.graficos
);


router.post("/",controller.create);

router.post("/gitlab",controller.createGitlab);


router.post("/login", autenticacion.isAuthenticated(), controller.login);

router.post(
  "/commits/:id/github",
  autenticacion.isAuthenticated(),
  controller.commitsGithub
);

router.post(
  "/commits/:id/gitlab",
  autenticacion.isAuthenticated(),
  controller.commitsGitlab
);

router.put("/:id", autenticacion.isAuthenticated(), controller.upsert);
router.patch("/:id", autenticacion.isAuthenticated(), controller.patch);

router.delete("/:id", autenticacion.isAuthenticated(), controller.destroy);

module.exports = router;
