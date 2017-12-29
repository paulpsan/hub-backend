"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import https from "https";
import request from "request";
// import { fetch } from "node-fetch";
var fetch = require("node-fetch");

const agent = new https.Agent({
  rejectUnauthorized: false
});

let authenticateGitlab = code => {
  return new Promise((res, rej) => {
    require("ssl-root-cas").inject();
    let headersClient = qs.stringify(
      {
        client_id:
          "5fd3c547dbc17e2d3f77a0c81a4fae588d3f31007f626a64489814d3900a315d",
        client_secret:
          "f08b68a537601fa7e0aab9d013c4f312d64adfc8d2967a1445cac741229c0a2f"
      },
      // {
      //   client_id: "5fd3c547dbc17e2d3f77a0c81a4fae588d3f31007f626a64489814d3900a315d",
      //   client_secret: "f08b68a537601fa7e0aab9d013c4f312d64adfc8d2967a1445cac741229c0a2f"
      // },
      true
    );
    let data = qs.stringify({
      client_id: config.Gitlab.aplication_id,
      client_secret: config.Gitlab.client_secret,
      code: code,
      grant_type: "authorization_code",
      // redirect_uri: "https://test.adsib.gob.bo/softwarelibre/inicio"
      redirect_uri: "http://localhost:4200/inicio"
    });

    console.log(data);
    let objRes = {};
    fetch("https://gitlab.geo.gob.bo/oauth/token", {
      // fetch("https://gitlab.com/oauth/token", {
      method: "POST",
      agent,
      strictSSL: false,
      body: data
    })
      .then(response => {
        return response.json();
      })
      .then(token => {
        console.log(token);
        objRes.token = token.access_token;
        //desde aqui
        fetch(
          "https://gitlab.geo.gob.bo/api/v4/user?access_token=" +
            token.access_token,
          { agent, strictSSL: false }
        )
          // fetch("https://gitlab.com/api/v4/user?access_token=" + token.access_token)
          .then(res => {
            return res.json();
          })
          .then(usuarioGitlab => {
            console.log("user", usuarioGitlab);
            let objetoUsuario = {};
            objetoUsuario.nombre = usuarioGitlab.name;
            objetoUsuario.email = usuarioGitlab.email;
            objetoUsuario.password = "gitlab";
            objetoUsuario.tipo = "gitlab";
            objetoUsuario.role = "usuario";
            objetoUsuario.login = usuarioGitlab.username;
            objetoUsuario.avatar = usuarioGitlab.avatar_url;
            objRes.usuario = objetoUsuario;

            fetch(
              "https://gitlab.geo.gob.bo/api/v4/users/" +
                usuarioGitlab.id +
                "/projects?access_token=" +
                token.access_token,
              { agent, strictSSL: false }
            )
              .then(res => {
                return res.json();
              })
              .then(repositorios => {
                console.log("repos", repositorios);
                let i = 1;
                let objDatos = [];
                if (repositorios.length > 0) {
                  for (let value of repositorios) {
                    let objCommits = {};
                    let members;

                    fetch(
                      "https://gitlab.geo.gob.bo/api/v4/projects/" +
                        value.id +
                        "/repository/commits?access_token=" +
                        token.access_token,
                      { agent, strictSSL: false }
                    )
                      .then(res => {
                        return res.json();
                      })
                      .then(commits => {
                        fetch(
                          "https://gitlab.geo.gob.bo/api/v4/projects/" +
                            value.id +
                            "/members?access_token=" +
                            token.access_token,
                          { agent, strictSSL: false }
                        )
                          .then(response => {
                            return response.json();
                          })
                          .then(response => {
                            members = response;
                            console.log("commits", commits.length);
                            objDatos.push({
                              repo: value,
                              commits: commits,
                              members: members
                            });
                            if (i == repositorios.length) {
                              objetoUsuario.datos = objDatos;
                              objRes.usuario = objetoUsuario;
                              console.log("resultado", objRes);
                              Usuario.findOne({
                                where: {
                                  email: objRes.usuario.email.toLowerCase(),
                                  tipo: objRes.usuario.tipo
                                }
                              })
                                .then(user => {
                                  // console.log("entity", user);
                                  if (user != null) {
                                    return user.destroy().then();
                                  }
                                })
                                .then(() => {
                                  return Usuario.create(objRes.usuario).then(
                                    response => {
                                      res({
                                        token: objRes.token,
                                        usuario: response
                                      });
                                    }
                                  );
                                })
                                .catch(err => {
                                  console.log(err);
                                });
                            }
                            i++;
                          });
                      });
                  }
                }
              })
              .catch(err => {
                rej(err);
              });
          })
          .catch(err => {
            rej(err);
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
        rej(err);
      });
  });
};

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
      console.log(err);
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
      console.log("res", response);
      res.send(response);
    });
}
