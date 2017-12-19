"use strict";
import express from "express";
var controller = require('../controllers/usuario');
// import { controller } from "../controllers/usuario";

var router = express.Router();



router.get("/github/:code",controller.authGithub);
// router.get("/gitlab/:code",controller.authGitlab);
// router.get("/bitbucker/:code",controller.authBitbucker);


module.exports = router;
