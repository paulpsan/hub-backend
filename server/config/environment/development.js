'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // Sequelize connection opions
  sequelize: {
    uri: 'postgresql://postgres:postgres@localhost/hub',
    //uri: 'postgresql://postgres:postgres@localhost/hub',
    options: {
    }
  },

  // Seed database on startup
  //seedDB: true

};
