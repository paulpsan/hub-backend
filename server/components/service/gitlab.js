"use strict";

import qs from "querystringify";
import https from "https";
var fetch = require("node-fetch");

class Gitlab {
  static createGitlabUser(url, token, user) {
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
    });
  }
}
export default Gitlab;

const agent = new https.Agent({
  rejectUnauthorized: false
});

function getJson() {
  return function (resultado) {
    console.log(resultado);
    return resultado.json();
  };
}