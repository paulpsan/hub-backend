"use strict";

import qs from "querystringify";
import https from "https";
import config from "../../config/environment"
var fetch = require("node-fetch");

class User {
  static createGitlab(user) {
    const url = `${config.repo.gitlab.domain}/api/v4/users`;
    const token = config.repo.gitlab.privateToken;
    return new Promise((resolver, rechazar) => {
      let data = qs.stringify({
        name: user.nombre,
        username: user.login,
        email: user.email,
        password: user.password,
        // skip_confirmation: true
      });
      console.log(`${url}?private_token=${token}`);
      fetch(`${url}?private_token=${token}`, {
          method: "POST",
          body: data
        })
        .then(getJson())
        .then(resp => {
          console.log(resp);
          if (resp.message) {
            rechazar(resp.message)
          } else {
            resolver(resp)
          }

        })
        .catch(err => {
          console.log(err);
          rechazar(err);
        });
    });
  }
  static createProject() {
    const url = `${config.repo.gitlab.domain}/api/v4/projects/user/`
    return new Promise((resolver, rechazar) => {
      let data = qs.stringify({
        name: user.nombre,
        username: user.username,
        email: user.email,
        password: user.password,
        skip_confirmation: true
      });
      console.log(`${url}?private_token=${token}`);
      fetch(`${url}?private_token=${token}`, {
          method: "POST",
          body: data
        })
        .then(getJson())
        .then(resp => {
          console.log(resp);
          resolver(resp)
        })
        .catch(err => {
          console.log(err);
          rechazar(err);
        });
    })
  }
}
export default User;

const agent = new https.Agent({
  rejectUnauthorized: false
});

function getJson() {
  return function (resultado) {
    return resultado.json();
  };
}