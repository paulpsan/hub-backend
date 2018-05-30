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
    clientId: "becb33a39e525721517c",
    clientSecret: "36338cdf7057d2086495a241fa3d053766da55c1",
    state: "github",
    callbackURL: "https://test.adsib.gob.bo/softwarelibre/inicio"
  },
  gitlabGeo: {
    clientId:
      "5fd3c547dbc17e2d3f77a0c81a4fae588d3f31007f626a64489814d3900a315d",
    clientSecret:
      "f08b68a537601fa7e0aab9d013c4f312d64adfc8d2967a1445cac741229c0a2f",
    state: "gitlab",
    callback: "https://test.adsib.gob.bo/softwarelibre/inicio"
  },
  bitbucket: {
    clientId: "QV8hxhkL5taXdTpUgB",
    clientSecret: "W64vs8X2f3V3PNZq8EaU3gL4yV8YPAHQ",
    state: "bitbucket",
    callback: "https://test.adsib.gob.bo/softwarelibre/inicio"
  }
};
