"use strict";
import express from "express";
import config from "../config/environment";
import { Usuario } from "../sqldb";
var controllerGithub = require("../controllers/github");
var controllerGitLab = require("../controllers/gitlab");
var controllerBitbucket = require("../controllers/bitbucket");
// var controllerlocal = require('../controllers/bitbucket');

var router = express.Router();

router.get("/github/:code", controllerGithub.authGithub);

router.get("/gitlab/:code", controllerGitLab.authGitlab);

router.get("/bitbucket/:code", controllerBitbucket.authBitbucket);

router.post("/refresh/github", controllerGithub.refreshGithub);

router.post("/refresh/gitlab", controllerGitLab.refreshGitlab);

router.post("/refresh/bitbucket", controllerBitbucket.refreshBitbucket);

router.use("/local", (req, res, next) => {
   
  require("../auth/local/passport").setup(Usuario);
  require("../auth/local").default(req, res, next);
});

module.exports = router;
