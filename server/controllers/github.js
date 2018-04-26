"use strict";

import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import qs from "querystringify";
import https from "https";
import request from "request";
// import { fetch } from "node-fetch";
var fetch = require("node-fetch");
let objetoUsuario = {};
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
function crearActualizarUsuario() {
  return function(usuarioGithub) {
    console.log("crearActualiza", usuarioGithub);

    return Usuario.findOne({
      where: {
        login: usuarioGithub.name,
        tipo: "github"
      }
    }).then(user => {
      if (user !== null) {
        //colocar modelo de usuario
        return Usuario.update(objetoUsuario, {
          where: {
            _id: user._id
          }
        })
          .then(resp => {
            return usuarioGithub;
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        return Usuario.create(objetoUsuario)
          .then(resp => {
            objetoUsuario._id = resp._id;
            console.log("res", resp);

            return usuarioGithub;
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
  };
}

// function getRepositorio(usuario) {
//   console.log("Usuario :", usuario);
//   if (usuario.repos_url) {
//     fetch(usuario.repos_url + headersClient)
//       .then(getJson())
//       .then(repositorios => {
//         // console.log("repos", repositorios);
//         let i = 1;
//         let objDatos = [];
//         if (repositorios.length > 0) {
//           for (let value of repositorios) {
//             let objLenguajes = {};
//             let objCommits = {};
//             if (value.languages_url) {
//               fetch(value.languages_url + headersClient)
//                 .then(getJson())
//                 .then(lenguajes => {
//                   // console.log("lenguaje",lenguajes);
//                   objLenguajes = lenguajes;
//                   fetch(
//                     "https://api.github.com/repos/" +
//                       value.full_name +
//                       "/commits" +
//                       headersClient
//                   )
//                     .then(getJson())
//                     .then(commits => {
//                       objDatos.push({
//                         lenguajes: objLenguajes,
//                         repo: value,
//                         commits: commits
//                       });
//                       // console.log("obj", objDatos);
//                       if (i == repositorios.length) {
//                         objetoUsuario.datos = objDatos;
//                         objRes.usuario = objetoUsuario;

//                         Usuario.findOne({
//                           where: {
//                             email: objRes.usuario.email.toLowerCase(),
//                             tipo: objRes.usuario.tipo
//                           }
//                         })
//                           .then(user => {
//                             // console.log("entity", user);
//                             if (user != null) {
//                               return user.destroy().then();
//                             }
//                           })
//                           .then(() => {
//                             return Usuario.create(objRes.usuario);
//                           })
//                           .catch(err => {
//                             console.log(err);
//                           });
//                         // res(objRes);
//                       }
//                       i++;
//                       //creamnos usuario si no existe
//                     })
//                     .catch(err => {
//                       console.log(err);
//                     });
//                 })
//                 .catch(err => {
//                   console.log(err);
//                 });
//             }
//           }
//         }
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
// }

let authenticateGithub = code => {
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
      .then(response => {
        return response.text();
      })
      .then(token => {
        objRes.token = qs.parse(token).access_token;
        if (objRes.token) {
          fetch("https://api.github.com/user?access_token=" + objRes.token)
            .then(getJson())
            .then(json => {
              console.log("user", json);
              objetoUsuario.nombre = json.name;
              objetoUsuario.email = json.email;
              objetoUsuario.password = "github";
              objetoUsuario.tipo = "github";
              objetoUsuario.role = "usuario";
              objetoUsuario.login = json.login;
              objetoUsuario.avatar = json.avatar_url;
              objetoUsuario.repos_url = json.repos_url;
              objetoUsuario.token = objRes.token;
              return json;
            })
            .then(crearActualizarUsuario())
            .then(json => {
              // getDatosRepositorio(json);
              resolver({
                token: objRes.token,
                usuario: objetoUsuario
              });
            })
            .catch(err => {
              console.log(err);
            });
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
};

export function authGithub(req, res) {
  authenticateGithub(req.params.code)
    .then(
      result => {
        console.log("191: ", result);
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
