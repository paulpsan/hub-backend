"use strict";
import express from "express";
var controllerGitLab = require('../controllers/gitlab');


var router = express.Router();

router.get("/auth/:code",controllerGitLab.authGitlab);
router.post("/usuarios/:id_proyecto",controllerGitLab.getMembers);
// router.get("/bitbucker/:code",controller.authBitbucker);


module.exports = router;
