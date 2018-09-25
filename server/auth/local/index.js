"use strict";

import express from "express";
import passport from "passport";
import {
  signToken
} from "../auth.service";

var router = express.Router();

router.post("/", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    console.log(err, user);
    var error = err || info;
    if (error) {
      return res.status(404).json(error);
    }
    if (!user) {
      return res
        .status(404)
        .json({
          message: "Something went wrong, please try again."
        });
    }
    var token = signToken(user);
    user.password = undefined;
    res.json({
      usuario: user,
      token
    });
  })(req, res, next);
});

export default router;