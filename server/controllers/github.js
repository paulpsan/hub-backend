"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import https from "https";
import request from "request";
var fetch = require("node-fetch");
let objetoUsuario = {};
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
  return function(usuarioGithub) {
    return Usuario.findOne({
      where: {
        login: usuarioGithub.login,
        tipo: "github"
      }
    }).then(user => {
      if (user !== null) {
        //colocar modelo de usuario
        return Usuario.update(objetoUsuario, {
          where: {
            _id: user._id
          }
        })
          .then(resp => {
            return usuarioGithub;
          })
          .catch(err => {
            return response.send(err);
          });
      } else {
        return Usuario.create(objetoUsuario)
          .then(resp => {
            objetoUsuario._id = resp._id;
            return usuarioGithub;
          })
          .catch(err => {
            return response.send(err);
          });
      }
    });
  };
}

let authenticateGithub = (code, response) => {
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
            .then(json => {
              console.log("user", json);
              objetoUsuario.nombre = json.name;
              objetoUsuario.email = json.email;
              objetoUsuario.password = "github";
              objetoUsuario.tipo = "github";
              objetoUsuario.role = "usuario";
              objetoUsuario.login = json.login;
              objetoUsuario.avatar = json.avatar_url;
              objetoUsuario.url = json.url;
              objetoUsuario.token = objRes.token;
              return json;
            })
            .then(crearActualizarUsuario(response))
            .then(json => {
              resolver({
                token: objRes.token,
                usuario: objetoUsuario
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
};

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
      res.send(error);
    });
}
