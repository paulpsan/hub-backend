"use strict";

import { Usuario } from "../sqldb";
import { Repositorio } from "../sqldb";
import { Commit } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import TokenController from "./token";
import qs from "querystringify";
import https from "https";
import Sequelize from "sequelize";
import request from "request";
// import { fetch } from "node-fetch";
var fetch = require("node-fetch");

let usuarioGitlab = {};
const agent = new https.Agent({
  rejectUnauthorized: false
});

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

function authenticateGitlab(code) {
  return new Promise((resolver, rechazar) => {
    let objRes = {};
    require("ssl-root-cas").inject();
    let data = qs.stringify({
      client_id: config.gitlabGeo.clientId,
      client_secret: config.gitlabGeo.clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: config.gitlabGeo.callback
    });
    fetch("https://gitlab.geo.gob.bo/oauth/token", {
      // fetch("https://gitlab.com/oauth/token", {
      method: "POST",
      agent,
      strictSSL: false,
      body: data
    })
      .then(getJson())
      .then(token => {
        objRes.token = token.access_token;
        fetch(
          "https://gitlab.geo.gob.bo/api/v4/user?access_token=" +
            token.access_token,
          { agent, strictSSL: false }
        )
          // fetch("https://gitlab.com/api/v4/user?access_token=" + token.access_token)
          .then(getJson())
          .then(responseGitlab => {
            resolver({
              token: objRes.token,
              usuario: responseGitlab
            });
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

function nuevoUsuario(usuarioOauth) {
  return new Promise((resolver, rechazar) => {
    let objGitlab = {};
    objGitlab.nombre = usuarioOauth.name;
    objGitlab.email = usuarioOauth.email;
    objGitlab.password = "";
    objGitlab.tipo = "gitlab";
    objGitlab.role = "usuario";
    objGitlab.login = usuarioOauth.login;
    objGitlab.cuentas = ["local", "gitlab"];
    objGitlab.avatar = usuarioOauth.avatar_url;
    objGitlab.url = usuarioOauth.html_url;
    objGitlab.gitlab = true;
    objGitlab.id_gitlab = usuarioOauth.id;
    Usuario.create(objGitlab)
      .then(respUsuario => {
        resolver(respUsuario);
      })
      .catch(err => {
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

export function singOauthGitlab(req, res) {
  let usuarioOauth = req.body.usuarioOauth;
  let token = req.body.token;
  const Op = Sequelize.Op;
  Usuario.findOne({
    where: {
      [Op.or]: [{ id_gitlab: usuarioOauth.id }, { email: usuarioOauth.email }]
    }
  })
    .then(user => {
      if (user !== null) {
        //eliminar password
        TokenController.updateCreateToken("gitlab", user, token);
        //actualizar usuario
        actualizaUsuario(user, usuarioOauth, token)
          .then(resUsuario => {
            res.json({ token: token, usuario: resUsuario });
          })
          .catch(err => {
            res.send(err);
          });
      } else {
        nuevoUsuario(usuarioOauth, token)
          .then(user => {
            TokenController.createToken("gitlab", user, token);
            res.json({ usuario: user, token: token });
          })
          .catch(err => {
            console.log(err);
            res.send(err);
          });
      }
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
}

export function authGitlab(req, res) {
  authenticateGitlab(req.params.code)
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

export function getMembers(req, res) {
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  let token = req.body.token;
  let idProyecto = req.params.id_proyecto;
  fetch(
    "https://gitlab.geo.gob.bo/api/v4/projects/" +
      idProyecto +
      "/members?access_token=" +
      token,
    { agent, strictSSL: false }
  )
    .then(response => {
      return response.json();
    })
    .then(response => {
      res.send(response);
    })
    .catch(err => {});
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

export function datosGitlab(req, res) {
  const agent = new https.Agent({
    rejectUnauthorized: false
  });
  let objetoUsuario = req.body.usuario;
  let token = req.body.token;
  fetch("https://gitlab.geo.gob.bo/api/v4/user?access_token=" + token, {
    agent,
    strictSSL: false
  })
    // fetch("https://gitlab.com/api/v4/user?access_token=" + token.access_token)
    .then(getJson())
    .then(usuario => {
      fetch(
        "https://gitlab.geo.gob.bo/api/v4/users/" +
          usuario.id +
          "/projects" +
          "?access_token=" +
          token,
        { agent, strictSSL: false }
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
                  "https://gitlab.geo.gob.bo/api/v4/projects/" +
                    repositorios[i].id +
                    "/repository/commits?access_token=" +
                    token,
                  { agent, strictSSL: false }
                )
                  .then(getJson())
                  .then(commits => {
                    let objRepositorio = {
                      id_repositorio: repositorios[i].id,
                      nombre: repositorios[i].name,
                      descripcion: repositorios[i].description || " ",
                      avatar: repositorios[i].avatar_url,
                      tipo: "gitlab",
                      estado: true,
                      html_url: repositorios[i].web_url,
                      git_url: repositorios[i].ssh_url_to_repo,
                      api_url: config.gitlabGeo.api_url + "projects/",
                      fork:
                        config.gitlabGeo.api_url +
                        "projects/" +
                        repositorios[i].id +
                        "/forks",
                      hooks:
                        config.gitlabGeo.api_url +
                        "projects/" +
                        repositorios[i].id +
                        "/hooks",
                      tags: repositorios[i].tag_list || " ",
                      issues:
                        config.gitlabGeo.api_url +
                        "projects/" +
                        repositorios[i].id +
                        "/issues",
                      branches:
                        config.gitlabGeo.api_url +
                        "projects/" +
                        repositorios[i].id +
                        "/repository/branches",
                      lenguajes:
                        config.gitlabGeo.api_url +
                          "projects/" +
                          repositorios[i].id +
                          "/languages" || "",
                      star: repositorios[i].star_count,
                      commits: commits,
                      downloads: "",
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
                            .then(resultRepo => {
                              // Crea commits de un repositorio
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
                            .catch(handleError(res));
                        } else {
                          Repositorio.create(objRepositorio)
                            .then(resultRepo => {
                              // Crea commits de un repositorio
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
                            .catch(handleError(res));
                        }
                      })
                      .catch(handleError(res));

                    objDatos.push({
                      lenguajes: "",
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
                    tipo: "gitlab"
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
    });
}
