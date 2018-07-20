"use strict";
import express from "express";
import config from "../config/environment";
import { Usuario } from "../sqldb";
var controllerGithub = require("../controllers/github");
var controllerGitLab = require("../controllers/gitlab");
var controllerBitbucket = require("../controllers/bitbucket");
// var controllerlocal = require('../controllers/bitbucket');

var router = express.Router();

router.get("/login/github/:code", controllerGithub.authLoginGithub);

router.get("/login/gitlab/:code", controllerGitLab.authLoginGitlab);

router.get("/login/bitbucket/:code", controllerBitbucket.authLoginBitbucket);

router.get("/add/github/:code", controllerGithub.authAddGithub);

router.get("/add/gitlab/:code", controllerGitLab.authAddGitlab);

router.get("/add/bitbucket/:code", controllerBitbucket.authAddBitbucket);

router.post("/refresh/github", controllerGithub.refreshGithub);

router.post("/refresh/gitlab", controllerGitLab.refreshGitlab);

router.post("/refresh/bitbucket", controllerBitbucket.refreshBitbucket);

router.use("/local", (req, res, next) => {
   
  require("../auth/local/passport").setup(Usuario);
  require("../auth/local").default(req, res, next);
});

module.exports = router;
