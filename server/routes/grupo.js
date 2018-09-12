"use strict";

var express = require("express");
var controller = require("../controllers/grupo");

var router = express.Router();

router.get("/", controller.index);
router.get("/:id", controller.show);
router.get("/set/:id", controller.setGrupo);
router.post("/", controller.create);
router.put("/:id", controller.upsert);
router.patch("/:id", controller.patch);
router.delete("/:id", controller.destroy);

module.exports = router;
