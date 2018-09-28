"use strict";

var express = require("express");
var controller = require("../controllers/solicitud");
import {
    generarOpciones
} from '../components/sequelize-middleware';
var router = express.Router();

router.get("/", generarOpciones, controller.index);
router.get("/:id", controller.show);
router.post("/", controller.create);
router.post("/:id/rechazar", controller.reject);
router.post("/:id/aprobar", controller.approve);
router.put("/:id", controller.upsert);
router.patch("/:id", controller.patch);
router.delete("/:id", controller.destroy);

module.exports = router;