"use strict";
import { Usuario } from "../sqldb";
import { Repositorio } from "../sqldb";
import { Commit } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
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

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function crearActualizarUsuario() {
  return function(responseGithub) {
    return Usuario.findOne({
      where: {
        id_github: responseGithub.id
      }
    })
      .then(user => {
        if (user !== null) {
          //colocar modelo de usuario
          usuarioGithub._id = user._id;
          return Usuario.update(usuarioGithub, {
            where: {
              _id: user._id
            }
          })
            .then(resp => {
              return responseGithub;
            })
            .catch(err => {
              return err;
            });
        } else {
          return Usuario.create(usuarioGithub)
            .then(resp => {
              usuarioGithub._id = resp._id;
              console.log("user encontrado", user);
              return responseGithub;
            })
            .catch(err => {
              return err;
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
              resolver({
                token: objRes.token,
                usuario: responseGithub
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

function nuevoUsuario(token) {
  return new Promise((resolver, rechazar) => {
    fetch("https://api.github.com/user?access_token=" + token)
      .then(getJson())
      .then(responseGithub => {
        // console.log("user", responseGithub);
        usuarioGithub.nombre = responseGithub.name;
        usuarioGithub.email = responseGithub.email;
        usuarioGithub.password = "";
        usuarioGithub.tipo = "github";
        usuarioGithub.role = "usuario";
        usuarioGithub.login = responseGithub.login;
        usuarioGithub.cuentas = ["local", "github"];
        usuarioGithub.avatar = responseGithub.avatar_url;
        usuarioGithub.url = responseGithub.html_url;
        usuarioGithub.github = true;
        usuarioGithub.id_github = responseGithub.id;
        return responseGithub;
      })
      .then(crearActualizarUsuario())
      .then(responseGithub => {
        console.log("responseGithub", usuarioGithub);
        resolver({
          token: token,
          usuario: usuarioGithub
        });
      })
      .catch(err => {
        rechazar(err);
      });
  });
}

function adicionaDatosUsuario(token, usuario, usuarioOauth) {
  return new Promise((resolver, rechazar) => {
    fetch(
      "https://api.github.com/users/" +
        usuarioOauth.login +
        "/repos" +
        "?access_token=" +
        token
    )
      .then(getJson())
      .then(repositorios => {
        // console.log("reps", repositorios);
        let i = 1;
        let objDatos = [];
        if (repositorios.length > 0) {
          let objCommits = {};
          asyncLoop({
            length: repositorios.length,
            functionToLoop: function(loop, i) {
              fetch(
                "https://api.github.com/repos/" +
                  repositorios[i].full_name +
                  "/commits?access_token=" +
                  token
              )
                .then(getJson())
                .then(commits => {
                  let objRepositorio = {
                    id_repositorio: repositorios[i].id,
                    nombre: repositorios[i].name,
                    descripcion: repositorios[i].description || "",
                    avatar: "",
                    tipo: "github",
                    estado: false,
                    html_url: repositorios[i].html_url,
                    git_url: repositorios[i].git_url,
                    api_url: repositorios[i].url,
                    fork: repositorios[i].forks_url,
                    hooks: repositorios[i].hooks_url,
                    tags: repositorios[i].tags_url,
                    issues: repositorios[i].url + "/issues",
                    branches: repositorios[i].url + "/branches",
                    lenguajes: repositorios[i].languages_url,
                    star: repositorios[i].stargazers_count,
                    commits: commits,
                    downloads: repositorios[i].stargazers_count,
                    fk_usuario: usuario._id
                  };

                  Repositorio.findOne({
                    where: {
                      id_repositorio: objRepositorio.id_repositorio,
                      fk_usuario: usuario._id
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
                          .catch();
                      } else {
                        // console.log("objRepositorio", objRepositorio);
                        return Repositorio.create(objRepositorio)
                          .then(resultRepo => {
                            return;
                            // for (const commit of commits) {
                            //   let objCommit = {
                            //     sha: commit.sha,
                            //     autor: commit.commit.author.name,
                            //     mensaje: commit.commit.message,
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
                          .catch();
                      }
                    })
                    .catch();
                  loop();
                })
                .catch(err => {
                  console.log(err);
                });
            },
            callback: function() {
              usuario.github = true;
              usuario.id_github = usuarioOauth.id;
              Usuario.update(usuario, {
                where: {
                  _id: usuario._id
                }
              }).then(result => {
                console.log("++++++++++++++++++", result, "++++++++++++++++");
                if (result.length > 0) {
                  resolver({
                    token: token,
                    usuario: usuario
                  });
                  // res
                  //   .status(200)
                  //   .json({ result: "Se realizaron actualizaciones" });
                } else {
                  rechazar({ err: "No tiene actualizaciones" });
                  // res.status(200).json({ result: "No tiene actualizaciones" });
                }
              });
            }
          });
        }
      })
      .catch();
  });
}

export function crearUsuarioOauth(req, res) {
  let usuario = req.body.usuario;
  let usuarioOauth = req.body.usuarioOauth;
  let token = req.body.token;
  if (usuario == null) {
    nuevoUsuario(token).then(
      result => {
        console.log("result", result);
        Usuario.findOne({
          where: {
            email: result.usuario.email,
            tipo: result.usuario.tipo
          }
        })
          .then(user => {
            //armar usuario respuesta
            delete user.password;
            res.json({ token: result.token, usuario: user });
          })
          .catch(err => {
            res.send(err);
          });
      },
      error => {
        res.send(error);
      }
    );
  } else {
    console.log("adiciona al repo");
    adicionaDatosUsuario(token, usuario, usuarioOauth)
      .then(resp => {
        Usuario.findById(resp.usuario._id)
          .then(user => {
            //armar usuario respuesta
            res.json({ token: resp.token, usuario: user });
          })
          .catch(err => {
            res.send(err);
          });
      })

      .catch(err => {
        res.send(err);
      });
  }

  // usuarioGithub(req.params.code, res)
  //   .then(
  //     result => {
  //       Usuario.findOne({
  //         where: {
  //           email: result.usuario.email,
  //           tipo: result.usuario.tipo
  //         }
  //       })
  //         .then(user => {
  //           //armar usuario respuesta
  //           delete user.password;
  //           res.json({ token: result.token, usuario: user });
  //         })
  //         .catch(err => {
  //           res.send(err);
  //         });
  //     },
  //     error => {
  //       res.send(error);
  //     }
  //   )
  //   .catch(err => {
  //     res.send(err);
  //   });
}

export function authGithub(req, res) {
  authenticateGithub(req.params.code, res)
    .then(
      result => {
        res.json({ token: result.token, usuario: result.usuario });
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

export function datosGithub(req, res) {
  let headersClient = qs.stringify(
    {
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret
    },
    true
  );
  let objetoUsuario = req.body.usuario;
  let token = req.body.token;
  console.log("asdd", req.body);

  fetch(
    "https://api.github.com/users/" +
      objetoUsuario.login +
      "/repos" +
      "?access_token=" +
      token
  )
    .then(getJson())
    .then(repositorios => {
      let i = 1;
      let objDatos = [];
      if (repositorios.length > 0) {
        let objCommits = {};
        asyncLoop({
          length: repositorios.length,
          functionToLoop: function(loop, i) {
            fetch(
              "https://api.github.com/repos/" +
                repositorios[i].full_name +
                "/commits?access_token=" +
                token
            )
              .then(getJson())
              .then(commits => {
                let objRepositorio = {
                  id_repositorio: repositorios[i].id,
                  nombre: repositorios[i].name,
                  descripcion: repositorios[i].description || "",
                  avatar: "",
                  tipo: "github",
                  estado: true,
                  html_url: repositorios[i].html_url,
                  git_url: repositorios[i].git_url,
                  api_url: repositorios[i].url,
                  fork: repositorios[i].forks_url,
                  hooks: repositorios[i].hooks_url,
                  tags: repositorios[i].tags_url,
                  issues: repositorios[i].url + "/issues",
                  branches: repositorios[i].url + "/branches",
                  lenguajes: repositorios[i].languages_url,
                  star: repositorios[i].stargazers_count,
                  commits: commits,
                  downloads: repositorios[i].stargazers_count,
                  fk_usuario: objetoUsuario._id
                };
                Repositorio.findOne({
                  where: {
                    id_repositorio: objRepositorio.id_repositorio,
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
                        .catch();
                    } else {
                      // console.log("objRepositorio", objRepositorio);
                      return Repositorio.create(objRepositorio)
                        .then(resultRepo => {
                          return;
                          // for (const commit of commits) {
                          //   let objCommit = {
                          //     sha: commit.sha,
                          //     autor: commit.commit.author.name,
                          //     mensaje: commit.commit.message,
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
                        .catch();
                    }
                  })
                  .catch();

                objDatos.push({
                  lenguajes: repositorios[i].language,
                  repo: repositorios[i],
                  commits: commits
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
                tipo: "github"
              }
            }).then(result => {
              result > 0
                ? res
                    .status(200)
                    .json({ result: "Se realizaron actualizaciones" })
                : res.status(200).json({ result: "No tiene actualizaciones" });
              // if(result>0){
              //   res.status(200).json({ result:"Se realizaron actualizaciones" });
              // }
              // else{
              //   res.status(200).json({ result:"No tiene actualizaciones" });
              // }
            });
          }
        });
      }
    })
    .catch(handleError(res));
}
