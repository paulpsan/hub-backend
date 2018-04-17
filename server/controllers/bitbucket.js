"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import request from "request";
import UsuarioBitbucket from "../models/usuarioBitbucket";
import UsuarioResponse from "../models/usuarioResponse";
// import { fetch } from "node-fetch";

var fetch = require("node-fetch");
let usuarioBitbucket = new UsuarioBitbucket();
let usuarioResponse = new UsuarioResponse();

let objetoUsuario = {};
objetoUsuario._id = "";
objetoUsuario.nombre = "";
objetoUsuario.email = "paulpsan@pruevb";
objetoUsuario.password = "bitbucket";
objetoUsuario.tipo = "bitbucket";
objetoUsuario.role = "usuario";
objetoUsuario.login = "";

function getEmail() {
  return function(usuarioBitbucket) {
    // console.log("getEmail", usuarioBitbucket);
    return fetch(
      "https://api.bitbucket.org/2.0/user/emails?access_token=" +
        usuarioBitbucket.access_token
    )
      .then(res => {
        return res.json();
      })
      .then(result => {
        objetoUsuario.email = result.values[0].email;
        return usuarioBitbucket;
      });
  };
}

function crearActualizar() {
  return function(usuarioBitbucket) {
    // console.log("crearActualiza", usuarioBitbucket);
    objetoUsuario.nombre = usuarioBitbucket.display_name;
    objetoUsuario.login = usuarioBitbucket.username;
    return Usuario.findOne({
      where: {
        login: usuarioBitbucket.username,
        tipo: "bitbucket"
      }
    }).then(user => {
      if (user !== null) {
        //colocar modelo de usuario
        return Usuario.upsert(objetoUsuario, {
          where: {
            _id: user._id
          }
        }).then(resp => {
          return usuarioBitbucket;
        });
      } else {
        return Usuario.create(objetoUsuario).then(resp => {
          return usuarioBitbucket;
        });
      }
    });
  };
}

function authenticateBitbucket(code) {
  return new Promise((resolver, rechazar) => {
    request.post(
      `https://bitbucket.org/site/oauth2/access_token`,
      {
        auth: {
          username: config.bitbucket.clientId,
          password: config.bitbucket.clientSecret
        },
        form: {
          grant_type: "authorization_code",
          code: code,
          redirect_uri: "http://localhost:4200/inicio"
        }
      },
      (err, response, body) => {
        const data = JSON.parse(body);
        console.log("oauth.auth.response", data);
        const {
          access_token,
          refresh_token,
          token_type,
          scopes,
          expires_in
        } = data;
        //obtenemos al Usuario con el access_token
        // TODO implementar  try catch
        if (access_token) {
          fetch(
            "https://api.bitbucket.org/2.0/user?access_token=" + access_token
          )
            .then(res => {
              return res.json();
            })
            .then(json => {
              usuarioBitbucket = json;
              usuarioBitbucket.access_token = access_token;
              return usuarioBitbucket;
            })
            .then(getEmail())
            // cargar datos del repositorios
            .then(crearActualizar())
            .then(usuario => {
              resolver(usuario);
            })
            .catch(err => {
              console.log("err", err);
              rechazar(err);
            });
        }
      }
    );
  });
}

export function authBitbucket(req, res) {
  console.log(req.params.code);
  authenticateBitbucket(req.params.code)
    .then(
      result => {
        // console.log("enviando :", result);
        Usuario.findOne({
          where: {
            login: result.username,
            tipo: "bitbucket"
          }
        }).then(resultado => {
          console.log("enviando :", resultado);
          res.json({ token: result.access_token, usuario: resultado });
        });
      },
      error => {
        res.send(error);
      }
    )
    .catch(err => {
      console.log(err);
    });
}
