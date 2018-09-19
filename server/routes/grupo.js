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
router.post("/usuario/:id", controller.destroyUser);
router.put("/:id", controller.upsert);
router.patch("/:id", controller.patch);
router.patch("/usuario/:id", controller.patchUsuario);
// router.patch("/proyecto/:id", controller.patchProject);
router.delete("/:id", controller.destroy);

module.exports = router;