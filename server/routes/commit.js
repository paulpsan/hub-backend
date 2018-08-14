"use strict";

var express = require("express");
var controller = require("../controllers/commit");

var router = express.Router();

router.get("/", controller.index);
router.get("/:id", controller.show);
router.post("/", controller.create);
router.get("/:id/usuarios", controller.totalCommit);
router.get("/:id/usuarios/graficos", controller.byUser);
router.get("/:id/repositorio/graficos", controller.graficaRepositorio);
router.put("/:id", controller.upsert);
router.patch("/:id", controller.patch);
router.delete("/:id", controller.destroy);

module.exports = router;
