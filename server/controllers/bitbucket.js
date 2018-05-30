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
let usuarioBitbucket = {};
let usuarioResponse = new UsuarioResponse();
let repositoriosBb = {};
let commitsBb = 0;
let datos = [];
let usuario = {};

function getJson() {
  return function(resultado) {
    return resultado.json();
  };
}

// function getCommit(response) {
//   return function(repositoriosBb) {
//     let index = 1;
//     for (const repositorio of repositoriosBb.values) {
//       fetch(
//         repositorio.links.commits.href +
//           "?access_token=" +
//           usuarioBitbucket.access_token
//       )
//         .then(getJson())
//         //optenemos datos del commit de un respectivo repositorio
//         .then(resultado => {
//           datos.push({
//             lenguajes: repositorio.language,
//             repo: repositorio,
//             commits: resultado.values
//           });
//           if (index == repositoriosBb.values.length) {
//             console.log("resultado", resultado);
//             usuario.datos = datos;
//             datos = [];
//             Usuario.findOne({
//               where: {
//                 login: usuarioBitbucket.username,
//                 tipo: "bitbucket"
//               }
//             }).then(user => {
//               Usuario.update(usuario, {
//                 where: {
//                   _id: user._id
//                 }
//               })
//                 .then(resp => {
//                   return usuarioBitbucket;
//                 })
//                 .catch(err => {
//                   return response.send(err);
//                 });
//             });
//           }
//           index++;
//           return usuarioBitbucket;
//         });
//     }
//     return usuarioBitbucket;
//   };
// }

// function getRepositorios(response) {
//   return function(usuarioBitbucket) {
//     return fetch(
//       usuarioBitbucket.links.repositories.href +
//         "?access_token=" +
//         usuarioBitbucket.access_token
//     )
//       .then(getJson())
//       .then(getCommit(response))
//       .catch(err => {
//         console.log(err);
//       });
//   };
// }

function getEmail(response, token) {
  return function(responseBitbucket) {
    // console.log("getEmail", usuarioBitbucket);
    return fetch(
      "https://api.bitbucket.org/2.0/user/emails?access_token=" + token
    )
      .then(getJson())
      .then(result => {
        usuarioBitbucket.email = result.values[0].email;
        return responseBitbucket;
      })
      .catch(err => {
        return response.send(err);
      });
  };
}

function crearActualizar(response) {
  return function(responseBitbucket) {
    return Usuario.findOne({
      where: {
        login: responseBitbucket.username,
        tipo: "bitbucket"
      }
    })
      .then(user => {
        if (user !== null) {
          //colocar modelo de usuario
          return Usuario.update(usuarioBitbucket, {
            where: {
              _id: user._id
            }
          })
            .then(resp => {
              return responseBitbucket;
            })
            .catch(err => {
              return response.send(err);
            });
        } else {
          return Usuario.create(usuarioBitbucket)
            .then(resp => {
              usuarioBitbucket._id = resp._id;
              return responseBitbucket;
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

function authenticateBitbucket(code, response) {
  return new Promise((resolver, rechazar) => {
    let objRes = {};
    request
      .post(
        `https://bitbucket.org/site/oauth2/access_token`,
        {
          auth: {
            username: config.bitbucket.clientId,
            password: config.bitbucket.clientSecret
          },
          form: {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: config.bitbucket.callback
          }
        },
        (err, resp, body) => {
          const data = JSON.parse(body);
          objRes.token = data.access_token;
          if (objRes.token) {
            fetch(
              "https://api.bitbucket.org/2.0/user?access_token=" + objRes.token
            )
              .then(getJson())
              .then(responseBitbucket => {
                console.log("obj :", responseBitbucket);
                usuarioBitbucket.nombre = responseBitbucket.display_name;
                usuarioBitbucket.email = "";
                usuarioBitbucket.password = "bitbucket";
                usuarioBitbucket.tipo = "bitbucket";
                usuarioBitbucket.role = "usuario";
                usuarioBitbucket.login = responseBitbucket.username;
                usuarioBitbucket.avatar = responseBitbucket.links.avatar.href;
                usuarioBitbucket.url = responseBitbucket.links.html.href;
                return responseBitbucket;
              })
              .then(getEmail(response, objRes.token))
              // cargar datos del repositorios
              // .then(getRepositorios(response))
              // .then(getCommit())
              .then(crearActualizar(response))
              .then(responseBitbucket => {
                delete usuarioBitbucket.password;
                resolver({
                  token: objRes.token,
                  usuario: usuarioBitbucket
                });
              })
              .catch(err => {
                rechazar(err);
              });
          }
        }
      )
  });
}

export function authBitbucket(req, res) {
  authenticateBitbucket(req.params.code, res)
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
