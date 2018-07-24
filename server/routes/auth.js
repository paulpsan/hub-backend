"use strict";
import express from "express";
import config from "../config/environment";
import { Usuario } from "../sqldb";
var controllerGithub = require("../controllers/github");
var controllerGitLab = require("../controllers/gitlab");
var controllerBitbucket = require("../controllers/bitbucket");
// var controllerlocal = require('../controllers/bitbucket');

var router = express.Router();

router.post("/login/github", controllerGithub.authLoginGithub);

router.post("/login/gitlab", controllerGitLab.authLoginGitlab);

router.post("/login/bitbucket", controllerBitbucket.authLoginBitbucket);

router.post("/add/github", controllerGithub.authAddGithub);

router.post("/add/gitlab", controllerGitLab.authAddGitlab);

router.post("/add/bitbucket", controllerBitbucket.authAddBitbucket);

router.post("/refresh/github", controllerGithub.refreshGithub);

router.post("/refresh/gitlab", controllerGitLab.refreshGitlab);

router.post("/refresh/bitbucket", controllerBitbucket.refreshBitbucket);

router.use("/local", (req, res, next) => {
   
  require("../auth/local/passport").setup(Usuario);
  require("../auth/local").default(req, res, next);
});

module.exports = router;
