"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import https from "https";
import request from "request";
var fetch = require("node-fetch");
let usuarioGithub = {};
let headersClient = qs.stringify(
  {
    client_id: config.github.clientId,
    client_secret: config.github.clientSecret
  },
  true
);

function getJson() {
  return function(resultado) {
    return resultado.json();
  };
}
function crearActualizarUsuario(response) {
  return function(responseGithub) {
    return Usuario.findOne({
      where: {
        login: responseGithub.login,
        tipo: "github"
      }
    }).then(user => {
      if (user !== null) {
        //colocar modelo de usuario
        return Usuario.update(usuarioGithub, {
          where: {
            _id: user._id
          }
        })
          .then(resp => {
            return responseGithub;
          })
          .catch(err => {
            return response.send(err);
          });
      } else {
        return Usuario.create(usuarioGithub)
          .then(resp => {
            usuarioGithub._id = resp._id;
            return responseGithub;
          })
          .catch(err => {
            return response.send(err);
          });
      }
    })
    .catch(err => {
      return response.send(err);
    });
  };
}

function authenticateGithub(code, response) {
  return new Promise((resolver, rechazar) => {
    let data = qs.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code: code
    });
    let objRes = {};
    let promesa = fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: data
    });
    promesa
      .then(resp => {
        return resp.text();
      })
      .then(token => {
        objRes.token = qs.parse(token).access_token;
        if (objRes.token) {
          fetch("https://api.github.com/user?access_token=" + objRes.token)
            .then(getJson())
            .then(responseGithub => {
              console.log("user", responseGithub);
              usuarioGithub.nombre = responseGithub.name;
              usuarioGithub.email = responseGithub.email;
              usuarioGithub.password = "github";
              usuarioGithub.tipo = "github";
              usuarioGithub.role = "usuario";
              usuarioGithub.login = responseGithub.login;
              usuarioGithub.avatar = responseGithub.avatar_url;
              usuarioGithub.url = responseGithub.html_url;
              usuarioGithub.token = objRes.token;
              return responseGithub;
            })
            .then(crearActualizarUsuario(response))
            .then(responseGithub => {
              delete usuarioGithub.password;
              resolver({
                token: objRes.token,
                usuario: usuarioGithub
              });
            })
            .catch(err => {
              rechazar(err);
            });
        }
      })
      .catch(err => {
        rechazar(err);
      });
  });
}

export function authGithub(req, res) {
  authenticateGithub(req.params.code, res)
    .then(
      result => {
        res.json(result);
      },
      error => {
        res.send(error);
      }
    )
    .catch(err => {
      res.send(err);
    });
}
