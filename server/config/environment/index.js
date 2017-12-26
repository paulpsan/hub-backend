'use strict';
/*eslint no-process-env:0*/

import path from 'path';
import _ from 'lodash';

const all = {
    env: process.env.NODE_ENV,
  
    // Root path of server
    root: path.normalize(`${__dirname}/../../..`),
  
    // Browser-sync port
    browserSyncPort: process.env.BROWSER_SYNC_PORT || 3000,
  
    // Server port
    port: process.env.PORT || 3000,
  
    // Server IP
    ip: process.env.IP || '0.0.0.0',
  
    // Should we populate the DB with sample data?
    seedDB: true,
  
    // Secret for session, you will want to change this and make it an environment variable
    secrets: {
      session: 'bolivia-hub-backend-secret'
    },

    Github:{
      oauth_client_id: "becb33a39e525721517c",
      oauth_client_secret: "36338cdf7057d2086495a241fa3d053766da55c1",
      oauth_host: "github.com",
      oauth_port: 443,
      oauth_path: "/login/oauth/access_token",
      oauth_method: "POST",
      usuarios_method:"GET",
      url_usuarios:"https://api.github.com/user",
      url_proyectos:"",

      
    },
    Gitlab:{
      aplication_id:"5fd3c547dbc17e2d3f77a0c81a4fae588d3f31007f626a64489814d3900a315d",
      client_secret:"f08b68a537601fa7e0aab9d013c4f312d64adfc8d2967a1445cac741229c0a2f",
      callback_url:"http://localhost:4200/login",
    },

    // Gitlab:{
    //   aplication_id:"68b23d8cc8bdf2e9414f2b486456596bbd23e9d44e1c56c16e91298747b94485",
    //   client_secret:"99cca0cab45bf79a844763ec81db38e34915cbb8e8a5f6006a097707c4278d5b",
    //   callback_url:"http://localhost:4200/auth/gitlab/callback",
    // }
  };
  
  // Export the config object based on the NODE_ENV
  // ==============================================
  module.exports = _.merge(
    all,
    require(`./${process.env.NODE_ENV}.js`) || {});