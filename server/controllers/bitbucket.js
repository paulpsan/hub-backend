"use strict";

import { Usuario } from "../sqldb";
import { Repositorio } from "../sqldb";
import TokenController from "./token";
import config from "../config/environment";
import request from "request";
// import { fetch } from "node-fetch";

var fetch = require("node-fetch");
let usuarioBitbucket = {};

function getJson() {
  return function(resultado) {
    return resultado.json();
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
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
          usuarioBitbucket._id = user._id;
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
              resolver({
                token: objRes.token,
                usuario: responseBitbucket
              });

              // usuarioBitbucket.nombre = responseBitbucket.display_name;
              // usuarioBitbucket.email = "";
              // usuarioBitbucket.password = "bitbucket";
              // usuarioBitbucket.tipo = "bitbucket";
              // usuarioBitbucket.role = "usuario";
              // usuarioBitbucket.login = responseBitbucket.username;
              // usuarioBitbucket.avatar = responseBitbucket.links.avatar.href;
              // usuarioBitbucket.url = responseBitbucket.links.html.href;
              // return responseBitbucket;
            })
            // .then(getEmail(response, objRes.token))
            // // cargar datos del repositorios
            // // .then(getRepositorios(response))
            // // .then(getCommit())
            // .then(crearActualizar(response))
            // .then(responseBitbucket => {
            //   delete usuarioBitbucket.password;
            //   resolver({
            //     token: objRes.token,
            //     usuario: usuarioBitbucket
            //   });
            // })
            .catch(err => {
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

var asyncLoop = function(o) {
  var i = -1;
  var loop = function() {
    i++;
    if (i == o.length) {
      o.callback();
      return;
    }
    o.functionToLoop(loop, i);
  };
  loop(); //init
};

function nuevoUsuario(usuarioOauth, token) {
  return new Promise((resolver, rechazar) => {
    console.log("user", usuarioOauth);
    let objBitbucket = {};
    objBitbucket.nombre = usuarioOauth.display_name;
    objBitbucket.email = "";
    objBitbucket.password = "";
    objBitbucket.tipo = "bitbucket";
    objBitbucket.role = "usuario";
    objBitbucket.login = usuarioOauth.username;
    objBitbucket.cuentas = ["local", "bitbucket"];
    objBitbucket.avatar = usuarioOauth.links.avatar.href;
    objBitbucket.url = usuarioOauth.links.html.href;
    objBitbucket.bitbucket = true;
    objBitbucket.id_bitbucket = usuarioOauth.account_id;
    fetch("https://api.bitbucket.org/2.0/user/emails?access_token=" + token)
      .then(getJson())
      .then(result => {
        console.log(result);
        objBitbucket.email = result.values[0].email;
        Usuario.create(objBitbucket)
          .then(respUsuario => {
            resolver(respUsuario);
          })
          .catch(err => {
            rechazar(err);
          });
      })
      .catch(err => {
        rechazar(err);
      });
  });
}

export function singOauthBitbucket(req, res) {
  let usuarioOauth = req.body.usuarioOauth;
  let token = req.body.token;
  Usuario.findOne({
    where: {
      id_bitbucket: usuarioOauth.account_id
    }
  })
    .then(user => {
      if (user !== null) {
        //eliminar password
        TokenController.updateToken("bitbucket", result, token);
        res.json({ token: token, usuario: user });
      } else {
        nuevoUsuario(usuarioOauth, token)
          .then(result => {
            TokenController.createToken("bitbucket", result, token);
            res.json({ usuario: result, token: token });
          })
          .catch(err => {
            res.send(err);
          });
      }
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
}

export function datosBitbucket(req, res) {
  let objetoUsuario = req.body.usuario;
  let token = req.body.token;
  fetch("https://api.bitbucket.org/2.0/user?access_token=" + token)
    .then(getJson())
    .then(usuario => {
      fetch(usuario.links.repositories.href + "?access_token=" + token)
        .then(getJson())
        .then(repositorios => {
          let i = 1;
          let objDatos = [];
          if (repositorios.values.length > 0) {
            let objCommits = {};
            asyncLoop({
              length: repositorios.values.length,
              functionToLoop: function(loop, i) {
                fetch(
                  repositorios.values[i].links.commits.href +
                    "?access_token=" +
                    token
                )
                  .then(getJson())
                  .then(commits => {
                    let objRepositorio = {
                      id_repositorio: i,
                      nombre: repositorios.values[i].name,
                      descripcion: repositorios.values[i].description,
                      avatar: repositorios.values[i].links.avatar.href,
                      tipo: "bitbucket",
                      estado: true,
                      html_url: repositorios.values[i].links.html.href,
                      git_url: repositorios.values[i].links.clone[1].href,
                      api_url: repositorios.values[i].links.self.href,
                      fork: repositorios.values[i].links.forks.href,
                      hooks: repositorios.values[i].links.hooks.href,
                      tags: repositorios.values[i].links.tags.href,
                      issues:
                        config.bitbucket.api_url +
                        "repositories/" +
                        repositorios.values[i].full_name +
                        "/issues",
                      branches: repositorios.values[i].links.branches.href,
                      lenguajes: repositorios.values[i].language,
                      star: "",
                      commits: commits,
                      downloads: repositorios.values[i].links.downloads.href,
                      fk_usuario: objetoUsuario._id
                    };
                    Repositorio.findOne({
                      where: {
                        nombre: objRepositorio.nombre,
                        fk_usuario: objetoUsuario._id
                      }
                    })
                      .then(user => {
                        if (user !== null) {
                          Repositorio.update(objRepositorio, {
                            where: {
                              _id: user._id
                            }
                          })
                            .then(resultRepo => {})
                            .catch(err => {});
                        } else {
                          Repositorio.create(objRepositorio)
                            .then(resultRepo => {
                              // for (const commit of commits) {
                              //   let objCommit = {
                              //     sha: commit.sha,
                              //     autor: commit.commit.author.name,
                              //     mensaje: commit.commit.mensaje,
                              //     fecha: commit.commit.author.date,
                              //     fk_repositorio: resultRepo._id
                              //   };
                              //   Commit.create(objCommit)
                              //     .then(resultCommit => {
                              //       console.log("resul", resultCommit);
                              //     })
                              //     .catch(handleError(res));
                              // }
                            })
                            .catch(err => {});
                        }
                      })
                      .catch(err => {});

                    objDatos.push({
                      lenguajes: repositorios.values[i].language,
                      // lenguajes: objLenguajes,
                      repo: repositorios.values[i],
                      commits: commits.values
                    });
                    loop();
                  })
                  .catch(handleError(res));
              },
              callback: function() {
                objetoUsuario.datos = objDatos;
                Usuario.update(objetoUsuario, {
                  where: {
                    email: req.body.usuario.email.toLowerCase(),
                    tipo: "bitbucket"
                  }
                }).then(result => {
                  result > 0
                    ? res
                        .status(200)
                        .json({ result: "Se realizaron actualizaciones" })
                    : res
                        .status(200)
                        .json({ result: "No tiene actualizaciones" });
                });
              }
            });
          }
        })
        .catch(handleError(res));
    })
    .catch(handleError(res));
}
