"use strict";

var express = require("express");
var controller = require("../controllers/grupo");
import {
  generarOpciones
} from '../components/sequelize-middleware';
var router = express.Router();

router.get("/", generarOpciones, controller.index);
router.get("/:id", controller.show);
router.get("/usuarios/:id", controller.getGroup);
router.get("/:id/usuarios", controller.getUsers);
router.get("/:id/proyectos", controller.getProjects);
router.post("/", controller.create);
router.post("/:id/usuarios", controller.setUser);
router.post("/:id/proyectos", controller.createProject);
router.put("/:id", controller.upsert);
router.patch("/:id", controller.patch);
router.patch("/:id_grupo/usuarios/:id_usuario", controller.patchUser);
router.patch("/:id_grupo/proyectos/:id_proyecto", controller.patchProject);
// router.patch("/proyecto/:id", controller.patchProject);
router.delete("/:id", controller.destroy);
router.delete("/:id_grupo/usuarios/:id_usuario", controller.destroyUser);
router.delete("/:id_grupo/proyectos/:id_proyecto", controller.destroyProject);

module.exports = router;