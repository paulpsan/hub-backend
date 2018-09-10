"use strict";

import config from "../../config/environment";
import Gitlab from "gitlab";
var fetch = require("node-fetch");

function getJson() {
  return function(resultado) {
    console.log(resultado);
    return resultado.json();
  };
}
function search(data) {
  return new Promise((resolve, reject) => {
    api.Users.search(data)
      .then(user => {
        console.log("user++++",user);
        if (user.length !== 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

const api = new Gitlab({
  url: `${config.repo.gitlab.domain}/`, // Defaults to http://gitlab.com
  token: config.repo.gitlab.privateToken // Can be created in your profile.
});

class UserGitlab {
  static get() {
    return new Promise((resolve, reject) => {
      api.Users.all()
        .then(user => {
          resolve(user);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static create(user) {
    return new Promise((resolve, reject) => {
      let data = {
        name: user.nombre,
        username: user.login,
        email: user.email,
        password: user.password,
        skip_confirmation: true
      };

      api.Users.create(data)
        .then(user => {
          console.log("user",user);
          resolve(user);
        })
        .catch(err => {
          console.log("err",err);
          reject(err);
        });
    });
  }
  //busca email o username y devuelve true si encuentra
  static verifyUserEmail(usuario) {
    return new Promise((resolve, reject) => {
      search(usuario.login)
        .then(resp => {
          if (resp) {
            reject({ message: "El Username ya existe!!" });
          }
          search(usuario.email).then(response => {
            if (response) {
              reject({ message: "El Email ya existe!!" });
            }else{
              resolve(true);
            }
          });
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  }

  static update(user) {
    return new Promise((resolve, reject) => {
      let data = {
        name: "paul",
        username: "paul",
        email: "paulp@gmail.com",
        password: "12345678",
        skip_confirmation: false
      };

      api.Users.create(data)
        .then(user => {
          console.log(user);
          resolve(user);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  }

  static put() {
    const url = `${config.repo.gitlab.domain}/api/v4/users/3`;
    const token = config.repo.gitlab.privateToken;
    return new Promise((resolver, rechazar) => {
      let data = {
        password: "123",
        confirm: true,
        skip_reconfirmation: true
      };
      fetch(`${url}?private_token=${token}`, {
        method: "PUT",
        body: data
      })
        .then(getJson())
        .then(resp => {
          console.log("eqwe", resp);
          resolver(resp);
        })
        .catch(err => {
          console.log("dads", err);
          rechazar(err);
        });
    });
  }
}
export default UserGitlab;
