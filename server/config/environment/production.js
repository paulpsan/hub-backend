"use strict";
/*eslint no-process-env:0*/

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  sequelize: {
    // uri: "postgresql://postgres:postgres@localhost/hub",
    uri: "postgresql://postgres:admin@localhost/hub",
    options: {
      timezone: "-04:00" //for writing to database
    }
  },

  github: {
    api_url: "https://api.github.com/",
    clientId: "becb33a39e525721517c",
    clientSecret: "36338cdf7057d2086495a241fa3d053766da55c1",
    callbackURL: "https://test.adsib.gob.bo/softwarelibre/inicio"
  },
  gitlab: {
    api_url: "https://gitlab.com/api/v4/",
    token_url:"https://gitlab.com/oauth/token",
    clientId:
      "bc4486e353751b8bcbad14732a0d3626bdd9ef259534b7dfc0376c4baa5c75c6",
    clientSecret:
      "9ac3cc5c3c49e10cb14a268158f2b3ffa4c70a8df9a1c22c81d239e4bbce494f",
    callback: "https://test.adsib.gob.bo/softwarelibre/inicio"
  },
  gitlabGeo: {
    api_url: "https://gitlab.geo.gob.bo/api/v4/",
    token_url:"https://gitlab.geo.gob.bo/oauth/token",
    clientId:
      "5fd3c547dbc17e2d3f77a0c81a4fae588d3f31007f626a64489814d3900a315d",
    clientSecret:
      "f08b68a537601fa7e0aab9d013c4f312d64adfc8d2967a1445cac741229c0a2f",
    state: "gitlab",
    callback: "https://test.adsib.gob.bo/softwarelibre/inicio"
  },
  bitbucket: {
    api_url: "https://api.bitbucket.org/2.0/",
    clientId: "QV8hxhkL5taXdTpUgB",
    clientSecret: "W64vs8X2f3V3PNZq8EaU3gL4yV8YPAHQ",
    callback: "https://test.adsib.gob.bo/softwarelibre/inicio"
  },
  factorGithub: {
    downloads: 0.2,
    stars: 0.2,
    forks: 0.2,
    issues: 0.2,
    commit: 0.2
  },
  factorGitlab: {
    stars: 0.2,
    forks: 0.2,
    issues: 0.2,
    commit: 0.2
  },
  factorBitbucket: {
    downloads: 0.2,
    forks: 0.2,
    issues: 0.2,
    commit: 0.2
  }
};
