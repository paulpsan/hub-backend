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
let repositoriosBb = {};
let commitsBb = 0;
let datos = [];
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

function getCommit(response) {
  return function(repositoriosBb) {
    let index = 1;
    for (const repositorio of repositoriosBb.values) {
      fetch(
        repositorio.links.commits.href +
          "?access_token=" +
          usuarioBitbucket.access_token
      )
        .then(getJson())
        //optenemos datos del commit de un respectivo repositorio
        .then(resultado => {
          datos.push({
            lenguajes: repositorio.language,
            repo: repositorio,
            commits: resultado.values
          });
          if (index == repositoriosBb.values.length) {
            console.log("resultado", resultado);
            usuario.datos = datos;
            datos = [];
            Usuario.findOne({
              where: {
                login: usuarioBitbucket.username,
                tipo: "bitbucket"
              }
            }).then(user => {
              Usuario.update(usuario, {
                where: {
                  _id: user._id
                }
              })
                .then(resp => {
                  return usuarioBitbucket;
                })
                .catch(err => {
                  return response.send(err);
                });
            });
          }
          index++;
          return usuarioBitbucket;
        });
    }
    return usuarioBitbucket;
  };
}

function getRepositorios(response) {
  return function(usuarioBitbucket) {
    return fetch(
      usuarioBitbucket.links.repositories.href +
        "?access_token=" +
        usuarioBitbucket.access_token
    )
      .then(getJson())
      .then(getCommit(response))
      .catch(err => {
        console.log(err);
      });
  };
}

function getEmail(response) {
  return function(usuarioBitbucket) {
    // console.log("getEmail", usuarioBitbucket);
    return fetch(
      "https://api.bitbucket.org/2.0/user/emails?access_token=" +
        usuarioBitbucket.access_token
    )
      .then(getJson())
      .then(result => {
        usuario.email = result.values[0].email;
        return usuarioBitbucket;
      })
      .catch(err => {
        return response.send(err);
      });
  };
}

function crearActualizar(resp) {
  return function(usuarioBitbucket) {
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
        })
          .then(resp => {
            return usuarioBitbucket;
          })
          .catch(err => {
            return response.send(err);
          });
      } else {
        return Usuario.create(usuario)
          .then(resp => {
            return usuarioBitbucket;
          })
          .catch(err => {
            return response.send(err);
          });
      }
    });
  };
}

function authenticateBitbucket(code, response) {
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
      (err, resp, body) => {
        const data = JSON.parse(body);
        const {
          access_token,
          refresh_token,
          token_type,
          scopes,
          expires_in
        } = data;
        //obtenemos al Usuario con el access_token
        // TODO implementar  try catch
        console.log("token", data);
        if (access_token) {
          fetch(
            "https://api.bitbucket.org/2.0/user?access_token=" + access_token
          )
            .then(getJson())
            .then(json => {
              usuarioBitbucket = json;
              usuarioBitbucket.access_token = access_token;
              usuario.nombre = usuarioBitbucket.display_name;
              usuario.login = usuarioBitbucket.username;
              usuario.avatar = usuarioBitbucket.links.avatar.href;
              return usuarioBitbucket;
            })
            .then(getEmail(response))
            // cargar datos del repositorios
            .then(getRepositorios(response))
            // .then(getCommit())
            .then(crearActualizar(response))
            .then(usuario => {
              resolver(usuario);
            })
            .catch(err => {
              console.log(err);
              rechazar(err);
            });
        }
      }
    );
  });
}

export function authBitbucket(req, res) {
  authenticateBitbucket(req.params.code, res)
    .then(
      result => {
        console.log("result :", result);
        Usuario.findOne({
          where: {
            login: result.username,
            tipo: "bitbucket"
          }
        })
          .then(resultado => {
            delete resultado.password;
            res.json({ token: result.access_token, usuario: resultado });
          })
          .catch(err => {
            res.send(error);
          });
      },
      error => {
        res.send(error);
      }
    )
    .catch(err => {
      res.send(error);
    });
}
