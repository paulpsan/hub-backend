"use strict";
import { Usuario, Repositorio } from "../sqldb";
import Sequelize from "sequelize";
import TokenController from "./token";
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

function nuevoUsuario(usuarioOauth) {
  return new Promise((resolver, rechazar) => {
    let objGithub = {};
    objGithub.nombre = usuarioOauth.name;
    objGithub.email = usuarioOauth.email;
    objGithub.password = "";
    objGithub.tipo = "github";
    objGithub.role = "usuario";
    objGithub.login = usuarioOauth.login;
    objGithub.cuentas = ["local", "github"];
    objGithub.avatar = usuarioOauth.avatar_url;
    objGithub.url = usuarioOauth.html_url;
    objGithub.github = true;
    objGithub.id_github = usuarioOauth.id;
    Usuario.create(objGithub)
      .then(respUsuario => {
        resolver(respUsuario);
      })
      .catch(err => {
        console.log(err);
        rechazar(err);
      });
  });
}

function actualizaUsuario(user, usuarioOauth) {
  return new Promise((resolver, rechazar) => {
    let objGitlab = {};
    objGitlab.login = usuarioOauth.login;
    objGitlab.avatar = usuarioOauth.avatar_url;
    objGitlab.url = usuarioOauth.html_url;
    objGitlab.gitlab = true;
    objGitlab.id_gitlab = usuarioOauth.id;
    user
      .update(objGitlab)
      .then(respUsuario => {
        resolver(respUsuario);
      })
      .catch(err => {
        rechazar(err);
      });
  });
}

function createUpdateUser() {
  return function(response) {
    let usuarioOauth = response.usuario;
    let token = response.token;
    const Op = Sequelize.Op;
    return Usuario.findOne({
      where: {
        [Op.or]: [{ id_github: usuarioOauth.id }, { email: usuarioOauth.email }]
      }
    })
      .then(user => {
        console.log("object", user);
        if (user !== null) {
          TokenController.updateCreateToken("github", user, token);
          //actualizar usuario
          user.github = true;
          user.id_github = usuarioOauth.id;
          user.save();
          return user;
        } else {
          return nuevoUsuario(usuarioOauth, token)
            .then(user => {
              console.log(user);
              TokenController.createToken("github", user, token);
              return user;
            })
            .catch(err => {
              console.log(err);
              return err;
            });
        }
      })
      .catch(err => {
        console.log(err);
        return err;
      });
  };
}

function addUser(usuario) {
  return function(userOauth) {
    return Usuario.findOne({
      where: {
        _id: usuario._id
      }
    })
      .then(user => {
        console.log("object", user);
        user.id_github = userOauth.id;
        user.github = true;
        user.save();
        return user;
      })
      .catch(err => {
        console.log("err", err);
        return err;
      });
  };
}

function refreshToken(code, usuario) {
  return new Promise((resolver, rechazar) => {
    let data = qs.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code: code
    });
    let promesa = fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: data
    });
    promesa
      .then(resp => {
        return resp.text();
      })
      .then(resp => {
        let token = qs.parse(resp).access_token;
        TokenController.updateCreateToken("github", usuario, token);
        resolver(token);
      })
      .catch(err => {
        rechazar(err);
      });
  });
}
//obtiene usuarioOauth de github
export function authLoginGithub(req, res) {
  authenticateGithub(req.params.code, res)
    .then(createUpdateUser())
    .then(result => {
      res.json({ usuario: result });
    })
    .catch(err => {
      res.send(err);
    });
}

export function authAddGithub(req, res) {
  let usuario = req.body.usuario;
  authenticateGithub(req.params.code, res)
    .then(addUser(usuario))
    .then(result => {
      res.json({ usuario: result });
    })
    .catch(err => {
      res.send(err);
    });
}

export function refreshGithub(req, res) {
  refreshToken(req.body.code, req.body.usuario)
    .then(
      token => {
        res.json({ token, usuario: req.body.usuario });
      },
      error => {
        console.log("error", error);
        res.send(error);
      }
    )
    .catch(err => {
      console.log("err:", err);
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
