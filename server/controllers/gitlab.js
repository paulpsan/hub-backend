"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import https from "https";
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

function crearActualizarUsuario(response) {
  return function(responseGitlab) {
    return Usuario.findOne({
      where: {
        login: responseGitlab.username,
        tipo: "gitlab"
      }
    })
      .then(user => {
        console.log(user);
        if (user !== null) {
          //colocar modelo de usuario
          return Usuario.update(usuarioGitlab, {
            where: {
              _id: user._id
            }
          })
            .then(resp => {
              return responseGitlab;
            })
            .catch(err => {
              return response.send(err);
            });
        } else {
          return Usuario.create(usuarioGitlab)
            .then(resp => {
              usuarioGitlab._id = resp._id;
              return responseGitlab;
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

function authenticateGitlab(code, response) {
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
            console.log("user", responseGitlab);
            usuarioGitlab.nombre = responseGitlab.name;
            usuarioGitlab.email = responseGitlab.email;
            usuarioGitlab.password = "gitlab";
            usuarioGitlab.tipo = "gitlab";
            usuarioGitlab.role = "usuario";
            usuarioGitlab.login = responseGitlab.username;
            usuarioGitlab.avatar = responseGitlab.avatar_url;
            usuarioGitlab.url = responseGitlab.web_url;
            usuarioGitlab.token = objRes.token;
            return responseGitlab;
          })
          .then(crearActualizarUsuario(response))
          .then(responseGitlab => {
            delete usuarioGitlab.password;
            resolver({
              token: objRes.token,
              usuario: usuarioGitlab
            });
          })
          .catch(err => {
            rechazar(err);
          });
      })
      .catch(err => {
        rej(err);
      });
  });
}

//   fetch(
//     "https://gitlab.geo.gob.bo/api/v4/users/" +
//       responseGitlab.id +
//       "/projects?access_token=" +
//       token.access_token,
//     { agent, strictSSL: false }
//   )
//     .then(getJson())
//     .then(repositorios => {
//       console.log("repos", repositorios);
//       let i = 1;
//       let objDatos = [];
//       if (repositorios.length > 0) {
//         for (let value of repositorios) {
//           let objCommits = {};
//           let members;

//           fetch(
//             "https://gitlab.geo.gob.bo/api/v4/projects/" +
//               value.id +
//               "/repository/commits?access_token=" +
//               token.access_token,
//             { agent, strictSSL: false }
//           )
//             .then(getJson())
//             .then(commits => {
//               fetch(
//                 "https://gitlab.geo.gob.bo/api/v4/projects/" +
//                   value.id +
//                   "/members?access_token=" +
//                   token.access_token,
//                 { agent, strictSSL: false }
//               )
//                 .then(getJson())
//                 .then(response => {
//                   members = response;
//                   console.log("commits", commits.length);
//                   objDatos.push({
//                     repo: value,
//                     commits: commits,
//                     members: members
//                   });
//                   if (i == repositorios.length) {
//                     usuarioGitlab.datos = objDatos;
//                     objRes.usuario = usuarioGitlab;
//                     console.log("resultado", objRes);
//                     Usuario.findOne({
//                       where: {
//                         email: objRes.usuario.email.toLowerCase(),
//                         tipo: objRes.usuario.tipo
//                       }
//                     })
//                       .then(user => {
//                         // console.log("entity", user);
//                         if (user != null) {
//                           return user.destroy().then();
//                         }
//                       })
//                       .then(() => {
//                         return Usuario.create(objRes.usuario).then(
//                           response => {
//                             res({
//                               token: objRes.token,
//                               usuario: response
//                             });
//                           }
//                         );
//                       })
//                       .catch(err => {
//                         console.log(err);
//                       });
//                   }
//                   i++;
//                 })
//                 .catch(err => {
//                   console.log(err);
//                 });
//             })
//             .catch(err => {
//               console.log(err);
//             });
//         }
//       }
//     })
//     .catch(err => {
//       rej(err);
//     });
// })
// .catch(err => {
//   rej(err);
//   console.log(err);
// });

export function authGitlab(req, res) {
  authenticateGitlab(req.params.code)
    .then(
      result => {
        console.log("result:", result);
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
      console.log("res", response);
      res.send(response);
    })
    .catch(err => {
      console.log(err);
    });
}
