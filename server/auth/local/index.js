"use strict";

import express from "express";
import passport from "passport";
import { signToken } from "../auth.service";

var router = express.Router();

router.post("/", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    console.log("usuario", user, err, info);
    var error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!user) {
      return res
        .status(404)
        .json({ mensaje: "Something went wrong, please try again." });
    }
    console.log("usuario", user);
    var token = signToken(user._id, user.role);
    res.json({ usuario: user, token });
  })(req, res, next);
});

export default router;
