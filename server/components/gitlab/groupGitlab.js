"use strict";

import Gitlab from "gitlab";
import config from "../../config/environment"
var fetch = require("node-fetch");

const api = new Gitlab({
  url: `${config.repo.gitlab.domain}/`, // Defaults to http://gitlab.com
  token: config.repo.gitlab.privateToken // Can be created in your profile.
});
class GroupGitlab {
  static create(grupo) {
    return new Promise((resolve, reject) => {
      let data = qs.stringify({
        name: "prueba",
        path: "",
        description: "esto es una prueba",
        visibility: 'private',
        request_access_enabled:false
      });
      api.Groups.create(data)
        .then(resp => {
          console.log("grups",resp);
          resolve(resp);
        })
        .catch(err => {
          console.log("****err***",err);
          reject(err);
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
export default GroupGitlab;