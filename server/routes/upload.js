"use strict";

var express = require("express");
var controller = require("../controllers/upload");
import * as autenticacion from "../auth/auth.service";
var router = express.Router();

router.put(
  "/:tipo/:id",
  autenticacion.isAuthenticated(),
  controller.uploadFile
);
router.get(
  "/:tipo/:img",
  autenticacion.isAuthenticated(),
  controller.getImage
);
module.exports = router;
