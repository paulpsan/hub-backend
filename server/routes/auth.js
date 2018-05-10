"use strict";
import express from "express";
var controllerGithub = require('../controllers/github');
var controllerGitLab = require('../controllers/gitlab');
var controllerBitbucket = require('../controllers/bitbucket');
// var controllerlocal = require('../controllers/bitbucket');

var router = express.Router();

router.get("/github/:code",controllerGithub.authGithub);

router.get("/gitlab/:code",controllerGitLab.authGitlab);

router.get("/bitbucket/:code",controllerBitbucket.authBitbucket);

router.get("/local",controllerBitbucket.authBitbucket);


module.exports = router;
