"use strict";
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {
  // Sequelize connection opions
  sequelize: {
    uri: "postgresql://postgres:postgres@localhost/hub",
    // uri: 'postgresql://postgres:admin@localhost/hub',
    options: {}
  },

  github: {
    clientId: "deafb08eb71ea00e531c",
    clientSecret: "10fe3d839e76615964b8d52ebfe7219169825f57"
  },
  gitlab_geo: {
    clientId:
      "800b8fdad978c3f6bdd3e6e4ad535748cb38d24863e65218b2b2256e40ef9139",
    clientSecret:
      "272f3ddd82f15bb561c9cc34e44bfda2183100d4eb127a63dcc3529c181c1ac9"
  },
  bitbucket: {
    clientId: "UEp5BUWsGZH9jAE962",
    clientSecret: "EPQf3yDRYtY5dGFS3BRndWHwTG6M9uMx"
  }
  // Seed database on startup
  //seedDB: true
};