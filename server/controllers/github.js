"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import https from "https";
import request from "request";
// import { fetch } from "node-fetch";
var fetch = require("node-fetch");

function authenticate(code, cb) {
  let result = new Object();
  let data = qs.stringify({
    client_id: config.Github.oauth_client_id,
    client_secret: config.Github.oauth_client_secret,
    code: code
  });

  let reqOptions = {
    host: config.Github.oauth_host,
    port: config.Github.oauth_port,
    path: config.Github.oauth_path,
    method: config.Github.oauth_method,
    headers: { "content-length": data.length }
  };

  let body = "";
  let req = https.request(reqOptions, function(res) {
    res.setEncoding("utf8");
    res.on("data", function(chunk) {
      body += chunk;
    });
    res.on("end", () => {
      console.log("token datos", qs.parse(body).access_token);

      result.token = qs.parse(body).access_token;
      let options = {
        host: "api.github.com",
        path: "/user?access_token=" + qs.parse(body).access_token,
        method: "GET",
        headers: {
          "user-Agent": "hub-software"
        }
      };
      //cambiar por callbacks
      https
        .request(options, response => {
          let bodyUsuario = "";
          response.on("data", out => {
            bodyUsuario += out;
          });
          response.on("end", out => {
            let json = JSON.parse(bodyUsuario);
            // console.log(json);
            result.usuario = {
              nombre: json.name,
              email: json.email,
              tipo: "github",
              login: json.login,
              avatar: json.avatar_url
            };

            if (result.token != null && result.usuario.nombre != null) {
              console.log("envio datos", json);
              create(json, resp => {
                result.usuario.datos = resp;
                cb(null, result);
              });
            }

            // Guardar en la base de datos
            // console.log(result);
          });
        })
        .on("error", e => {
          console.error(e);
        })
        .end();
    });
  });
  req.write(data);
  req.end();
  req.on("error", function(e) {
    cb(e.message);
  });
}

function create(objeto, callback) {
  let objetoUsuario = new Object();
  objetoUsuario.nombre = objeto.name;
  objetoUsuario.email = objeto.email;
  objetoUsuario.password = "github";
  objetoUsuario.tipo = "github";
  objetoUsuario.role = "usuario";
  objetoUsuario.login = objeto.login;

  //cargamos la clasificacion y commits
  getComits(objeto, resp => {
    callback(resp);
    console.log("rspuesta:", resp);
    objetoUsuario.datos = resp;
    return Usuario.create(objetoUsuario)
      .then(res => {
        // console.log("usuario creado", res);
        return res;
      })
      .catch(err => {
        console.log("error", err);
        return err;
      });
  });
}

function getComits(obj, callback) {
  // console.log("rep:", obj.repos_url);
  if (obj.repos_url) {
    let options = {
      url: obj.repos_url,
      headers: {
        "user-Agent": "hub-software"
      }
    };
    request(options, (error, response, body) => {
      let repo = JSON.parse(body);
      let objetoRes = [];
      let i = 1;
      if (repo.length > 0) {
        for (let value of repo) {
          let objLenguajes = {};
          let objCommits = {};
          if (value.languages_url) {
            let options = {
              url: value.languages_url,
              headers: {
                "user-Agent": "hub-software"
              }
            };
            request(options, (error, response, body) => {
              let lenguajes = JSON.parse(body);
              objLenguajes = lenguajes;

              // if (Object.keys(lenguajes).length != 0) {

              //   if (Object.keys(lenguajes).length === 1) {
              //     objLenguajes=lenguajes;
              //   }
              //   totalLenguajes = totalLenguajes.concat(Object.keys(lenguajes));
              //   console.log("lenguajes ", totalLenguajes);
              // } else {
              //   objLenguajes = {};
              // }
            });

            options.url =
              "https://api.github.com/repos/" + value.full_name + "/commits";
            let totalCommits = 0;
            request(options, (error, response, body) => {
              let commits = JSON.parse(body);
              totalCommits += commits.length;

              objetoRes.push({
                lenguajes: objLenguajes,
                repo: value.name,
                commits: totalCommits
              });
              if (i == repo.length) {
                callback(objetoRes);
              }
              i++;
            });

            //   console.log("repo ", value.languages_url);
          }
          //aqui adicionamos
        }
      }

      console.log("rspuesta:", objetoRes);
    });
  }
}

// export function authGithub(req, res) {
//   authenticate(req.params.code, function(err, result) {
//     if (err || !result.token) {
//       result.error = err || "bad_code";
//       console.log(result.error);
//     }
//     res.json(result);
//   });
// }

let authenticateGitgub = code => {
  return new Promise((res, rej) => {
    let data = qs.stringify({
      client_id: config.Github.oauth_client_id,
      client_secret: config.Github.oauth_client_secret,
      code: code
    });
    let objRes = {};
    let promesa = fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: data
    });
    promesa
      .then(response => {
        return response.text();
      })
      .then(token => {
        objRes.token = qs.parse(token).access_token;

        fetch("https://api.github.com/user?access_token=" + objRes.token)
          .then(res => {
            return res.json();
          })
          .then(json => {
            console.log("user",json)
            let objetoUsuario = {};
            objetoUsuario.nombre = json.name;
            objetoUsuario.email = json.email;
            objetoUsuario.password = "github";
            objetoUsuario.tipo = "github";
            objetoUsuario.role = "usuario";
            objetoUsuario.login = json.login;
            if (json.repos_url) {
              fetch(json.repos_url)
                .then(res => {
                  return res.json();
                })
                .then(repositorios => {
                  console.log("repos",repositorios.length);
                  let i = 1;
                  let objetoRes = [];
                  if (repositorios.length > 0) {
                    for (let value of repositorios) {

                      let objLenguajes = {};
                      let objCommits = {};
                      if (value.languages_url) {
                        fetch(value.languages_url)
                          .then(res => {
                            return res.json();
                          })
                          .then(lenguajes => {
                            objLenguajes = lenguajes;
                            console.log("lenguaje",lenguajes);
                            fetch(
                              "https://api.github.com/repos/" +
                                value.full_name +
                                "/commits"
                            )
                              .then(res => {
                                return res.json();
                              })
                              .then(commits => {
                                console.log("comits",commits);
                                objetoRes.push({
                                  lenguajes: objLenguajes,
                                  repo: value.name,
                                  commits: commits.length
                                });
                                if (i == repositorios.length) {
                                  console.log(objetoRes);
                                  res(objetoRes);
                                }
                                i++;
                              });
                          })
                          .catch(err => {
                            console.log(err);
                          });
                      }
                    }
                  }
                })
                .catch(err => {
                  console.log(err);
                });
            }
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        rej(err);
      });
  });
};

export function authGithub(req, res) {
  authenticateGitgub(req.params.code)
    .then(
      result => {
        res.json(result);
      },
      error => {
        res.send(error);
      }
    )
    .catch(err => {
      console.log(err);
    });
}
