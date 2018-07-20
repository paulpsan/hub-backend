"use strict";
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {
  // Sequelize connection opions
  sequelize: {
    uri: "postgresql://postgres:postgres@localhost/catalogo",
    // uri: 'postgresql://postgres:admin@localhost/hub',
    options: {
      timezone: "-04:00" //for writing to database
    }
  },

  github: {
    api_url: "https://api.github.com/",
    clientId: "deafb08eb71ea00e531c",
    clientSecret: "10fe3d839e76615964b8d52ebfe7219169825f57",
    callback: "http://localhost:4200/inicio"
  },
  gitlabGeo: {
    api_url: "https://gitlab.geo.gob.bo/api/v4/",
    clientId:
      "800b8fdad978c3f6bdd3e6e4ad535748cb38d24863e65218b2b2256e40ef9139",
    clientSecret:
      "272f3ddd82f15bb561c9cc34e44bfda2183100d4eb127a63dcc3529c181c1ac9",
    callback: "http://localhost:4200/inicio"
  },
  bitbucket: {
    api_url: "https://api.bitbucket.org/2.0/",
    clientId: "UEp5BUWsGZH9jAE962",
    clientSecret: "EPQf3yDRYtY5dGFS3BRndWHwTG6M9uMx",
    callback: "http://localhost:4200/inicio"
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

  // Seed database on startup
  //seedDB: true
};
