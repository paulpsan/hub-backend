"use strict";
import express from "express";
var controllerGithub = require('../controllers/github');
var controllerGitLab = require('../controllers/gitlab');


var router = express.Router();

router.get("/github/:code",controllerGithub.authGithub);

router.get("/gitlab/:code",controllerGitLab.authGitlab);
// router.get("/bitbucker/:code",controller.authBitbucker);


module.exports = router;
