"use strict";
import { Usuario } from "../sqldb";
import { Repositorio } from "../sqldb";
import { Commit } from "../sqldb";
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
        console.log("objRes", objRes);
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
    console.log("-----usuarioOauth---------", usuarioOauth);
    return Usuario.create(objGithub)
      .then(respUsuario => {
        resolver(respUsuario);
        return;
      })
      .catch(err => {
        console.log(err);
        rechazar(err);
        return;
      });
  });
}

export function singOauthGithub(req, res) {
  let usuarioOauth = req.body.usuarioOauth;
  let token = req.body.token;
  Usuario.findOne({
    where: {
      id_github: usuarioOauth.id
    }
  })
    .then(user => {
      // console.log(user);
      if (user !== null) {
        //eliminar password
        //update token
        TokenController.updateCreateToken("github", user, token);
        res.json({ token: token, usuario: user });
        return;
      } else {
        console.log("------usuarioOauth--------", usuarioOauth);
        return nuevoUsuario(usuarioOauth, token)
          .then(result => {
            TokenController.createToken("github", result, token);
            res.json({ usuario: result, token: token });
          })
          .catch(err => {
            console.log(err);
            res
              .status(500)
              .json(err)
              .end();
          });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json(err)
        .end();
    });
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
