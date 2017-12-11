"use strict";
import express from "express";
import userController from "../controllers/user";
import githubController from "../controllers/github";
import passport from "passport";
import config from "../config/environment";
import qs from "querystring";
import https from "https";
const api = express.Router();

// api.get('/inicio',userController.ejemplo);
api.get("/inicio", userController.obtener);
// api.get('/auth/github',githubController.auth);

api.get("/github/:code", function(req, res) {
  // log('authenticating code:', req.params.code, true);
  authenticate(req.params.code, function(err, token) {
    var result;
    if (err || !token) {
      result = { error: err || "bad_code" };
      console.log(result.error);
    } else {
      result = { token: token };
      console.log("token", result.token, true);
    }
    res.json(result);
  });
});

api.get(
  "/auth/github/callback",
  // passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.send("res");
    console.log(req.params);
  }
);

function authenticate(code, cb) {
    var data = qs.stringify({
      client_id: config.oauthGithub.oauth_client_id,
      client_secret: config.oauthGithub.oauth_client_secret,
      code: code
    });
  
    var reqOptions = {
      host: config.oauthGithub.oauth_host,
      port: config.oauthGithub.oauth_port,
      path: config.oauthGithub.oauth_path,
      method: config.oauthGithub.oauth_method,
      headers: { 'content-length': data.length }
    };
  
    var body = "";
    var req = https.request(reqOptions, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) { body += chunk; });
      res.on('end', function() {
        cb(null, qs.parse(body).access_token);
      });
    });
  
    req.write(data);
    req.end();
    req.on('error', function(e) { cb(e.message); });
  }


module.exports = api;
