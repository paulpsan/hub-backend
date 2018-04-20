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

let usuario = {};
usuario.email = "paulpsan@pruevb";
usuario.password = "bitbucket";
usuario.tipo = "bitbucket";
usuario.role = "usuario";

function getJson() {
  return function(resultado) {
    return resultado.json();
  };
}

async function getCommit(repositorios, usuarioBitbucket) {
  let commits = 0;
  for (const repositorio of repositorios.values) {
    await fetch(
      repositorio.links.commits.href +
        "?access_token=" +
        usuarioBitbucket.access_token
    )
      .then(getJson())
      //optenemos datos del commit de un respectivo repositorio
      .then(resultado => {
        commits = commits + resultado.values.length;
        return commits;
      });
  }
  return commits;
  console.log("object", commits);
}

function setRepositorios() {
  return function(usuarioBitbucket) {
    return fetch(
      usuarioBitbucket.links.repositories.href +
        "?access_token=" +
        usuarioBitbucket.access_token
    )
      .then(getJson())
      .then(repositorios => {
        getCommit(repositorios, usuarioBitbucket);
        // console.log("commits", commits);
        return usuarioBitbucket;
      });
  };
}

function setEmail() {
  return function(usuarioBitbucket) {
    // console.log("getEmail", usuarioBitbucket);
    return fetch(
      "https://api.bitbucket.org/2.0/user/emails?access_token=" +
        usuarioBitbucket.access_token
    )
      .then(getJson())
      .then(result => {
        console.log(result);
        usuario.email = result.values[0].email;
        return usuarioBitbucket;
      });
  };
}

function crearActualizar(usuario) {
  return function(usuarioBitbucket) {
    // console.log("crearActualiza", usuarioBitbucket);
    usuario.nombre = usuarioBitbucket.display_name;
    usuario.login = usuarioBitbucket.username;
    return Usuario.findOne({
      where: {
        login: usuarioBitbucket.username,
        tipo: "bitbucket"
      }
    }).then(user => {
      if (user !== null) {
        //colocar modelo de usuario
        return Usuario.update(usuario, {
          where: {
            _id: user._id
          }
        }).then(resp => {
          return usuarioBitbucket;
        });
      } else {
        return Usuario.create(usuario).then(resp => {
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
            .then(getJson())
            .then(json => {
              usuarioBitbucket = json;
              usuarioBitbucket.access_token = access_token;
              return usuarioBitbucket;
            })
            .then(setEmail())
            // cargar datos del repositorios
            .then(setRepositorios())
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
        console.log("enviando :", result);
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
