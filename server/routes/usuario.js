"use strict";

var express = require("express");
var controller = require("../controllers/usuario");
import {
  generarOpciones
} from "../components/sequelize-middleware";
import * as autenticacion from "../auth/auth.service";

var router = express.Router();

router.get("/captcha", controller.captchaUser);
router.get("/verificacion", controller.verifyUser);
router.get("/clone", controller.clone);
router.get("/", autenticacion.isAuthenticated(), generarOpciones, controller.index);
router.get("/admin", autenticacion.isAuthenticated(), generarOpciones, controller.indexAll);

router.get("/:id", autenticacion.isAuthenticated(), generarOpciones, controller.show);
router.get("/:id/proyectos",controller.getProyects);
router.post("/", controller.create);
router.post("/reset", controller.recoverPassword);
router.post("/gitlab", controller.createGitlab);
router.post("/recuperar", controller.recoverUser);
router.post("/contrasena", controller.passwordUser);
router.post("/:id/bloquear", controller.blockUser);
router.post("/:id/desbloquear", controller.unblockUser);
router.put("/:id", autenticacion.isAuthenticated(), controller.upsert);
router.patch("/:id", controller.patch);
router.delete("/:id", autenticacion.isAuthenticated(), controller.destroy);

module.exports = router;